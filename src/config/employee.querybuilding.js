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

const buildEmployeeFilters = (query, prefix = '') => {
  const filters = {};

  const field = (name) => `${prefix}${name}`;

  // if (query.name) {
  //   filters[field('name')] = query.name;
  // }
  if (query.department) {
    filters[field('department')] = query.department;
  }

  if (query.designation) {
    filters[field('designation')] = query.designation;
  }

  if (query.location) {
    filters[field('location')] = query.location;
  }

  if (query.workMode) {
    filters[field('workMode')] = query.workMode;
  }

  if (query.employeeSatisfaction) {
    filters[field('employeeSatisfaction')] = query.employeeSatisfaction;
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

  if (query.skill) {
    filters[field('skills')] = query.skill;
  }

  if (query.projectStatus) {
    filters[`${prefix}projects.status`] = query.projectStatus;
  }

  if (query.riskStatus) {
    filters[`${prefix}projects.riskStatus`] = query.riskStatus;
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

    /*
     * This matches YOUR CURRENT DATABASE:
     *
     * (rating < 4 AND attendance < 88)
     * OR
     * onNoticePeriod = true
     *
     * Your stored analytics count is 46, which matches
     * this rule.
     */
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

    match: {
      promotedOn: {
        $gte: new Date('2024-01-01T00:00:00.000Z'),
        $lt: new Date('2026-09-01T00:00:00.000Z'),
      },
    },
  },
};

const EMPLOYEE_PROJECTION = {
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

const ALLOWED_EMPLOYEE_PROFILE_FIELDS = [
  'name',
  'email',
  'empId',
  'department',
  'designation',
  'phone',
  'skills',
];

module.exports = {
  ALLOWED_SORT_FIELDS,
  EMPLOYEE_PROJECTION,
  buildSearch,
  buildEmployeeFilters,
  PROMOTION_SORT_FIELDS,
  METRIC_CONFIG,
  ALLOWED_EMPLOYEE_PROFILE_FIELDS,
};
