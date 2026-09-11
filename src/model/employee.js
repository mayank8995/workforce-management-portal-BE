const mongoose = require('mongoose');
const validator = require('validator');
const {
  PROJECT_STATUS,
  DEPARTMENTS,
  RISK_STATUS,
  WORKMODE,
  EMPLOYEE_SATISFACTION,
} = require('../utils/constants');
const AppError = require('../utils/AppError');
const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 100,
    validate(value) {
      if (!validator.isLength(value, { min: 2, max: 100 })) {
        throw new AppError(
          'Project name must be between 2 and 100 characters',
          422
        );
      }
    },
  },

  status: {
    type: String,
    required: true,
    enum: {
      values: PROJECT_STATUS,
      message: `{VALUE} is invalid`,
    },
  },

  riskStatus: {
    type: String,
    required: true,
    enum: {
      values: RISK_STATUS,
      message: `{VALUE} is invalid`,
    },
  },

  priorityRanking: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    validate(value) {
      if (!Number.isInteger(value)) {
        throw new AppError('Priority ranking must be an integer', 422);
      }
    },
  },
});

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 299 },
});
const Counter = mongoose.model('Counter', CounterSchema);

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 35,
      trim: true,
      validate(value) {
        // Allows letters, spaces, apostrophes and hyphens
        if (!validator.isAlpha(value, 'en-US', { ignore: " '-" })) {
          throw new AppError(
            'Name can contain only letters, spaces, apostrophes and hyphens',
            422
          );
        }
      },
    },
    email: {
      type: String,
      required: true,
      // if unique is set, then mongo automatically creates index for the field
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new AppError('Please provide a valid email address', 422);
        }
      },
    },
    empId: {
      type: String,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        // Check across any supported country locale
        if (
          !validator.isMobilePhone(value, 'any') &&
          !/^\+\d{1,3}-\d{3}-\d{6,10}$/.test(value)
        ) {
          throw new AppError('Invalid phone number format', 422);
        }
      },
    },

    department: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: DEPARTMENTS,
        message: `{VALUE} is invalid department type`,
      },
    },

    designation: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 35,
    },

    manager: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 35,
    },

    joiningDate: {
      type: Date,
      required: true,
      validate(value) {
        if (value > new Date()) {
          throw new AppError('Joining date cannot be in the future', 422);
        }
      },
    },

    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
      validate(value) {
        if (typeof value !== 'number') {
          throw new AppError('Years of experience must be a number', 422);
        }
      },
    },

    salary: {
      type: Number,
      required: true,
      min: 0,
      validate(value) {
        if (!Number.isFinite(value)) {
          throw new AppError('Salary must be a valid number', 422);
        }
      },
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },

    workMode: {
      type: String,
      required: true,
      enum: {
        values: WORKMODE,
        message: `{VALUE} is invalid work mode`,
      },
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    skills: {
      type: [
        {
          type: String,
          trim: true,
          minLength: 1,
          maxLength: 50,
        },
      ],
      default: [],
    },

    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },

    attendancePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    employeeSatisfaction: {
      type: String,
      required: true,
      enum: EMPLOYEE_SATISFACTION,
    },

    onNoticePeriod: {
      type: Boolean,
      required: true,
      default: false,
    },
    level: {
      type: String,
      required: true,
      enum: ['junior', 'senior', 'lead', 'admin', 'executive'],
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre('save', async function () {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'empId' },
    { $inc: { seq: 1 } },
    { returnDocument: true, upsert: true }
  );
  this.empId = `B/${counter.seq}`;
});

employeeSchema.index({
  department: 1,
  rating: -1,
});

employeeSchema.index({
  designation: 1,
});

employeeSchema.index({
  workMode: 1,
});

employeeSchema.index({
  attendancePercentage: -1,
});

employeeSchema.index({
  onNoticePeriod: 1,
});

module.exports = mongoose.model('Employee', employeeSchema);
