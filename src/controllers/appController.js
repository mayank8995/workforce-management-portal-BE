const service = require('../services/appService');
const { validateSignupData } = require('../utils/validation');
const logger = require('../logger/logger');

const login = async (req, res) => {
  try {
    const response = await service.login(req, res);
    return res.status(200).json({
      success: true,
      message: 'User Logged in',
      data: response,
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err?.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

// const refreshToken = (req, res) => {
//   try {
//     const cookies = req.cookies;
//     if (!cookies?.jwt) {
//       throw new Error('Forbidden');
//     }
//     const refreshToken = cookies.jwt;
//     const user = db.get('users').find({ refreshToken: refreshToken }).value();

//     if (!user) {
//       throw new Error('Unauthorized');
//     }
//     jwt.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET,
//       (err, decoded) => {
//         if (err || user.email !== decoded.email) {
//           throw new Error('Unauthorized');
//         }
//         const accessToken = jwt.sign(
//           {
//             email: decoded.email,
//           },
//           process.env.ACCESS_TOKEN_SECRET,
//           { expiresIn: '30m' }
//         );
//         res.status(200).json({ token: accessToken });
//       }
//     );
//     // const response = service.handleRefreshToken(req);
//     // console.log('response?.accessToken???>>>', response?.accessToken);
//     // const updatedResponse = {
//     //   token: response?.accessToken,
//     // };
//   } catch (error) {
//     res.status(401).json({ success: false, message: error.message });
//   }
// };

const logout = async (req, res) => {
  try {
    const response = await service.logout(req, res);
    return res.status(200).json(response);
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

const signup = async (req, res) => {
  try {
    validateSignupData(req);
    const response = await service.signup(req.body);
    return res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: response,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

const getEmployeeDetails = (req, res) => {
  try {
    const response = service.fetchEmployeeDetails(req);
    return res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};
const checkServerHealth = (req, res) => {
  try {
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

module.exports = {
  login,
  signup,
  getEmployeeDetails,
  // refreshToken,
  logout,
  checkServerHealth,
};
