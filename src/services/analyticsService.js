const EmployeeAnalytics = require('../model/employeeAnalytics');
const Employees = require('../model/employee');
const { EMPLOYEE_SAFE_DATA, REVIEW_REASON } = require('../utils/constants');
const EmployeePromotion = require('../model/employeePromotion');
const {
  METRIC_CONFIG,
  ALLOWED_SORT_FIELDS,
  EMPLOYEE_PROJECTION,
  buildEmployeeFilters,
  buildSearch,
  PROMOTION_SORT_FIELDS,
} = require('../config/employee.querybuilding');
const Employee = require('../model/employee');
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
const getEmployeeMetric = async (metric, query) => {
  const config = METRIC_CONFIG[metric];

  if (!config) {
    throw new Error('Invalid analytics metric');
  }

  if (config.source !== 'employee') {
    throw new Error('This metric requires the promotion query');
  }

  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const filters = buildEmployeeFilters(query);

  const search = buildSearch(query.search);

  const match = {
    ...config.match,
    ...filters,
  };

  if (search) {
    match.$and = [search];
  }

  const sortField = ALLOWED_SORT_FIELDS[query.sortBy] || 'name';

  const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

  const pipeline = [
    {
      $match: match,
    },
  ];

  // Add review reasons only for requiringReview
  if (metric === 'requiringReview') {
    pipeline.push({
      $set: {
        reviewReason: {
          $filter: {
            input: [
              {
                $cond: [
                  {
                    $lt: ['$rating', 4],
                  },
                  'Low rating',
                  null,
                ],
              },
              {
                $cond: [
                  {
                    $lt: ['$attendancePercentage', 88],
                  },
                  'Low Attendance',
                  null,
                ],
              },
              {
                $cond: ['$onNoticePeriod', 'On Notice', null],
              },
            ],
            as: 'reason',
            cond: {
              $ne: ['$$reason', null],
            },
          },
        },
      },
    });
  }

  pipeline.push({
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
          $project: {
            ...EMPLOYEE_PROJECTION,

            ...(metric === 'requiringReview' ? { reviewReason: 1 } : {}),
          },
        },
      ],
      total: [
        {
          $count: 'count',
        },
      ],
    },
  });

  const [result] = await Employee.aggregate(pipeline);

  const total = result?.total?.[0]?.count || 0;

  return {
    metric,
    data: result?.data || [],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const getPromotedEmployees = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const employeeFilters = buildEmployeeFilters(query, 'employee.');
  console.log('employeeFilters>>>', employeeFilters);
  const employeeSearch = buildSearch(query.search, 'employee.');

  const sortField = PROMOTION_SORT_FIELDS[query.sortBy] || 'promotedOn';

  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const employeeCondition = {
    ...employeeFilters,
  };
  console.log('employeeCondition>>>', employeeCondition, employeeSearch);

  const promotionMatch = METRIC_CONFIG.promotedThisYear.match;

  const pipeline = [
    {
      $match: promotionMatch,
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    {
      $unwind: '$employee',
    },
    {
      $match: employeeCondition,
    },
  ];

  if (employeeSearch) {
    pipeline.push({
      $match: employeeSearch,
    });
  }

  pipeline.push({
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
          $project: {
            _id: 0,

            name: '$employee.name',
            email: '$employee.email',
            empId: '$employee.empId',
            department: '$employee.department',
            designation: '$employee.designation',
            phone: '$employee.phone',
            manager: '$employee.manager',
            joiningDate: '$employee.joiningDate',
            yearsOfExperience: '$employee.yearsOfExperience',
            salary: '$employee.salary',
            location: '$employee.location',
            workMode: '$employee.workMode',
            skills: '$employee.skills',
            rating: '$employee.rating',
            attendancePercentage: '$employee.attendancePercentage',
            employeeSatisfaction: '$employee.employeeSatisfaction',
            onNoticePeriod: '$employee.onNoticePeriod',
            projects: '$employee.projects',
            previousDesignation: 1,
            currentDesignation: 1,
            promotedOn: 1,
          },
        },
      ],

      total: [
        {
          $count: 'count',
        },
      ],
    },
  });

  const [result] = await EmployeePromotion.aggregate(pipeline);

  const total = result?.total?.[0]?.count || 0;

  return {
    metric: 'promotedThisYear',

    data: result?.data || [],

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

module.exports = {
  fetchEmployeeAnalytics,
  populateEmployeeAnalytics,
  getEmployeeMetric,
  getPromotedEmployees,
};
