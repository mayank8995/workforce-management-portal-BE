const eventEmitter = require('./eventemitters');
const ActivityLog = require('../model/activitylog');
const logger = require('../logger/logger');
const {
  EMPLOYEE_CREATED,
  EMPLOYEE_EDITED,
  EMPLOYEE_DELETED,
  ADMIN_LOGIN,
  ADMIN_LOGOUT,
} = require('../utils/constants');

eventEmitter.on(EMPLOYEE_CREATED, async ({ adminId, employeeId }) => {
  try {
    await ActivityLog.create({
      adminId,
      action: 'EMPLOYEE_CREATED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'SUCCESS',
      timestamp: new Date(),
    });
    logger.error('EMPLOYEE_CREATED', {
      adminId,
      action: 'EMPLOYEE_CREATED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'SUCCESS',
      timestamp: new Date(),
    });
  } catch (err) {
    logger.error('EMPLOYEE_CREATED', {
      adminId,
      action: 'EMPLOYEE_CREATED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'FAILED',
      timestamp: new Date(),
      error: {
        message: err?.message,
        stack: err?.stack,
      },
    });
  }
});

eventEmitter.on(EMPLOYEE_EDITED, async ({ adminId, employeeId }) => {
  try {
    await ActivityLog.create({
      adminId,
      action: 'EMPLOYEE_EDITED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'SUCCESS',
      timestamp: new Date(),
    });
    logger.info('EMPLOYEE_EDITED', {
      adminId,
      action: 'EMPLOYEE_EDITED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'SUCCESS',
      timestamp: new Date(),
    });
  } catch (err) {
    logger.error('EMPLOYEE_EDITED', {
      adminId,
      action: 'EMPLOYEE_EDITED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'FAILED',
      timestamp: new Date(),
      error: {
        message: err?.message,
        stack: err?.stack,
      },
    });
  }
});

eventEmitter.on(EMPLOYEE_DELETED, async ({ adminId, employeeId }) => {
  try {
    await ActivityLog.create({
      adminId,
      action: 'EMPLOYEE_DELETED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'SUCCESS',
      timestamp: new Date(),
    });
    logger.info('EMPLOYEE_DELETED', {
      adminId,
      action: 'EMPLOYEE_DELETED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'SUCCESS',
      timestamp: new Date(),
    });
  } catch (err) {
    logger.info('EMPLOYEE_DELETED', {
      adminId,
      action: 'EMPLOYEE_DELETED',
      entityType: 'Employee',
      entityId: employeeId,
      status: 'FAILED',
      timestamp: new Date(),
      error: {
        message: err?.message,
        stack: err?.stack,
      },
    });
  }
});
// eventEmitter.on(ADMIN_LOGIN, async ({ adminId, employeeId }) => {
//   await ActivityLog.create({
//     adminId,
//     action: 'ADMIN_LOGIN',
//     entityType: 'Employee',
//     entityId: employeeId,
//     status: 'SUCCESS',
//     timestamp: new Date(),
//   });
// });
// eventEmitter.on(ADMIN_LOGOUT, async ({ adminId, employeeId }) => {
//   await ActivityLog.create({
//     adminId,
//     action: 'ADMIN_LOGOUT',
//     entityType: 'Employee',
//     entityId: employeeId,
//     status: 'SUCCESS',
//     timestamp: new Date(),
//   });
// });
