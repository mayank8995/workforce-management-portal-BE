const mongoose = require('mongoose');
const { commonFields } = require('../utils/constants');

const commonSchema = new mongoose.Schema(
  {
    ...commonFields,
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const promotedThisYearSchema = new mongoose.Schema(
  {
    ...commonFields,
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeePromotion',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const employeeAnalyticsSchema = new mongoose.Schema({
  topPerformers: {
    type: commonSchema,
  },
  promotedThisYear: {
    type: promotedThisYearSchema,
  },
  meetingKPIs: {
    type: commonSchema,
  },
  requiringReview: {
    type: commonSchema,
  },
});

module.exports = mongoose.model('EmployeeAnalytics', employeeAnalyticsSchema);
