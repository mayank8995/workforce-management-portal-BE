const mongoose = require('mongoose');
const validator = require('validator');
const AppError = require('../utils/AppError');
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
