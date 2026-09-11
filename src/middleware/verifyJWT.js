const jwt = require('jsonwebtoken');
const User = require('../model/user');
const logger = require('../logger/logger');
const AppError = require('../utils/AppError');
const { getRoles } = require('../utils/roleCache');
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      logger.error({
        message: 'Not authenticated',
        method: req?.method,
        url: req?.originalUrl,
        stack: '',
      });
      throw new AppError('Not authenticated', 401, 'NO_TOKEN');
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const { _id } = decoded;
    const user = await User.findById(_id);
    if (!user) {
      throw new AppError('No user found', 404, 'USER_NOT_FOUND');
    }
    req.user = user;
    // get roles
    req.roles = await getRoles();
    next();
  } catch (err) {
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired', 401, 'SESSION_EXPIRED'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }
    next(err);
  }
};

module.exports = { verifyJWT };
