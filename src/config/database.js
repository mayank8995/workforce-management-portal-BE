const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(
    'mongodb+srv://loadinglazy108_db_user:______________@admin-portal-node0.iqomevi.mongodb.net/adminPortal'
  );
};

module.exports = connectDB;
