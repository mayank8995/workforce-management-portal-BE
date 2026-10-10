const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('../model/user');
const Employee = require('../model/employee');
const corsOptions = require('../config/cors');
const logger = require('../logger/logger');
const { getPermissionsFor } = require('../utils/roleCache');
const presence = require('./presence');
const { SOCKET_EVENTS, ROOMS } = require('./events');
require('dotenv').config();

let io = null;
const parseCookies = cookieParser();

const socketError = (message, code) => {
  const err = new Error(message);
  err.data = { code };
  return err;
};

const toPermissionRooms = (permissions) =>
  permissions.flatMap((permission) =>
    permission.actions.map((action) =>
      ROOMS.permission(permission.resource, action)
    )
  );

// Same role/level resolution as the authorizePermissions middleware.
const resolvePermissionRooms = async (user) => {
  if (user?.role === 'admin') {
    return [ROOMS.ADMINS];
  }
  const employee = await Employee.findOne({ email: user.email })
    .select('level')
    .lean();
  return toPermissionRooms(await getPermissionsFor(user.role, employee?.level));
};

const authenticate = async (socket, next) => {
  try {
    await new Promise((resolve) => parseCookies(socket.request, {}, resolve));
    const { token } = socket.request.cookies || {};
    if (!token) {
      return next(socketError('Not authenticated', 'NO_TOKEN'));
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id)
      .select('name email role')
      .lean();
    if (!user) {
      return next(socketError('No user found', 'USER_NOT_FOUND'));
    }
    socket.data.user = user;
    socket.data.tokenExp = decoded.exp;
    socket.data.rooms = await resolvePermissionRooms(user);
    next();
  } catch (err) {
    logger.error({
      message: `socket auth: ${err?.message}`,
      stack: err?.stack,
    });
    if (err.name === 'TokenExpiredError') {
      return next(socketError('Session expired', 'SESSION_EXPIRED'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(socketError('Invalid token', 'INVALID_TOKEN'));
    }
    next(socketError('Authentication failed', 'AUTH_FAILED'));
  }
};

const onConnection = (socket) => {
  const { user, tokenExp, rooms } = socket.data;
  const userId = String(user._id);
  const isAdmin = rooms.includes(ROOMS.ADMINS);

  socket.join([ROOMS.user(userId), ...rooms]);

  if (presence.addConnection(user)) {
    io.to(ROOMS.ADMINS).emit(
      SOCKET_EVENTS.PRESENCE_ONLINE,
      presence.toPublicUser(user)
    );
  }
  if (isAdmin) {
    socket.emit(SOCKET_EVENTS.PRESENCE_LIST, presence.listOnline());
  }

  socket.on(SOCKET_EVENTS.PRESENCE_REQUEST, (ack) => {
    if (typeof ack !== 'function') return;
    ack(isAdmin ? presence.listOnline() : []);
  });

  // The socket outlives the HTTP request, so drop it once the JWT expires.
  const expiryTimer = setTimeout(
    () => {
      socket.emit(SOCKET_EVENTS.SESSION_EXPIRED);
      socket.disconnect(true);
    },
    Math.max(tokenExp * 1000 - Date.now(), 0)
  );

  socket.on('disconnect', (reason) => {
    clearTimeout(expiryTimer);
    if (presence.removeConnection(userId)) {
      io.to(ROOMS.ADMINS).emit(SOCKET_EVENTS.PRESENCE_OFFLINE, { _id: userId });
    }
    logger.info('socket.disconnect', { userId, reason });
  });

  logger.info('socket.connect', { userId, rooms });
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      credentials: true,
    },
  });
  io.use(authenticate);
  io.on('connection', onConnection);
  return io;
};

// No-op until initSocket runs, so services never need to know about sockets.
const emitToRoom = (room, event, payload) => {
  io?.to(room).emit(event, payload);
};

// Moves a user's open sockets to the permission rooms of their new level.
const refreshUserPermissionRooms = async (userId, permissions) => {
  if (!io) return;
  const sockets = await io.in(ROOMS.user(String(userId))).fetchSockets();
  const rooms = toPermissionRooms(permissions);
  for (const socket of sockets) {
    socket.rooms.forEach((room) => {
      if (room.startsWith('perm:')) socket.leave(room);
    });
    socket.join(rooms);
    socket.data.rooms = rooms;
  }
};

module.exports = { initSocket, emitToRoom, refreshUserPermissionRooms };
