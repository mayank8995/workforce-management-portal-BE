// One-off data repair. Employee is the source of truth.
//   node src/scripts/migrations/2026-10-10-fix-data-consistency.js          -> dry run (no writes)
//   node src/scripts/migrations/2026-10-10-fix-data-consistency.js --apply  -> backup + apply in one transaction
// Safe to re-run: once applied, a second run finds nothing to change.
//
// 1. User.name / department / designation copied from the matching Employee.
// 2. Seeded promotion records (no promotedBy) that are an employee's latest promotion
//    but contradict their current designation are deleted. They were attached to the
//    wrong employees by the seed script, so no edit can make them meaningful. Records
//    created through the promotion workflow (promotedBy set) are never touched.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('../../model/employee');
const User = require('../../model/user');
const EmployeePromotion = require('../../model/employeePromotion');
const { runInTransaction } = require('../../utils/transaction');

const apply = process.argv.includes('--apply');
const USER_FIELDS = ['name', 'department', 'designation'];

const planUserFixes = (employees, users) => {
  const employeeByEmail = new Map(employees.map((e) => [e.email, e]));
  return users.flatMap((user) => {
    const employee = employeeByEmail.get(user.email);
    if (!employee) return [];
    const set = Object.fromEntries(
      USER_FIELDS.filter((f) => user[f] !== employee[f]).map((f) => [
        f,
        employee[f],
      ])
    );
    return Object.keys(set).length ? [{ before: user, set }] : [];
  });
};

const planPromotionDeletes = (employees, promotions) => {
  const employeeById = new Map(employees.map((e) => [String(e._id), e]));
  const latestByEmployee = new Map();
  for (const p of [...promotions].sort((a, b) => b.promotedOn - a.promotedOn)) {
    const key = String(p.employeeId);
    if (!latestByEmployee.has(key)) latestByEmployee.set(key, p);
  }
  return [...latestByEmployee]
    .map(([employeeId, promotion]) => ({
      employee: employeeById.get(employeeId),
      before: promotion,
    }))
    .filter(
      ({ employee, before }) =>
        employee &&
        !before.promotedBy &&
        before.currentDesignation !== employee.designation
    );
};

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  try {
    const [employees, users, promotions] = await Promise.all([
      Employee.find({}).lean(),
      User.find({}).lean(),
      EmployeePromotion.find({}).lean(),
    ]);
    const userFixes = planUserFixes(employees, users);
    const promotionDeletes = planPromotionDeletes(employees, promotions);

    console.log(`Mode: ${apply ? 'APPLY' : 'DRY RUN (no writes)'}`);
    console.log(`\nUser records to sync from Employee: ${userFixes.length}`);
    userFixes.forEach(({ before, set }) =>
      Object.entries(set).forEach(([field, value]) =>
        console.log(
          `  ${before.email}  ${field}: "${before[field]}" -> "${value}"`
        )
      )
    );
    console.log(
      `\nContradicting seed promotion records to delete: ${promotionDeletes.length}`
    );
    promotionDeletes.forEach(({ employee, before }) =>
      console.log(
        `  ${employee.name}: employee="${employee.designation}" record="${before.previousDesignation} -> ${before.currentDesignation}" (${before.promotedOn.toISOString().slice(0, 10)})`
      )
    );
    console.log(
      `\nPromotion records kept: ${promotions.length - promotionDeletes.length} of ${promotions.length}`
    );

    if (!apply) {
      console.log('\nDry run only. Re-run with --apply to write these changes.');
      return;
    }
    if (!userFixes.length && !promotionDeletes.length) {
      console.log('\nNothing to change.');
      return;
    }

    const backupDir = path.join(__dirname, '../../../backups');
    await fs.promises.mkdir(backupDir, { recursive: true });
    const backupFile = path.join(
      backupDir,
      `data-consistency-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    await fs.promises.writeFile(
      backupFile,
      JSON.stringify(
        {
          users: userFixes.map((f) => f.before),
          employeepromotions: promotionDeletes.map((f) => f.before),
        },
        null,
        2
      )
    );
    console.log(`\nBackup of original documents: ${backupFile}`);

    // Filters include the old values so a record changed since planning is left alone.
    const result = await runInTransaction(async (session) => {
      const userResult = userFixes.length
        ? await User.bulkWrite(
            userFixes.map(({ before, set }) => ({
              updateOne: {
                filter: {
                  _id: before._id,
                  ...Object.fromEntries(
                    Object.keys(set).map((f) => [f, before[f]])
                  ),
                },
                update: { $set: set },
              },
            })),
            { session }
          )
        : { modifiedCount: 0 };
      const promotionResult = promotionDeletes.length
        ? await EmployeePromotion.deleteMany(
            {
              _id: { $in: promotionDeletes.map(({ before }) => before._id) },
              promotedBy: { $exists: false },
            },
            { session }
          )
        : { deletedCount: 0 };
      return {
        users: userResult.modifiedCount,
        promotions: promotionResult.deletedCount,
      };
    });
    console.log(
      `Applied: ${result.users} users updated, ${result.promotions} promotion records deleted.`
    );
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
