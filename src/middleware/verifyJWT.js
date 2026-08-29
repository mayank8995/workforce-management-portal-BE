const jwt = require('jsonwebtoken');
const User = require('../model/user');
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ token: false });
    }
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { _id } = decoded;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error(err);
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).send('ERROR:' + error.message);
  }
};

module.exports = { verifyJWT };
