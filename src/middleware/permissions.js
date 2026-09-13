const Employee = require('../model/employee');
const logger = require('../logger/logger');
const AppError = require('../utils/AppError');

const authorizePermissions = (resource, action) => {
  return async (req, res, next) => {
    const user = req?.user;
    const employee = await Employee.findOne({ email: user.email });
    if (!employee) {
      throw new AppError(`Employee not found::${user}`, 404);
    }
    let roleType = '';
    if (user?.role === 'admin') {
      next();
      return;
    } else if (user?.role === 'guest') {
      roleType = 'guest';
    } else {
      roleType = 'employee';
    }
    const role = req?.roles?.find((role) => role?.name === roleType);
    const permissions = role?.levelPermissions?.find(
      (user) => user.level === employee?.level
    )?.permissions;
    const isAllowed = permissions?.some((permission) => {
      return (
        permission.resource === resource && permission.actions.includes(action)
      );
    });
    if (!isAllowed) {
      logger.error({
        message: 'Insufficient permissions',
        method: req?.method,
        url: req?.originalUrl,
        stack: '',
      });
      return res
        .status(401)
        .json({ success: false, message: 'Insufficient permissions' });
    }
    req.permissions = permissions;
    next();
  };
};
module.exports = { authorizePermissions };
