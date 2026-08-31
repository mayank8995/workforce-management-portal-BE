const {
  buildEmployeeFilters,
  buildSearch,
  ALLOWED_SORT_FIELDS,
  EMPLOYEE_PROJECTION,
  ALLOWED_EMPLOYEE_PROFILE_FIELDS,
} = require('../config/employee.querybuilding');
const Employee = require('../model/employee');
const User = require('../model/user');
const {
  validateCreateEmployeeData,
  validateEditEmployeeData,
} = require('../utils/validation');
const getEmployees = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const filters = buildEmployeeFilters(query);

  const search = buildSearch(query.search);

  const match = {
    ...filters,
  };

  if (search) {
    match.$and = [search];
  }

  const sortField = ALLOWED_SORT_FIELDS[query.sortBy] || 'name';

  const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
  console.log('match>>', match);

  const result = await Employee.aggregate([
    {
      $match: match,
    },

    {
      $facet: {
        data: [
          {
            $sort: {
              [sortField]: sortOrder,
              _id: 1,
            },
          },

          {
            $skip: skip,
          },

          {
            $limit: limit,
          },

          {
            $project: EMPLOYEE_PROJECTION,
          },
        ],

        total: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);

  const total = result[0]?.total[0]?.count || 0;

  return {
    employees: result[0]?.data || [],
    pagination: {
      page,
      limit,
      total,
      sortOrder: sortOrder === -1 ? 'desc' : 'asc',
      sortBy: sortField,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const getEmployeeProfile = async (query) => {
  const { _id } = query;

  const result = await Employee.findById(_id)
    .select(ALLOWED_EMPLOYEE_PROFILE_FIELDS.join(' '))
    .lean();
  return {
    ...result,
    joiningDate: new Date().toISOString()?.split('T')?.[0],
  };
};

const editEmployeeProfile = async (req) => {
  const { name, phone, email } = req.body;
  console.log(name, phone, email);
  await User.findOneAndUpdate({ email }, { name });
  await Employee.findOneAndUpdate(
    { email },
    { name, phone },
    { returnDocument: true }
  );
  return true;
};

const getEmployeeDetails = async (query) => {
  const { _id } = query;
  const result = await Employee.findById(_id).select(
    '-_id -createdAt -updatedAt -__v'
  );
  return {
    result,
  };
};

const createEmployee = async (req) => {
  const isAllowed = validateCreateEmployeeData(req);
  if (!isAllowed) {
    throw new Error('Invalid Employee data');
  }
  const employee = await Employee({
    ...(req?.body || {}),
  });
  const data = await employee.save();
  return {
    data,
  };
};
const editEmployee = async (req) => {
  const isAllowed = validateEditEmployeeData(req);
  if (!isAllowed) {
    throw new Error('Invalid editable data');
  }
  const { id } = req?.params;
  const employee = await Employee.findByIdAndUpdate(
    { _id: id },
    {
      ...(req?.body || {}),
    },
    { returnDocument: 'after' }
  );
  return {
    employee,
  };
};
module.exports = {
  getEmployees,
  getEmployeeDetails,
  getEmployeeProfile,
  createEmployee,
  editEmployee,
  editEmployeeProfile,
};
