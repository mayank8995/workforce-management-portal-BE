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
                resource: 'dashboard',
                actions: ['read'],
              },
              {
                resource: 'employee',
                actions: ['read'],
              },
              {
                resource: 'analytics',
                actions: ['read'],
              },
            ],
          },
          {
            level: 'senior',
            permissions: [
              {
                resource: 'dashboard',
                actions: ['read', 'update'],
              },
              {
                resource: 'employee',
                actions: ['read', 'update'],
              },
              {
                resource: 'analytics',
                actions: ['read'],
              },
            ],
          },
          {
            level: 'lead',
            permissions: [
              {
                resource: 'dashboard',
                actions: ['read', 'update', 'create'],
              },
              {
                resource: 'employee',
                actions: ['read', 'update'],
              },
              {
                resource: 'analytics',
                actions: ['read'],
              },
            ],
          },
          {
            level: 'executive',
            permissions: [
              {
                resource: 'dashboard',
                actions: ['read', 'update', 'create'],
              },
              {
                resource: 'employee',
                actions: ['read', 'update', 'create'],
              },
              {
                resource: 'analytics',
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
