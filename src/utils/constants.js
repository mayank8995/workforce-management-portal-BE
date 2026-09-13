const PROJECT_STATUS = [
  'Active',
  'Completed',
  'On Hold',
  'Cancelled',
  'Support',
];
const RISK_STATUS = ['On Track', 'At Risk', 'Critical'];
const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'QA & Testing',
  'Data',
  'Support',
];
const WORKMODE = ['Remote', 'Hybrid', 'Onsite'];
const EMPLOYEE_SATISFACTION = ['Low', 'Medium', 'High'];
const EMPLOYEE_SAFE_DATA = [
  'name',
  'email',
  'department',
  'designation',
  'phone',
  'manager',
  'joiningDate',
  'yearsOfExperience',
  'salary',
  'location',
  'workMode',
  'projects',
  'skills',
  'rating',
  'attendancePercentage',
  'employeeSatisfaction',
  'onNoticePeriod',
  'level',
];
const ALLOWED_EDITABLE_FIELDS = [
  'name',
  'department',
  'designation',
  'phone',
  'manager',
  'salary',
  'location',
  'workMode',
  'projects',
  'skills',
  'rating',
  'employeeSatisfaction',
  'onNoticePeriod',
  'level',
];
const ALLOWED_EDITS_USER_PROFILE = ['name', 'phone', 'skills', 'image'];
const REVIEW_REASON = ['Low Rating', 'Low Attendance', 'On Notice'];
const commonFields = {
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 35,
  },

  icon: {
    type: String,
  },

  count: {
    type: Number,
    required: true,
    min: 0,
  },

  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },

  trend: {
    type: String,
    required: true,
    enum: {
      values: ['up', 'down', 'neutral'],
      message: `{VALUE} is invalid trend`,
    },
  },

  trendValue: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },

  description: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 100,
  },
};

const revenueTrend = [
  {
    month: 'Dec 23',
    revenueCr: 870,
  },
  {
    month: 'Jan 24',
    revenueCr: 910,
  },
  {
    month: 'Feb 24',
    revenueCr: 960,
  },
  {
    month: 'Mar 24',
    revenueCr: 1030,
  },
  {
    month: 'Apr 24',
    revenueCr: 1120,
  },
  {
    month: 'May 24',
    revenueCr: 1245,
  },
];
const skillsInDemand = [
  {
    skill: 'AWS',
    employeeCount: 13,
  },
  {
    skill: 'React',
    employeeCount: 12,
  },
  {
    skill: 'Node.js',
    employeeCount: 11,
  },
  {
    skill: 'Python',
    employeeCount: 10,
  },
  {
    skill: 'Django',
    employeeCount: 9,
  },
];
const attritionInsights = {
  thisMonth: 142,
  lastMonth: 167,
  employeesOnNoticePeriod: 15,
  yearlyAttritionRate: 12.8,
  trend: [
    {
      month: 'Dec 23',
      rate: 14.1,
    },
    {
      month: 'Jan 24',
      rate: 13.7,
    },
    {
      month: 'Feb 24',
      rate: 13.2,
    },
    {
      month: 'Mar 24',
      rate: 12.9,
    },
    {
      month: 'Apr 24',
      rate: 13,
    },
    {
      month: 'May 24',
      rate: 12.8,
    },
  ],
};
const EMPLOYEE_CREATED = 'employeeCreated';
const EMPLOYEE_EDITED = 'employeeEdited';
const EMPLOYEE_DELETED = 'employeeDeleted';
const ADMIN_LOGIN = 'adminLogin';
const ADMIN_LOGOUT = 'adminLogour';

module.exports = {
  PROJECT_STATUS,
  RISK_STATUS,
  DEPARTMENTS,
  WORKMODE,
  EMPLOYEE_SATISFACTION,
  EMPLOYEE_SAFE_DATA,
  REVIEW_REASON,
  commonFields,
  ALLOWED_EDITABLE_FIELDS,
  revenueTrend,
  skillsInDemand,
  attritionInsights,
  ALLOWED_EDITS_USER_PROFILE,
  EMPLOYEE_CREATED,
  EMPLOYEE_EDITED,
  EMPLOYEE_DELETED,
  ADMIN_LOGIN,
  ADMIN_LOGOUT,
};
