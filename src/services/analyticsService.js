const EmployeeAnalytics = require('../model/employeeAnalytics');
const Employees = require('../model/employee');
const { EMPLOYEE_SAFE_DATA, REVIEW_REASON } = require('../utils/constants');
const EmployeePromotion = require('../model/employeePromotion');

const fetchTopPerformers = async (req, res) => {
  const type = req?.params?.type;
  if (type !== 'topPerformers') {
    throw new Error('Analytics type not present');
  }
  const employees = await EmployeeAnalytics.findOne(
    {},
    { topPerformers: 1, _id: 0 }
  ).populate('topPerformers.employees', EMPLOYEE_SAFE_DATA);
  return { employees };
};

const fetchEmployeesRequiringReview = async (req, res) => {
  const type = req?.params?.type;
  if (type !== 'requiringReview') {
    throw new Error('Analytics type not present');
  }
  const data = await EmployeeAnalytics.findOne(
    {},
    { requiringReview: 1, _id: 0 }
  )
    .populate('requiringReview.employees', EMPLOYEE_SAFE_DATA)
    .lean();
  const employees = data.requiringReview.employees.map((employee) => ({
    ...employee,
    reviewReason: [
      employee.rating < 4 && REVIEW_REASON[0],
      employee.attendancePercentage < 88 && REVIEW_REASON[1],
      employee.onNoticePeriod && REVIEW_REASON[2],
    ].filter(Boolean),
  }));
  return { employees };
};

const fetchEmployeesPromoted = async (req, res) => {
  const type = req?.params?.type;
  if (type !== 'promotedThisYear') {
    throw new Error('Analytics type not present');
  }
  const employees = await EmployeeAnalytics.findOne(
    {},
    { promotedThisYear: 1, _id: 0 }
  )
    .populate({
      path: 'promotedThisYear.employees',
      populate: {
        path: 'employeeId',
        select: EMPLOYEE_SAFE_DATA.join(' '),
      },
    })
    .lean();
  const promotions = employees.promotedThisYear.employees.map(
    ({ employeeId, _id, __v, createdAt, updatedAt, ...promotion }) => ({
      ...employeeId,
      ...promotion,
    })
  );
  return { employees: promotions };
};

const fetchEmployeesMeetingKPIs = async (req, res) => {
  const type = req?.params?.type;
  if (type !== 'meetingKPIs') {
    throw new Error('Analytics type not present');
  }
  const employees = await EmployeeAnalytics.findOne(
    {},
    { meetingKPIs: 1, _id: 0 }
  ).populate('meetingKPIs.employees', EMPLOYEE_SAFE_DATA);
  return { employees };
};

const populateEmployeeAnalytics = async (req, res) => {
  const type = req?.params?.type;
  if (type === 'topPerformers') {
    const employeeIds = await Employees.find({
      rating: { $gte: 4.5 },
    }).distinct('_id');
    const totalEmployeesCount = await Employees.countDocuments();
    const percentage = Number(
      (employeeIds.length / totalEmployeesCount) * 100
    ).toFixed(2);
    const analytics = await EmployeeAnalytics.updateOne(
      {},
      {
        $set: {
          'topPerformers.count': employeeIds.length,
          'topPerformers.employees': employeeIds,
          'topPerformers.percentage': percentage,
        },
      }
    );
    return { analytics };
  } else if (type === 'promotedThisYear') {
    const promotedEmployeeIds = await EmployeePromotion.distinct('_id');
    const totalEmployeesCount = await Employees.countDocuments();
    const percentage = Number(
      (promotedEmployeeIds.length / totalEmployeesCount) * 100
    ).toFixed(2);
    const analytics = await EmployeeAnalytics.updateOne(
      {},
      {
        $set: {
          'promotedThisYear.count': promotedEmployeeIds.length,
          'promotedThisYear.employees': promotedEmployeeIds,
          'promotedThisYear.percentage': percentage,
        },
      }
    );
    return { analytics };
  } else if (type === 'meetingKPIs') {
    const employeeIds = await Employees.find({
      $and: [{ rating: { $gte: 4 } }, { attendancePercentage: { $gte: 90 } }],
    }).distinct('_id');
    const totalEmployeesCount = await Employees.countDocuments();
    const percentage = Number(
      (employeeIds.length / totalEmployeesCount) * 100
    ).toFixed(2);
    const analytics = await EmployeeAnalytics.updateOne(
      {},
      {
        $set: {
          'meetingKPIs.count': employeeIds.length,
          'meetingKPIs.employees': employeeIds,
          'meetingKPIs.percentage': percentage,
        },
      }
    );
    return { analytics };
  } else if (type === 'requiringReview') {
    const employeeIds = await Employees.find({
      $or: [
        {
          $and: [{ rating: { $lt: 4 } }, { attendancePercentage: { $lt: 88 } }],
        },
        { onNoticePeriod: true },
      ],
    }).distinct('_id');
    const totalEmployeesCount = await Employees.countDocuments();
    const percentage = Number(
      (employeeIds.length / totalEmployeesCount) * 100
    ).toFixed(2);
    const analytics = await EmployeeAnalytics.updateOne(
      {},
      {
        $set: {
          'requiringReview.count': employeeIds.length,
          'requiringReview.employees': employeeIds,
          'requiringReview.percentage': percentage,
        },
      }
    );
    return { analytics };
  } else {
    throw new Error('Analytics type not present');
  }
};
const fetchEmployeeAnalytics = async (req, res) => {
  try {
    const type = req?.params?.type;
    if (type === 'topPerformers') {
      const { employees } = await fetchTopPerformers(req, res);
      return { employees };
    } else if (type === 'promotedThisYear') {
      const { employees } = await fetchEmployeesPromoted(req, res);
      return { employees };
    } else if (type === 'meetingKPIs') {
      const { employees } = await fetchEmployeesMeetingKPIs(req, res);
      return { employees };
    } else if (type === 'requiringReview') {
      const { employees } = await fetchEmployeesRequiringReview(req, res);
      return { employees };
    } else {
      throw new Error('Analytics type not present');
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { fetchEmployeeAnalytics, populateEmployeeAnalytics };
