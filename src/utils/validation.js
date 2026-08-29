const validator = require('validator');
const { EMPLOYEE_SAFE_DATA, ALLOWED_EDITABLE_FIELDS } = require('./constants');
const validateSignupData = (req) => {
  const { name, email, empId, password, department, designation } = req.body;
  if (!name) {
    throw new Error(`Name is required`);
  } else if (!validator.isAlphanumeric(empId, 'en-US', { ignore: '/' })) {
    throw new Error('Please provide a valid employee Id');
  } else if (!validator.isEmail(email)) {
    throw new Error('Email Id is invalid');
  } else if (!validator.isStrongPassword(password)) {
    throw new Error('Password is weak');
  } else if (!department) {
    throw new Error('Department is required');
  } else if (!designation) {
    throw new Error('Designation is required');
  }
};

const validateProfileEditData = (req) => {
  const ALLOWED_EDITS = ['photoUrl'];
  const isAllowed = Object.keys(req.body).every((k) =>
    ALLOWED_EDITS.includes(k)
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
  console.log(req.body);
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
