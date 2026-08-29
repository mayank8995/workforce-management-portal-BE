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
  'empId',
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
const REVIEW_REASON = ['Low rating', 'Low Attendance', 'On Notice'];
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
};
