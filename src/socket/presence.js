// In-memory presence: userId -> { user, sockets, since }.
// Works for a single server instance; multiple instances would need a shared store (e.g. Redis).
const online = new Map();

const toPublicUser = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role ?? 'employee',
});

// Returns true when this is the user's first open connection.
const addConnection = (user) => {
  const userId = String(user._id);
  const entry = online.get(userId);
  if (entry) {
    entry.sockets += 1;
    return false;
  }
  online.set(userId, {
    user: toPublicUser(user),
    sockets: 1,
    since: new Date().toISOString(),
  });
  return true;
};

// Returns true when the user's last open connection has closed.
const removeConnection = (userId) => {
  const entry = online.get(String(userId));
  if (!entry) return false;
  entry.sockets -= 1;
  if (entry.sockets > 0) return false;
  online.delete(String(userId));
  return true;
};

const listOnline = () =>
  [...online.values()].map(({ user, since }) => ({ ...user, since }));

module.exports = { addConnection, removeConnection, listOnline, toPublicUser };
