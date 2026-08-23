const db = require('../config/db');
const { getList, fetchFiltersList } = require('./utilService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
/** used this in node terminal  - require('crypto').randomBytes(64).toString('hex') for generating access and refresh token */

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

const login = async ({ email, password }) => {
  // evaluate password
  const user = db.get('users').find({ email }).value();
  if (!user) {
    throw new Error('Invalid Credentials');
  }
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error('Invalid Credentials');
  }
  const accessToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
  const currentUser = { ...user, refreshToken };
  await db.get('users').find({ email: user.email }).assign(currentUser).write();

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name },
    message: 'Logged in successfully',
  };
};

const logout = async (req, res) => {
  const cookies = req.cookies;
  const refreshToken = cookies.jwt;
  const user = db.get('users').find({ refreshToken: refreshToken }).value();
  if (!user) {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  }
  // delete refresh token from db;
  if (user) {
    delete user.refreshToken;
    await db.write();
  }
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  return {
    success: true,
  };
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

const signup = async ({
  name,
  email,
  password,
  designation,
  department,
  empId,
}) => {
  const duplicate = db.get('users').find({ email }).value();
  if (duplicate) {
    throw new Error('Email already registered');
  }

  //encrypt the password
  const hashedPwd = await bcrypt.hash(password, 10);

  //store the new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPwd,
    designation,
    department,
    empId,
  };
  db.get('users').push(newUser).write();
  return {
    token: `fake-jwt-${newUser.id}-${Date.now()}`,
    user: { id: newUser.id, name: newUser.name },
    message: 'Sign up successful',
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
};
