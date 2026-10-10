// const db = require('../config/database');
const { fetchFiltersList } = require('./utilService');
const bcrypt = require('bcrypt');
const User = require('../model/user');
const Employee = require('../model/employee');
const Role = require('../model/role');
const AppError = require('../utils/AppError');
require('dotenv').config();

const fetchFilters = (req) => {
  const response = fetchFiltersList(req);
  return {
    success: true,
    ...response,
  };
};

const guest = async (_req, res) => {
  // extract
  // check if user is already registered.
  const user = await User.findOne({ email: process.env.GUEST_EMAIL });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }
  const isPasswordValid = await user.validatePassword(
    process.env.GUEST_PASSWORD
  );
  if (isPasswordValid) {
    const { token } = await user.getJWT();
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
  } else {
    throw new AppError('Invalid credentials', 401);
  }
  let roleType = '';
  let permissions = [];
  if (!(user?.role === 'admin')) {
    if (user?.role === 'guest') {
      roleType = 'guest';
    } else {
      roleType = 'employee';
    }
  }
  const [employee, role] = await Promise.all([
    Employee.findOne({ email: user.email }),
    roleType ? Role.findOne({ name: roleType }) : null,
  ]);
  permissions =
    role?.levelPermissions?.find((user) => user.level === employee?.level)
      ?.permissions || [];
  return {
    _id: employee?._id,
    name: user.name,
    department: user.department,
    designation: employee?.designation ?? user.designation,
    email: user.email,
    empId: user.empId,
    permissions: permissions,
    role: user?.role ?? 'employee',
  };
};

const login = async (req, res) => {
  // extract
  const { email, password } = req.body;
  // check if user is already registered.
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }
  const isPasswordValid = await user.validatePassword(password);
  if (isPasswordValid) {
    const { token } = await user.getJWT();
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
  } else {
    throw new AppError('Invalid credentials', 401);
  }
  let roleType = '';
  let permissions = [];
  if (!(user?.role === 'admin')) {
    if (user?.role === 'guest') {
      roleType = 'guest';
    } else {
      roleType = 'employee';
    }
  }
  const [employee, role] = await Promise.all([
    Employee.findOne({ email: user.email }),
    roleType ? Role.findOne({ name: roleType }) : null,
  ]);
  permissions =
    role?.levelPermissions?.find((user) => user.level === employee?.level)
      ?.permissions || [];
  return {
    _id: employee?._id,
    name: user.name,
    department: user.department,
    designation: employee?.designation ?? user.designation,
    email: user.email,
    empId: user.empId,
    permissions: permissions,
    role: user?.role ?? 'employee',
  };
};

const logout = async (req, res) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
    });
    return {
      success: true,
    };
  } catch (error) {
    throw new AppError(error);
  }
};

const signup = async ({ name, email, password, designation, department }) => {
  // check if user is already registered.
  const isUserRegistered = await User.findOne({ email: email });
  if (isUserRegistered) {
    throw new AppError('User already registerd', 409);
  }
  //encrypt the password
  const hashedPwd = await bcrypt.hash(password, 10);
  // creating new user instance
  const user = new User({
    name,
    email,
    password: hashedPwd,
    designation,
    department,
  });
  await user.save();
  return {
    user,
  };
};

// const fetchEmployeeDetails = (req) => {
//   const { id } = req.query;
//   const employee = db
//     .get('employeeList')
//     .value()
//     .employeeList[0].employees.find((emp) => emp.id === Number(id));
//   return employee;
// };

module.exports = {
  login,
  signup,
  fetchFilters,
  // fetchEmployeeDetails,
  logout,
  guest,
};
