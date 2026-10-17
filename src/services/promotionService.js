const mongoose = require('mongoose');
const validator = require('validator');
const Employee = require('../model/employee');
const EmployeePromotion = require('../model/employeePromotion');
const User = require('../model/user');
const eventEmitter = require('../events/eventemitters');
const AppError = require('../utils/AppError');
const { runInTransaction } = require('../utils/transaction');
const { PROMOTABLE_LEVELS, EMPLOYEE_PROMOTED } = require('../utils/constants');

const MAX_BULK_PROMOTIONS = 50;

const validatePromotion = ({
  employeeId,
  newDesignation,
  newLevel,
  newSalary,
  effectiveDate,
  expectedDesignation,
}) => {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new AppError('A valid employee id is required', 400);
  }
  const designation = newDesignation?.trim();
  if (
    typeof designation !== 'string' ||
    !validator.isLength(designation, { min: 2, max: 35 })
  ) {
    throw new AppError('New designation must be 2-35 characters', 422);
  }
  if (!PROMOTABLE_LEVELS.includes(newLevel)) {
    throw new AppError(
      `Level must be one of ${PROMOTABLE_LEVELS.join(', ')}`,
      422
    );
  }
  // Required so concurrent promotions of the same employee are detected.
  if (typeof expectedDesignation !== 'string' || !expectedDesignation.trim()) {
    throw new AppError('expectedDesignation is required', 422);
  }
  if (
    newSalary !== undefined &&
    newSalary !== null &&
    newSalary !== '' &&
    !(Number.isFinite(Number(newSalary)) && Number(newSalary) >= 0)
  ) {
    throw new AppError('Salary must be a non-negative number', 422);
  }
  const promotedOn = effectiveDate ? new Date(effectiveDate) : new Date();
  if (Number.isNaN(promotedOn.getTime())) {
    throw new AppError('Effective date is invalid', 422);
  }
  if (promotedOn > new Date()) {
    throw new AppError('Effective date cannot be in the future', 422);
  }
  return {
    employeeId,
    designation,
    level: newLevel,
    salary:
      newSalary === undefined || newSalary === null || newSalary === ''
        ? undefined
        : Number(newSalary),
    promotedOn,
    expectedDesignation: expectedDesignation.trim(),
  };
};

// Employee is the source of truth; User.designation and the promotion history are
// written in the same transaction so the three can never disagree.
const promoteEmployee = async (input, actor) => {
  const promotion = validatePromotion(input);
  const result = await runInTransaction(async (session) => {
    const update = {
      designation: promotion.designation,
      level: promotion.level,
      ...(promotion.salary !== undefined && { salary: promotion.salary }),
    };
    const previous = await Employee.findOneAndUpdate(
      {
        _id: promotion.employeeId,
        designation: promotion.expectedDesignation,
      },
      { $set: update },
      { session, runValidators: true, returnDocument: 'before' }
    ).lean();

    if (!previous) {
      const current = await Employee.findById(promotion.employeeId)
        .select('designation')
        .session(session)
        .lean();
      if (!current) {
        throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
      }
      throw new AppError(
        `Designation was changed to "${current.designation}" by someone else. Reload and try again.`,
        409,
        'PROMOTION_CONFLICT'
      );
    }
    if (
      previous.designation === promotion.designation &&
      previous.level === promotion.level
    ) {
      throw new AppError(
        'New designation or level must differ from the current one',
        422,
        'NO_CHANGE'
      );
    }

    await User.updateOne(
      { email: previous.email },
      { $set: { designation: promotion.designation } },
      { session, runValidators: true }
    );

    const [record] = await EmployeePromotion.create(
      [
        {
          employeeId: previous._id,
          previousDesignation: previous.designation,
          currentDesignation: promotion.designation,
          previousLevel: previous.level,
          currentLevel: promotion.level,
          previousSalary: previous.salary,
          currentSalary: promotion.salary ?? previous.salary,
          promotedBy: actor?._id,
          promotedOn: promotion.promotedOn,
        },
      ],
      { session }
    );

    return { promotion: record.toObject(), employee: previous };
  });

  // Emitted only after commit so listeners never see rolled-back data.
  eventEmitter.emit(EMPLOYEE_PROMOTED, {
    adminId: actor?._id,
    employeeId: result.employee._id,
    employeeName: result.employee.name,
    employeeEmail: result.employee.email,
    previousDesignation: result.promotion.previousDesignation,
    currentDesignation: result.promotion.currentDesignation,
    currentLevel: result.promotion.currentLevel,
  });

  return { promotion: result.promotion };
};

// Each promotion commits independently so one conflict doesn't block the rest.
const promoteEmployees = async (requests, actor) => {
  if (!Array.isArray(requests) || requests.length === 0) {
    throw new AppError('Provide a non-empty array of promotions', 400);
  }
  if (requests.length > MAX_BULK_PROMOTIONS) {
    throw new AppError(
      `At most ${MAX_BULK_PROMOTIONS} promotions per request`,
      400
    );
  }
  const results = [];
  for (const request of requests) {
    try {
      const { promotion } = await promoteEmployee(request, actor);
      results.push({
        employeeId: request?.employeeId,
        status: 'promoted',
        promotion,
      });
    } catch (err) {
      if (!(err instanceof AppError)) throw err;
      results.push({
        employeeId: request?.employeeId,
        status: 'failed',
        code: err.code,
        message: err.message,
      });
    }
  }
  return {
    promoted: results.filter((r) => r.status === 'promoted').length,
    failed: results.filter((r) => r.status === 'failed').length,
    results,
  };
};

const getPromotionHistory = async (employeeId) => {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new AppError('A valid employee id is required', 400);
  }
  const history = await EmployeePromotion.find({ employeeId })
    .sort({ promotedOn: -1 })
    .populate('promotedBy', 'name')
    .select('-__v -updatedAt')
    .lean();
  return { history };
};

module.exports = { promoteEmployee, promoteEmployees, getPromotionHistory };
