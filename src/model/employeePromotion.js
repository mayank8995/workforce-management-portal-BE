const mongoose = require('mongoose');
const validator = require('validator');
const AppError = require('../utils/AppError');
const { EMPLOYEE_LEVELS } = require('../utils/constants');
const employeePromotionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    previousDesignation: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },

    currentDesignation: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },

    // Level/salary/promotedBy are absent on records created before the promotion workflow.
    previousLevel: {
      type: String,
      enum: EMPLOYEE_LEVELS,
    },

    currentLevel: {
      type: String,
      enum: EMPLOYEE_LEVELS,
    },

    previousSalary: {
      type: Number,
      min: 0,
    },

    currentSalary: {
      type: Number,
      min: 0,
    },

    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    promotedOn: {
      type: Date,
      required: true,
      validate(value) {
        if (value > new Date()) {
          throw new AppError('Promotion date cannot be in the future', 422);
        }
      },
    },
  },
  {
    timestamps: true,
  }
);
employeePromotionSchema.index({
  promotedOn: -1,
});

employeePromotionSchema.index({
  employeeId: 1,
});
const EmployeePromotion = mongoose.model(
  'EmployeePromotion',
  employeePromotionSchema
);
module.exports = EmployeePromotion;
