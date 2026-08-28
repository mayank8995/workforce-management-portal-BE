const mongoose = require('mongoose');
require('dotenv').config();

const migrateEmpIds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const User = require('../model/user');
    const Employee = require('../model/employee');

    const users = await User.find({}, { email: 1, empId: 1 }).lean();

    let updated = 0;
    let notFound = 0;

    for (const user of users) {
      if (!user.email || !user.empId) {
        continue;
      }

      const result = await Employee.updateOne(
        { email: user.email },
        {
          $set: {
            empId: user.empId,
          },
        }
      );

      if (result.matchedCount === 0) {
        console.log(`Employee not found: ${user.email}`);
        notFound++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    }

    console.log(`Updated: ${updated}`);
    console.log(`Not found: ${notFound}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

migrateEmpIds();
