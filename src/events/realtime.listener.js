const eventEmitter = require('./eventemitters');
const User = require('../model/user');
const logger = require('../logger/logger');
const { emitToRoom } = require('../socket');
const {
  SOCKET_EVENTS,
  ROOMS,
  ANALYTICS_DEBOUNCE_MS,
} = require('../socket/events');
const {
  EMPLOYEE_CREATED,
  EMPLOYEE_EDITED,
  EMPLOYEE_DELETED,
} = require('../utils/constants');

// Admins skip permission rooms, so every audience includes them explicitly.
const EMPLOYEE_READERS = [ROOMS.permission('employee', 'read'), ROOMS.ADMINS];
const DASHBOARD_READERS = [ROOMS.permission('dashboard', 'read'), ROOMS.ADMINS];

let analyticsTimer = null;
const scheduleAnalyticsRefresh = () => {
  if (analyticsTimer) return;
  analyticsTimer = setTimeout(() => {
    analyticsTimer = null;
    emitToRoom(DASHBOARD_READERS, SOCKET_EVENTS.ANALYTICS_UPDATED, {
      at: new Date().toISOString(),
    });
  }, ANALYTICS_DEBOUNCE_MS);
};

const broadcastEmployeeChange =
  (action, activityAction) =>
  async ({ adminId, employeeId, employeeName }) => {
    const at = new Date().toISOString();
    emitToRoom(EMPLOYEE_READERS, SOCKET_EVENTS.EMPLOYEE_CHANGED, {
      action,
      employeeId: String(employeeId),
      at,
    });
    scheduleAnalyticsRefresh();

    try {
      const actor = await User.findById(adminId).select('name').lean();
      emitToRoom(ROOMS.ADMINS, SOCKET_EVENTS.ACTIVITY_NEW, {
        action: activityAction,
        entityType: 'Employee',
        entityId: String(employeeId),
        entityName: employeeName,
        actor: { _id: String(adminId), name: actor?.name },
        at,
      });
    } catch (err) {
      logger.error('socket.activity', {
        action: activityAction,
        error: { message: err?.message, stack: err?.stack },
      });
    }
  };

eventEmitter.on(
  EMPLOYEE_CREATED,
  broadcastEmployeeChange('created', 'EMPLOYEE_CREATED')
);
eventEmitter.on(
  EMPLOYEE_EDITED,
  broadcastEmployeeChange('edited', 'EMPLOYEE_EDITED')
);
eventEmitter.on(
  EMPLOYEE_DELETED,
  broadcastEmployeeChange('deleted', 'EMPLOYEE_DELETED')
);
