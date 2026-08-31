const db = require('../config/database');
const { getList, fetchFiltersList } = require('./utilService');
const bcrypt = require('bcrypt');
const User = require('../model/user');
const Employee = require('../model/employee');
require('dotenv').config();

const paginatedEmployeeList = (req) => {
  let response;
  try {
    response = getList(req);
  } catch (error) {
    throw error;
  }
  return {
    success: true,
    ...response,
  };
};
const fetchFilters = (req) => {
  const response = fetchFiltersList(req);
  return {
    success: true,
    ...response,
  };
};

const fetchEmployeeList = () => db.get('employeeList').value();
const fetchAnalytics = () => db.get('analytics').value();
const fetchPerformanceCards = () => db.get('performanceCards').value();

const fetchProfile = ({ id }) => {
  const profileArray = db.get('profile');
  const foundProfile = profileArray.find((profile) => profile.id === id);
  return foundProfile;
};

const login = async (req, res) => {
  // extract
  const { email, password } = req.body;
  // check if user is already registered.
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error('Invalid credentials');
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
    throw new Error('Invalid credentials');
  }
  const employee = await Employee.find({ email: user.email });
  return {
    // 'name department designation email empId'
    _id: employee?.[0]?._id,
    name: user.name,
    department: user.department,
    designation: user.designation,
    email: user.email,
    empId: user.empId,
  };
};

const logout = async (req, res) => {
  // const cookies = req.cookies;
  // const refreshToken = cookies.jwt;
  // const user = db.get('users').find({ refreshToken: refreshToken }).value();
  // if (!user) {
  //   res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  // }
  // // delete refresh token from db;
  // if (user) {
  //   delete user.refreshToken;
  //   await db.write();
  // }
  // res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  // return {
  //   success: true,
  // };
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
    });
    return {
      success: true,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const addProfile = ({
  name,
  phone,
  email,
  department,
  designation,
  empId,
  jdate,
  wmode,
  location,
  image,
  id,
}) => {
  const newProfile = {
    id,
    name,
    phone,
    email,
    department,
    designation,
    empId,
    jdate,
    wmode,
    location,
    image,
  };
  db.get('profile').push(newProfile).write();
  return { message: 'Profile added successfully' };
};

const editProfile = (payload) => {
  const profileArray = db.get('profile');
  const foundProfile = profileArray.find(
    (profile) => profile.id === payload.id
  );
  foundProfile.assign(payload).write();
  return { message: 'Profile edited successfully' };
};

const signup = async ({ name, email, password, designation, department }) => {
  // check if user is already registered.
  const isUserRegistered = await User.findOne({ email: email });
  if (isUserRegistered) {
    throw new Error('User already registerd');
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

const fetchEmployeeDetails = (req) => {
  const { id } = req.query;
  const employee = db
    .get('employeeList')
    .value()
    .employeeList[0].employees.find((emp) => emp.id === Number(id));
  return employee;
};

const seedEmployees = async () => {
  try {
    const employeeData = require('../../dummy.json');
    const employees = employeeData.employeeList[0].employees;
    await Employee.deleteMany({});

    const createdUsers = await Employee.insertMany(employees);

    return {
      message: 'Employees seeded successfully',
      count: createdUsers.length,
    };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  fetchEmployeeList,
  paginatedEmployeeList,
  fetchAnalytics,
  fetchPerformanceCards,
  fetchProfile,
  login,
  addProfile,
  editProfile,
  signup,
  fetchFilters,
  fetchEmployeeDetails,
  logout,
  seedEmployees,
};
