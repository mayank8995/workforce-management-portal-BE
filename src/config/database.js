const mongoose = require('mongoose');
require('dotenv').config();
console.log('MONGO_URL exists:', !!process.env.MONGO_URL);
const MONGO_URL = process.env.MONGO_URL;
const connectDB = async () => {
  await mongoose.connect(MONGO_URL);
};

module.exports = connectDB;
