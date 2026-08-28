const mongoose = require('mongoose');
const validator = require('validator');
const { DEPARTMENTS } = require('../utils/constants');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
          throw new Error(
            'Name can contain only letters, spaces, apostrophes and hyphens'
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
          throw new Error('Please provide a valid email address');
        }
      },
    },
    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isAlphanumeric(value, 'en-US', { ignore: '/' })) {
          throw new Error('Please provide a valid employee Id');
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            'Your password is not strong. Enter a strong password!'
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
