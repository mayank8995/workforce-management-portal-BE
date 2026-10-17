const Role = require('../model/role');
let roles = null;

const loadRoles = async () => {
  roles = await Role.find({}).lean();
  return roles;
};

const getRoles = async () => roles ?? (await loadRoles());

// Admins bypass permission checks, so they have no level-based permission list.
const getPermissionsFor = async (userRole, level) => {
  const roleType = userRole === 'guest' ? 'guest' : 'employee';
  const role = (await getRoles())?.find((r) => r?.name === roleType);
  return (
    role?.levelPermissions?.find((lp) => lp.level === level)?.permissions || []
  );
};

module.exports = {
  loadRoles,
  getRoles,
  getPermissionsFor,
  invalidate: () => {
    roles = null;
  },
};
