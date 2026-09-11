const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const clientSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },

    industry: {
      type: String,
      required: true,
      trim: true,
    },

    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: ['Active', 'Inactive', 'On Hold'],
        message: `{VALUE} is invalid client status`,
      },
    },

    contractStartDate: {
      type: Date,
      required: true,
    },

    contractEndDate: {
      type: Date,
      required: true,
      validate(value) {
        if (value <= this.contractStartDate) {
          throw new AppError(
            'Contract end date must be after contract start date',
            422
          );
        }
      },
    },

    contractValue: {
      type: Number,
      required: true,
      min: 0,
    },

    monthlyRevenue: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Client', clientSchema);
