const service = require('../services/appService');
const { validateSignupData } = require('../utils/validation');
const { asyncHandler } = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const response = await service.login(req, res);
  return res.status(200).json({
    success: true,
    message: 'User Logged in',
    data: response,
  });
});

const logout = asyncHandler(async (req, res) => {
  const response = await service.logout(req, res);
  return res.status(200).json(response);
});

const signup = asyncHandler(async (req, res) => {
  validateSignupData(req);
  const response = await service.signup(req.body);
  return res.status(201).json({
    success: true,
    message: 'User added successfully',
    data: response,
  });
});

// const getEmployeeDetails = async (req, res) => {
//   const response = service.fetchEmployeeDetails(req);
//   return res.status(200).json(response);
// };
const checkServerHealth = asyncHandler(async (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

module.exports = {
  login,
  signup,
  // getEmployeeDetails,
  // refreshToken,
  logout,
  checkServerHealth,
};
