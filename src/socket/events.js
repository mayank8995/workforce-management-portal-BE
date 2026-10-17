// Single source of truth for the realtime contract shared with the frontend.
const SOCKET_EVENTS = {
  // server -> client
  EMPLOYEE_CHANGED: 'employee:changed',
  ACTIVITY_NEW: 'activity:new',
  ANALYTICS_UPDATED: 'analytics:updated',
  PRESENCE_LIST: 'presence:list',
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
  SESSION_EXPIRED: 'session:expired',
  // sent only to the promoted user, carrying their new permissions
  USER_PROMOTED: 'user:promoted',
  // client -> server (with ack)
  PRESENCE_REQUEST: 'presence:request',
};

const ROOMS = {
  ADMINS: 'admins',
  user: (userId) => `user:${userId}`,
  permission: (resource, action) => `perm:${resource}:${action}`,
};

// Analytics are expensive to recompute, so bursts of changes collapse into one signal.
const ANALYTICS_DEBOUNCE_MS = 2000;

module.exports = { SOCKET_EVENTS, ROOMS, ANALYTICS_DEBOUNCE_MS };
