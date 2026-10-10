const ALLOWED_SORT_FIELDS = {
  name: 'name',
  rating: 'rating',
  attendancePercentage: 'attendancePercentage',
  yearsOfExperience: 'yearsOfExperience',
  //   salary: 'salary',
  //   joiningDate: 'joiningDate',
  designation: 'designation',
  department: 'department',
  location: 'location',
  workMode: 'workMode',
  empId: 'empId',
};

const PROMOTION_SORT_FIELDS = {
  promotedOn: 'promotedOn',
  currentDesignation: 'currentDesignation',
  previousDesignation: 'previousDesignation',
  name: 'employee.name',
  rating: 'employee.rating',
  attendancePercentage: 'employee.attendancePercentage',
  salary: 'employee.salary',
};

const buildRange = (min, max) => {
  const condition = {};

  if (min !== undefined) {
    condition.$gte = Number(min);
  }

  if (max !== undefined) {
    condition.$lte = Number(max);
  }

  return Object.keys(condition).length ? condition : undefined;
};

const toArray = (value) => {
  if (!value) return [];

  return Array.isArray(value) ? value : value.split(',');
};

const buildEmployeeFilters = (query, prefix = '') => {
  const filters = {};

  const field = (name) => `${prefix}${name}`;

  const department = toArray(query.department);

  if (department.length) {
    filters[field('department')] = {
      $in: department,
    };
  }

  const designation = toArray(query.designation);

  if (designation.length) {
    filters[field('designation')] = {
      $in: designation,
    };
  }

  const location = toArray(query.location);

  if (location.length) {
    filters[field('location')] = {
      $in: location,
    };
  }

  const workMode = toArray(query.workMode);

  if (workMode.length) {
    filters[field('workMode')] = {
      $in: workMode,
    };
  }

  const previousDesignation = toArray(query.previousDesignation);

  if (previousDesignation.length) {
    filters[field(`previousDesignation`)] = {
      $in: previousDesignation,
    };
  }

  const employeeSatisfaction = toArray(query.employeeSatisfaction);

  if (employeeSatisfaction.length) {
    filters[field('employeeSatisfaction')] = {
      $in: employeeSatisfaction,
    };
  }

  if (query.onNoticePeriod !== undefined) {
    filters[field('onNoticePeriod')] = query.onNoticePeriod === 'true';
  }

  const rating = buildRange(query.ratingMin, query.ratingMax);

  if (rating) {
    filters[field('rating')] = rating;
  }

  const attendance = buildRange(query.attendanceMin, query.attendanceMax);

  if (attendance) {
    filters[field('attendancePercentage')] = attendance;
  }

  const experience = buildRange(query.experienceMin, query.experienceMax);

  if (experience) {
    filters[field('yearsOfExperience')] = experience;
  }

  const salary = buildRange(query.salaryMin, query.salaryMax);

  if (salary) {
    filters[field('salary')] = salary;
  }

  const skill = toArray(query.skill);

  if (skill.length) {
    filters[field('skills')] = {
      $in: skill,
    };
  }

  const projectStatus = toArray(query.projectStatus);

  if (projectStatus.length) {
    filters[`${prefix}projects.status`] = {
      $in: projectStatus,
    };
  }

  const riskStatus = toArray(query.riskStatus);

  if (riskStatus.length) {
    filters[`${prefix}projects.riskStatus`] = {
      $in: riskStatus,
    };
  }

  return filters;
};

const buildSearch = (search, prefix = '') => {
  if (!search) {
    return null;
  }

  return {
    $or: [
      {
        [`${prefix}name`]: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        [`${prefix}email`]: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        [`${prefix}empId`]: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        [`${prefix}department`]: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        [`${prefix}designation`]: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        [`${prefix}location`]: {
          $regex: search,
          $options: 'i',
        },
      },
    ],
  };
};

const PROMOTION_WINDOW_START = new Date('2024-01-01T00:00:00.000Z');

// The guest login is backed by an Employee record; keep it out of listings and analytics.
const NON_GUEST_EMPLOYEES = { level: { $ne: 'guest' } };

const METRIC_CONFIG = {
  topPerformers: {
    source: 'employee',

    match: {
      rating: { $gte: 4.5 },
    },
  },

  meetingKPIs: {
    source: 'employee',

    match: {
      rating: { $gte: 4 },
      attendancePercentage: { $gte: 90 },
    },
  },

  requiringReview: {
    source: 'employee',
    match: {
      $or: [
        { rating: { $lt: 4 } },
        { attendancePercentage: { $lt: 88 } },
        {
          onNoticePeriod: true,
        },
      ],
    },
  },

  promotedThisYear: {
    source: 'promotion',
    // Getter so the upper bound is "now" at query time, not at server start.
    get match() {
      return {
        promotedOn: {
          $gte: PROMOTION_WINDOW_START,
          $lte: new Date(),
        },
      };
    },
  },
};

const EMPLOYEE_PROJECTION = {
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
  projects: 1,
  skills: 1,
  rating: 1,
  attendancePercentage: 1,
  employeeSatisfaction: 1,
  onNoticePeriod: 1,
};
const EMPLOYEE_SET = {
  $set: {
    name: '$name',
    email: '$email',
    empId: '$empId',
    department: '$department',
    designation: '$designation',
    phone: '$phone',
    manager: '$manager',
    joiningDate: '$joiningDate',
    yearsOfExperience: '$yearsOfExperience',
    salary: '$salary',
    location: '$location',
    workMode: '$workMode',
    projects: '$projects',
    skills: '$skills',
    rating: '$rating',
    attendancePercentage: '$attendancePercentage',
    employeeSatisfaction: '$employeeSatisfaction',
    onNoticePeriod: '$onNoticePeriod',
  },
};

const ALLOWED_EMPLOYEE_PROFILE_FIELDS = [
  'name',
  'email',
  'empId',
  'department',
  'designation',
  'phone',
  'skills',
  'workMode',
  'location',
  'joiningDate',
];

const filterableFields = [
  'department',
  'designation',
  'location',
  // 'projects$projectName',
  // 'projects$priorityRanking',
  // 'projects$riskStatus',
  // 'projects$status',
  // 'reviewReason',
  'workMode',
];
const filterableFieldsTopProjects = [
  'projects$projectName',
  // 'projects$priorityRanking',
  'projects$riskStatus',
  // 'projects$status',
];
const filterableFieldsTopPerformers = ['department', 'designation'];

const filterableFieldsPromoted = ['department', 'designation'];
const filterableFieldsReview = ['department', 'designation'];

module.exports = {
  NON_GUEST_EMPLOYEES,
  ALLOWED_SORT_FIELDS,
  EMPLOYEE_PROJECTION,
  buildSearch,
  buildEmployeeFilters,
  PROMOTION_SORT_FIELDS,
  METRIC_CONFIG,
  ALLOWED_EMPLOYEE_PROFILE_FIELDS,
  EMPLOYEE_SET,
  filterableFields,
  filterableFieldsReview,
  filterableFieldsPromoted,
  filterableFieldsTopPerformers,
  filterableFieldsTopProjects,
};
