const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  const Employee = require('../model/employee');
  const EmployeePromotion = require('../model/employeePromotion');
  try {
    // promotion insertion code
    const promotions = [
      {
        empId: 'B/100',
        previousDesignation: 'Software Engineer',
        currentDesignation: 'Senior Software Engineer',
        promotedOn: '2024-02-15',
      },
      {
        empId: 'B/101',
        previousDesignation: 'Associate Product Analyst',
        currentDesignation: 'Product Analyst',
        promotedOn: '2024-04-10',
      },
      {
        empId: 'B/107',
        previousDesignation: 'Product Analyst',
        currentDesignation: 'Associate Product Manager',
        promotedOn: '2024-06-20',
      },
      {
        empId: 'B/108',
        previousDesignation: 'Software Engineer',
        currentDesignation: 'Senior Software Engineer',
        promotedOn: '2024-08-05',
      },
      {
        empId: 'B/115',
        previousDesignation: 'Software Engineer',
        currentDesignation: 'Frontend Developer',
        promotedOn: '2024-09-18',
      },
      {
        empId: 'B/124',
        previousDesignation: 'Junior Software Engineer',
        currentDesignation: 'Software Engineer',
        promotedOn: '2024-11-12',
      },
      {
        empId: 'B/127',
        previousDesignation: 'Software Engineer',
        currentDesignation: 'Frontend Developer',
        promotedOn: '2025-01-20',
      },
      {
        empId: 'B/131',
        previousDesignation: 'Senior Software Engineer',
        currentDesignation: 'Tech Lead',
        promotedOn: '2025-03-14',
      },
      {
        empId: 'B/132',
        previousDesignation: 'Software Engineer',
        currentDesignation: 'Senior Software Engineer',
        promotedOn: '2025-05-09',
      },
      {
        empId: 'B/134',
        previousDesignation: 'Software Engineer',
        currentDesignation: 'Senior Software Engineer',
        promotedOn: '2025-07-22',
      },
      {
        empId: 'B/135',
        previousDesignation: 'UI/UX Designer',
        currentDesignation: 'Senior UI/UX Designer',
        promotedOn: '2025-09-11',
      },
      {
        empId: 'B/138',
        previousDesignation: 'Senior Software Engineer',
        currentDesignation: 'Tech Lead',
        promotedOn: '2025-11-17',
      },
      {
        empId: 'B/102',
        previousDesignation: 'Senior Software Engineer',
        currentDesignation: 'Tech Lead',
        promotedOn: '2026-01-12',
      },
      {
        empId: 'B/103',
        previousDesignation: 'Senior Software Engineer',
        currentDesignation: 'Tech Lead',
        promotedOn: '2026-02-18',
      },
      {
        empId: 'B/105',
        previousDesignation: 'Visual Designer',
        currentDesignation: 'Senior Visual Designer',
        promotedOn: '2026-03-25',
      },
      {
        empId: 'B/109',
        previousDesignation: 'Software Engineer',
        currentDesignation: 'Senior Software Engineer',
        promotedOn: '2026-04-15',
      },
      {
        empId: 'B/116',
        previousDesignation: 'Associate Product Analyst',
        currentDesignation: 'Product Analyst',
        promotedOn: '2026-05-08',
      },
      {
        empId: 'B/117',
        previousDesignation: 'Senior Software Engineer',
        currentDesignation: 'Tech Lead',
        promotedOn: '2026-06-16',
      },
      {
        empId: 'B/118',
        previousDesignation: 'Senior Software Engineer',
        currentDesignation: 'Tech Lead',
        promotedOn: '2026-07-10',
      },
      {
        empId: 'B/119',
        previousDesignation: 'Software Engineer',
        currentDesignation: 'Senior Software Engineer',
        promotedOn: '2026-08-05',
      },
    ];

    const promotionDocuments = [];

    for (const promotion of promotions) {
      const employee = await Employee.findOne({
        empId: promotion.empId,
        $nor: [
          {
            rating: { $lt: 4 },
            attendancePercentage: { $lt: 88 },
          },
        ],
      });
      if (!employee) {
        continue;
      }

      promotionDocuments.push({
        employeeId: employee._id,
        previousDesignation: promotion.previousDesignation,
        currentDesignation: promotion.currentDesignation,
        promotedOn: new Date(promotion.promotedOn),
      });
    }
    await EmployeePromotion.insertMany(promotionDocuments);
  } finally {
    await mongoose.disconnect();
  }
}

run();
