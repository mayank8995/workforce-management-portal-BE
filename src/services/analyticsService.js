const EmployeeAnalytics = require('../model/employeeAnalytics');
const Employees = require('../model/employee');
const {
  EMPLOYEE_SAFE_DATA,
  REVIEW_REASON,
  skillsInDemand,
  revenueTrend,
  attritionInsights,
} = require('../utils/constants');
const EmployeePromotion = require('../model/employeePromotion');
const {
  METRIC_CONFIG,
  ALLOWED_SORT_FIELDS,
  EMPLOYEE_PROJECTION,
  buildEmployeeFilters,
  buildSearch,
  PROMOTION_SORT_FIELDS,
  filterableFieldsPromoted,
  filterableFieldsTopPerformers,
  filterableFields,
  filterableFieldsReview,
} = require('../config/employee.querybuilding');
const Employee = require('../model/employee');
const Client = require('../model/client');
const { extract } = require('./utilService');

const fetchTopPerformers = async () => {
  const employees = await EmployeeAnalytics.findOne(
    {},
    { topPerformers: 1, _id: 0 }
  )
    .populate('topPerformers.employees', EMPLOYEE_SAFE_DATA)
    .lean();
  return { employees };
};

const fetchEmployeesRequiringReview = async () => {
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

const fetchEmployeesPromoted = async () => {
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

const fetchEmployeesMeetingKPIs = async () => {
  const employees = await EmployeeAnalytics.findOne(
    {},
    { meetingKPIs: 1, _id: 0 }
  )
    .populate('meetingKPIs.employees', EMPLOYEE_SAFE_DATA)
    .lean();
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
const fetchFilters = async (req, res) => {
  try {
    const { tableType: type } = req?.query;
    let data;
    let filterKeys = [];
    if (type === 'topPerformers') {
      const { employees } = await fetchTopPerformers();
      data = employees?.topPerformers?.employees;
      filterKeys = filterableFieldsTopPerformers;
    } else if (type === 'promotedThisYear') {
      const { employees } = await fetchEmployeesPromoted();
      data = employees;
      filterKeys = filterableFieldsPromoted;
    } else if (type === 'meetingKPIs') {
      const { employees } = await fetchEmployeesMeetingKPIs();
      data = employees?.meetingKPIs?.employees;
      filterKeys = filterableFields;
    } else if (type === 'requiringReview') {
      const { employees } = await fetchEmployeesRequiringReview();
      data = employees;
      filterKeys = filterableFieldsReview;
    } else if (type === 'employees') {
      const employees = await Employee.find({});
      data = employees;
      filterKeys = filterableFields;
    } else {
      throw new Error('Analytics type not present');
    }
    const valuesMap = new Map();

    for (const field of filterKeys) {
      const path = field.split('$');
      const fieldName = path[path.length - 1];
      const values = extract(data, path);
      valuesMap.set(fieldName, [...new Set(values)]);
    }
    const response = {
      list: [...valuesMap],
    };
    return response;
  } catch (error) {
    throw new Error(error);
  }
};
//
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

  const metricPath = `$${metric}`;

  const pipeline = [
    {
      $lookup: {
        from: 'employees',
        localField: `${metric}.employees`,
        foreignField: '_id',
        as: 'employee',
      },
    },

    {
      $unwind: '$employee',
    },

    {
      $set: {
        _id: '$employee._id',
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
        projects: '$employee.projects',
        skills: '$employee.skills',
        rating: '$employee.rating',
        attendancePercentage: '$employee.attendancePercentage',
        employeeSatisfaction: '$employee.employeeSatisfaction',
        onNoticePeriod: '$employee.onNoticePeriod',
      },
    },

    {
      $match: match,
    },
  ];

  if (metric === 'requiringReview') {
    pipeline.push({
      $set: {
        reviewReason: {
          $filter: {
            input: [
              {
                $cond: [{ $lt: ['$rating', 4] }, 'Low Rating', null],
              },
              {
                $cond: [
                  { $lt: ['$attendancePercentage', 88] },
                  'Low Attendance',
                  null,
                ],
              },
              {
                $cond: ['$onNoticePeriod', 'On Notice', null],
              },
            ],
            as: 'reason',
            cond: { $ne: ['$$reason', null] },
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

      meta: [
        {
          $limit: 1,
        },
        {
          $project: {
            _id: 0,
            title: `${metricPath}.title`,
            icon: `${metricPath}.icon`,
            percentage: `${metricPath}.percentage`,
            trend: `${metricPath}.trend`,
            trendValue: `${metricPath}.trendValue`,
            description: `${metricPath}.description`,
          },
        },
      ],
    },
  });

  pipeline.push({
    $project: {
      data: 1,
      title: { $arrayElemAt: ['$meta.title', 0] },
      icon: { $arrayElemAt: ['$meta.icon', 0] },
      count: {
        $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0],
      },
      percentage: { $arrayElemAt: ['$meta.percentage', 0] },
      trend: { $arrayElemAt: ['$meta.trend', 0] },
      trendValue: { $arrayElemAt: ['$meta.trendValue', 0] },
      description: { $arrayElemAt: ['$meta.description', 0] },
    },
  });

  const [result] = await EmployeeAnalytics.aggregate(pipeline);

  const total = result?.count || 0;
  let meetingBreakdown;
  if (metric === 'meetingKPIs') {
    const [breakdown] = await Employee.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          exceeding: {
            $sum: {
              $cond: [{ $gte: ['$rating', 4.5] }, 1, 0],
            },
          },

          meeting: {
            $sum: {
              $cond: [
                {
                  $and: [{ $gte: ['$rating', 4] }, { $lt: ['$rating', 4.5] }],
                },
                1,
                0,
              ],
            },
          },

          notMeeting: {
            $sum: {
              $cond: [{ $lt: ['$rating', 4] }, 1, 0],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          exceeding: {
            label: 'Exceeding KPIs',
            count: '$exceeding',
            percentage: {
              $round: [
                {
                  $multiply: [{ $divide: ['$exceeding', '$total'] }, 100],
                },
                2,
              ],
            },
            ratingRange: '≥ 4.5',
          },

          meeting: {
            label: 'Meeting KPIs',
            count: '$meeting',
            percentage: {
              $round: [
                {
                  $multiply: [{ $divide: ['$meeting', '$total'] }, 100],
                },
                2,
              ],
            },
            ratingRange: '4.0 – 4.4',
          },

          notMeeting: {
            label: 'Not Meeting KPIs',
            count: '$notMeeting',
            percentage: {
              $round: [
                {
                  $multiply: [{ $divide: ['$notMeeting', '$total'] }, 100],
                },
                2,
              ],
            },
            ratingRange: '< 4.0',
          },
        },
      },
    ]);
    meetingBreakdown = breakdown;
  }
  return {
    breakdown: meetingBreakdown,
    metric,
    employees: result?.data || [],
    title: result?.title,
    icon: result?.icon,
    count: result?.count || 0,
    percentage: result?.percentage,
    trend: result?.trend,
    trendValue: result?.trendValue,
    description: result?.description,
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

const getPromotedEmployees = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const employeeFilters = buildEmployeeFilters(query, 'employee.');
  const employeeSearch = buildSearch(query.search, 'employee.');

  const sortField = PROMOTION_SORT_FIELDS[query.sortBy] || 'promotedOn';

  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const promotionMatch = METRIC_CONFIG.promotedThisYear.match;
  console.log('employeeFilters>>>', employeeFilters);
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
      $match: employeeFilters,
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
          $set: {
            _id: '$employee._id',
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
          },
        },

        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            empId: 1,
            department: 1,
            designation: 1,
            phone: 1,
            manager: 1,
            joiningDate: 1,
            yearsOfExperience: 1,
            salary: 1,
            location: 1,
            workMode: 1,
            skills: 1,
            rating: 1,
            attendancePercentage: 1,
            employeeSatisfaction: 1,
            onNoticePeriod: 1,
            projects: 1,
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

  // Get metadata from EmployeeAnalytics
  const analytics = await EmployeeAnalytics.findOne(
    {},
    {
      'promotedThisYear.title': 1,
      'promotedThisYear.icon': 1,
      'promotedThisYear.count': 1,
      'promotedThisYear.percentage': 1,
      'promotedThisYear.trend': 1,
      'promotedThisYear.trendValue': 1,
      'promotedThisYear.description': 1,
    }
  ).lean();

  const promotedThisYear = analytics?.promotedThisYear;

  return {
    metric: 'promotedThisYear',

    employees: result?.data || [],

    title: promotedThisYear?.title,
    icon: promotedThisYear?.icon,
    count: promotedThisYear?.count,
    percentage: promotedThisYear?.percentage,
    trend: promotedThisYear?.trend,
    trendValue: promotedThisYear?.trendValue,
    description: promotedThisYear?.description,
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

const getAnalytics = async () => {
  const result = await Client.aggregate([
    {
      $facet: {
        totalAmount: [
          {
            $group: {
              _id: null,
              count: { $sum: `$monthlyRevenue` },
            },
          },
        ],
        topClients: [
          {
            $sort: {
              monthlyRevenue: -1,
            },
          },
          {
            $limit: 10,
          },
          {
            $project: {
              _id: 0,
              client: '$name',
              industry: '$industry',
              revenueCr: '$monthlyRevenue',
            },
          },
        ],
      },
    },
  ]);
  const totalRevenue = result?.[0]?.totalAmount?.[0]?.count || 0;
  const topClients = result?.[0]?.topClients;
  const data = await Employee.aggregate([
    {
      $facet: {
        activeProjects: [
          { $unwind: '$projects' },
          { $match: { 'projects.status': 'Active' } },
          { $count: 'count' },
        ],
        headcountByLocation: [
          {
            $group: {
              _id: '$location',
              employeeCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              city: '$_id',
              employeeCount: 1,
            },
          },
        ],
        projectStatusDistribution: [
          { $unwind: '$projects' },
          {
            // Step 1: Count occurrences of each unique value
            $group: {
              _id: '$projects.status', // Group by the value of the 'status' field
              count: { $sum: 1 },
            },
          },
          {
            // Step 2: Format into a key-value pair array [{ k: "active", v: 5 }]
            $group: {
              _id: null,
              counts: {
                $push: {
                  k: '$_id', // The dynamic key name
                  v: '$count', // The count value
                },
              },
            },
          },
          {
            // Step 3: Convert the array of pairs into a single object root
            $replaceRoot: {
              newRoot: { $arrayToObject: '$counts' },
            },
          },
        ],
        departmentHeadcount: [
          {
            $group: {
              _id: '$department',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              department: '$_id',
              count: 1,
            },
          },
        ],
        totalEmployeesCount: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);
  let summary = {
    totalRevenue,
    profitMargin: 23.4, // hardcoded for now
    activeProjects: data?.[0]?.activeProjects?.[0]?.count,
    attritionRate: 12.8, // hardcoded for now
    totalEmployees: data?.[0]?.totalEmployeesCount?.[0]?.total,
  };
  return {
    summary,
    headcountByLocation: data?.[0]?.headcountByLocation,
    projectStatusDistribution: data?.[0]?.projectStatusDistribution,
    departmentHeadcount: data?.[0]?.departmentHeadcount,
    topClients,
    skillsInDemand, // hardcoded for now
    revenueTrend, // hardcoded for now
    attritionInsights, // hardcoded for now
  };
};
module.exports = {
  populateEmployeeAnalytics,
  getEmployeeMetric,
  getPromotedEmployees,
  getAnalytics,
  fetchFilters,
};
