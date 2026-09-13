const Role = require('../model/role');
let roles = null;

const loadRoles = async () => {
  roles = await Role.find({}).lean();
  return roles;
};

const getRoles = async () => roles ?? (await loadRoles());

module.exports = {
  loadRoles,
  getRoles,
  invalidate: () => {
    roles = null;
  },
};
