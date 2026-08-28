const service = require('../services/appService');
const db = require('../config/database');
const employeeForm = require('../config/employeeFormConfig');
const { validateSignupData } = require('../utils/validation');
const getEmployees = (req, res) => {
  try {
    const response = service.fetchEmployeeList();
    res.status(200).json(response);
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: 'Error is fetching Employee list' });
  }
};
const getPaginatedEmployees = (req, res) => {
  try {
    const response = service.paginatedEmployeeList(req);
    res.status(200).json(response);
    // res.status(500).json({});
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getFilters = (req, res) => {
  try {
    const response = service.fetchFilters(req);
    // console.log('in final response>>', response);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error in filters' });
  }
};
const getAnalytics = (req, res) => {
  try {
    const response = service.fetchAnalytics();
    res.status(200).json(response);
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: 'Error in fetching Analytics' });
  }
};
const getPerformanceCards = (req, res) => {
  try {
    const response = service.fetchPerformanceCards();
    res.status(200).json(response);
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: 'Error in fetching performance cards' });
  }
};
const getProfile = (req, res) => {
  try {
    const response = service.fetchProfile(req.query);
    res.status(200).json(response);
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: 'Error in fetching user profile' });
  }
};
const login = async (req, res) => {
  try {
    const response = await service.login(req, res);
    res.status(200).json({
      success: true,
      message: 'User Logged in',
      data: response,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const refreshToken = (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      throw new Error('Forbidden');
    }
    const refreshToken = cookies.jwt;
    const user = db.get('users').find({ refreshToken: refreshToken }).value();

    if (!user) {
      throw new Error('Unauthorized');
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || user.email !== decoded.email) {
          throw new Error('Unauthorized');
        }
        const accessToken = jwt.sign(
          {
            email: decoded.email,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '30m' }
        );
        res.status(200).json({ token: accessToken });
      }
    );
    // const response = service.handleRefreshToken(req);
    // console.log('response?.accessToken???>>>', response?.accessToken);
    // const updatedResponse = {
    //   token: response?.accessToken,
    // };
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const response = await service.logout(req, res);
    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};
const addProfile = (req, res) => {
  try {
    const response = service.addProfile(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const editProfile = (req, res) => {
  try {
    const response = service.editProfile(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const signup = async (req, res) => {
  try {
    validateSignupData(req);
    const response = await service.signup(req.body);
    res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: response,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getEmployeeDetails = (req, res) => {
  try {
    const response = service.fetchEmployeeDetails(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const checkServerHealth = (req, res) => {
  res.status(200).json({ status: 'ok' });
};

const fetchEmployeeFormConfig = (req, res) => {
  try {
    res.status(200).json(employeeForm);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const seedEmployees = async (req, res) => {
  try {
    const response = await service.seedEmployees();
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getPaginatedEmployees,
  getAnalytics,
  getPerformanceCards,
  getProfile,
  login,
  addProfile,
  editProfile,
  signup,
  getFilters,
  getEmployeeDetails,
  refreshToken,
  logout,
  checkServerHealth,
  fetchEmployeeFormConfig,
  seedEmployees,
};
