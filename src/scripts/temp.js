const mongoose = require('mongoose');
require('dotenv').config();

const migrateEmpIds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const Role = require('../model/role');
    const perm = [
      {
        name: 'admin',
        levelPermissions: [],
      },
      {
        name: 'employee',
        levelPermissions: [
          {
            level: 'junior',
            permissions: [
              {
                resource: 'dashboardView',
                actions: ['read'],
              },
              {
                resource: 'employeeView',
                actions: ['read'],
              },
              {
                resource: 'analyticsView',
                actions: ['read'],
              },
            ],
          },
          {
            level: 'senior',
            permissions: [
              {
                resource: 'dashboardView',
                actions: ['read', 'update'],
              },
              {
                resource: 'employeeView',
                actions: ['read', 'update'],
              },
              {
                resource: 'analyticsView',
                actions: ['read'],
              },
            ],
          },
          {
            level: 'lead',
            permissions: [
              {
                resource: 'dashboardView',
                actions: ['read', 'update', 'create'],
              },
              {
                resource: 'employeeView',
                actions: ['read', 'update'],
              },
              {
                resource: 'analyticsView',
                actions: ['read'],
              },
            ],
          },
          {
            level: 'executive',
            permissions: [
              {
                resource: 'dashboardView',
                actions: ['read', 'update', 'create'],
              },
              {
                resource: 'employeeView',
                actions: ['read', 'update', 'create'],
              },
              {
                resource: 'analyticsView',
                actions: ['read'],
              },
            ],
          },
        ],
      },
    ];
    await Role.insertMany(perm);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

migrateEmpIds();
