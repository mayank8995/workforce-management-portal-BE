const mongoose = require('mongoose');
const validator = require('validator');
const { DEPARTMENTS } = require('../utils/constants');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
require('dotenv').config();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 35,
      trim: true,
      validate(value) {
        // Allows letters, spaces, apostrophes and hyphens
        if (!validator.isAlpha(value, 'en-US', { ignore: ' -' })) {
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
      validate(value) {
        if (!validator.isAlphanumeric(value, 'en-US', { ignore: '/' })) {
          throw new AppError('Please provide a valid employee Id', 422);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new AppError(
            'Your password is not strong. Enter a strong password!',
            422
          );
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
    role: {
      type: String,
      trim: true,
      enum: {
        values: ['admin', 'employee', 'guest'],
        message: `{VALUE} is invalid role type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign(
    {
      _id: user._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
  // to do implement refreshToken flow
  const refreshToken = await jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
  return { token, refreshToken };
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    user.password
  );
  return isPasswordValid;
};

module.exports = mongoose.model('User', userSchema);
