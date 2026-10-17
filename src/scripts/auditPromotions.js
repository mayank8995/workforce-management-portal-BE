// Audits designation consistency across Employee, User and EmployeePromotion.
//   node src/scripts/auditPromotions.js          -> dry run, read-only report
//   node src/scripts/auditPromotions.js --apply  -> also syncs User.designation from Employee
// Promotion-history mismatches are only reported: which side is correct is a business decision.
const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('../model/employee');
const User = require('../model/user');
const EmployeePromotion = require('../model/employeePromotion');

const apply = process.argv.includes('--apply');

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  try {
    const [employees, users, latestPromotions] = await Promise.all([
      Employee.find({}).select('name email designation level').lean(),
      User.find({}).select('email designation').lean(),
      EmployeePromotion.aggregate([
        { $sort: { promotedOn: -1 } },
        { $group: { _id: '$employeeId', latest: { $first: '$$ROOT' } } },
      ]),
    ]);

    const usersByEmail = new Map(users.map((u) => [u.email, u]));
    const employeeEmails = new Set(employees.map((e) => e.email));
    const promotionByEmployee = new Map(
      latestPromotions.map((p) => [String(p._id), p.latest])
    );

    const missingLevel = employees.filter((e) => !e.level);
    const withoutUser = employees.filter((e) => !usersByEmail.has(e.email));
    const usersWithoutEmployee = users.filter(
      (u) => !employeeEmails.has(u.email)
    );
    const userDrift = employees.filter((e) => {
      const user = usersByEmail.get(e.email);
      return user && user.designation !== e.designation;
    });
    const historyDrift = employees.filter((e) => {
      const latest = promotionByEmployee.get(String(e._id));
      return latest && latest.currentDesignation !== e.designation;
    });
    const orphanPromotions = latestPromotions.filter(
      (p) => !employees.some((e) => String(e._id) === String(p._id))
    );

    console.log(`Mode: ${apply ? 'APPLY' : 'DRY RUN (no writes)'}`);
    console.log(`Employees: ${employees.length}, Users: ${users.length}`);
    console.log(`\nEmployees missing level: ${missingLevel.length}`);
    console.log(`Employees without a User: ${withoutUser.length}`);
    console.log(`Users without an Employee: ${usersWithoutEmployee.length}`);
    console.log(`Promotions for deleted employees: ${orphanPromotions.length}`);

    console.log(
      `\nUser.designation differs from Employee.designation: ${userDrift.length}`
    );
    userDrift.forEach((e) =>
      console.log(
        `  ${e.name}: user="${usersByEmail.get(e.email).designation}" employee="${e.designation}"`
      )
    );

    console.log(
      `\nLatest promotion differs from Employee.designation (manual review): ${historyDrift.length}`
    );
    historyDrift.forEach((e) => {
      const latest = promotionByEmployee.get(String(e._id));
      console.log(
        `  ${e.name}: employee="${e.designation}" promotion="${latest.previousDesignation} -> ${latest.currentDesignation}" on ${latest.promotedOn.toISOString().slice(0, 10)}`
      );
    });

    if (apply && userDrift.length) {
      const result = await User.bulkWrite(
        userDrift.map((e) => ({
          updateOne: {
            filter: { email: e.email },
            update: { $set: { designation: e.designation } },
          },
        }))
      );
      console.log(`\nSynced ${result.modifiedCount} User designations.`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
