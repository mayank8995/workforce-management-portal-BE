const employeeRouter = require('express').Router();
const analyticsController = require('../controllers/analyticsController');
const employeesController = require('../controllers/employeeController');
const { verifyJWT } = require('../middleware/verifyJWT');
const { authorizePermissions } = require('../middleware/permissions');

employeeRouter.get(
  '/analytics/:metric/employees',
  verifyJWT,
  authorizePermissions('employee', 'read'),
  analyticsController.getMetricEmployees
);

employeeRouter.get(
  '/employees',
  verifyJWT,
  authorizePermissions('employee', 'read'),
  employeesController.getEmployees
);
employeeRouter.get(
  '/employee/profile',
  verifyJWT,
  employeesController.getEmployeeProfile
);
employeeRouter.patch(
  '/employee/edit/profile',
  verifyJWT,
  authorizePermissions('employee', 'update'),
  employeesController.editEmployeeProfile
);
employeeRouter.get(
  '/employee/details',
  verifyJWT,
  authorizePermissions('employee', 'read'),
  employeesController.getEmployeeDetails
);
employeeRouter.post(
  '/employee/create',
  verifyJWT,
  authorizePermissions('employee', 'create'),
  employeesController.createEmployee
);
employeeRouter.patch(
  '/employee/edit',
  verifyJWT,
  authorizePermissions('employee', 'update'),
  employeesController.editEmployee
);
employeeRouter.delete(
  '/employee/delete',
  verifyJWT,
  authorizePermissions('employee', 'delete'),
  employeesController.deleteEmployee
);
employeeRouter.delete(
  '/employees/promote',
  verifyJWT,
  authorizePermissions('employee', 'update'),
  employeesController.promoteEmployees
);

module.exports = employeeRouter;
