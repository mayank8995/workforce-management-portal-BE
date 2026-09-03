const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Role = require('../model/role');
const logger = require('../logger/logger');
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      logger.error({
        message: 'Unauthorized',
        method: req?.method,
        url: req?.originalUrl,
        stack: '',
      });
      return res.status(403).json({ token: false });
    }
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const { _id } = decoded;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error(`No user found`);
    }
    req.user = user;
    // get roles
    const roles = await Role.find({});
    req.roles = roles;
    next();
  } catch (err) {
    res.status(403).send('ERROR:' + err?.message);
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

module.exports = { verifyJWT };
