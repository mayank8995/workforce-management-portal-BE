const employeeRouter = require('express').Router();
const appController = require('../controllers/appController');
const analyticsController = require('../controllers/analyticsController');
const employeesController = require('../controllers/employeeController');
const { verifyJWT } = require('../middleware/verifyJWT');
employeeRouter.get(
  '/paginatedEmployeeList',
  verifyJWT,
  appController.getPaginatedEmployees
);
employeeRouter.get('/analytics', verifyJWT, appController.getAnalytics);
employeeRouter.get(
  '/performanceCards',
  verifyJWT,
  appController.getPerformanceCards
);
employeeRouter.get(
  '/getEmployeeDetails',
  verifyJWT,
  appController.getEmployeeDetails
);
employeeRouter.get('/getFilterList', verifyJWT, appController.getFilters);
employeeRouter.get(
  '/getEmployeeFormConfig',

  appController.fetchEmployeeFormConfig
);

employeeRouter.get(
  '/analytics/:metric/employees',
  verifyJWT,
  analyticsController.getMetricEmployees
);

employeeRouter.get('/employees', verifyJWT, employeesController.getEmployees);
employeeRouter.get(
  '/employee/profile',
  verifyJWT,
  employeesController.getEmployeeProfile
);
employeeRouter.get(
  '/employee/details',
  verifyJWT,
  employeesController.getEmployeeDetails
);
employeeRouter.post(
  '/employee/create',
  verifyJWT,
  employeesController.createEmployee
);
employeeRouter.post(
  '/employee/edit/:id',
  verifyJWT,
  employeesController.editEmployee
);

module.exports = employeeRouter;
