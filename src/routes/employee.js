const employeeRouter = require('express').Router();
const appController = require('../controllers/appController');
const analyticsController = require('../controllers/analyticsController');
const employeesController = require('../controllers/employeeController');
const { verifyJWT } = require('../middleware/verifyJWT');
const { authorizePermissions } = require('../middleware/permissions');
// employeeRouter.get(
//   '/paginatedEmployeeList',
//   verifyJWT,
//   appController.getPaginatedEmployees
// );
// employeeRouter.get('/analytics', verifyJWT, appController.getAnalytics);
// employeeRouter.get(
//   '/performanceCards',
//   verifyJWT,
//   appController.getPerformanceCards
// );
// employeeRouter.get(
//   '/getEmployeeDetails',
//   verifyJWT,
//   appController.getEmployeeDetails
// );
// employeeRouter.get('/getFilterList', verifyJWT, appController.getFilters);
// employeeRouter.get(
//   '/getEmployeeFormConfig',
//   appController.fetchEmployeeFormConfig
// );
//--------------//
// employeeRouter.get(
//   '/analytics/:metric/employees',
//   verifyJWT,
//   analyticsController.getMetricEmployees
// );

// employeeRouter.get('/employees', verifyJWT, employeesController.getEmployees);
// employeeRouter.get(
//   '/employee/profile',
//   verifyJWT,
//   employeesController.getEmployeeProfile
// );
// employeeRouter.get(
//   '/employee/details',
//   verifyJWT,
//   employeesController.getEmployeeDetails
// );
// employeeRouter.post(
//   '/employee/create',
//   verifyJWT,
//   employeesController.createEmployee
// );
// employeeRouter.post(
//   '/employee/edit/:id',
//   verifyJWT,
//   employeesController.editEmployee
// );
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
employeeRouter.put(
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

module.exports = employeeRouter;
