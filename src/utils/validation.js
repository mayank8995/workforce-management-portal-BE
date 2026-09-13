const validator = require('validator');
const {
  EMPLOYEE_SAFE_DATA,
  ALLOWED_EDITABLE_FIELDS,
  ALLOWED_EDITS_USER_PROFILE,
} = require('./constants');
const AppError = require('./AppError');
const validateSignupData = (req) => {
  const { name, email, password, department, designation } = req.body;
  if (!name) {
    throw new AppError(`Name is required`, 422);
  }
  // else if (!validator.isAlphanumeric(empId, 'en-US', { ignore: '/' })) {
  //   throw new Error('Please provide a valid employee Id');
  // }
  else if (!validator.isEmail(email)) {
    throw new AppError('Email Id is invalid', 422);
  } else if (!validator.isStrongPassword(password)) {
    throw new AppError('Password is weak', 422);
  } else if (!department) {
    throw new AppError('Department is required', 422);
  } else if (!designation) {
    throw new AppError('Designation is required', 422);
  }
};

const validateProfileEditData = (req) => {
  const isAllowed = Object.keys(req.body).every((k) =>
    ALLOWED_EDITS_USER_PROFILE.includes(k)
  );
  return isAllowed;
};

const validateCreateEmployeeData = (req) => {
  const isAllowed = Object.keys(req.body).every((k) =>
    EMPLOYEE_SAFE_DATA.includes(k)
  );
  return isAllowed;
};
const validateEditEmployeeData = (req) => {
  const isAllowed = Object.keys(req.body).every((k) =>
    ALLOWED_EDITABLE_FIELDS.includes(k)
  );
  return isAllowed;
};

module.exports = {
  validateSignupData,
  validateProfileEditData,
  validateCreateEmployeeData,
  validateEditEmployeeData,
};
