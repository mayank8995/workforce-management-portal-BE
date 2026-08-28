const employeeRouter = require('express').Router();
const appController = require('../controllers/appController');
const analyticsController = require('../controllers/analyticsController');
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
  '/employee/analytics/:type',
  analyticsController.fetchEmployeeAnalytics
);
employeeRouter.post(
  '/employee/analytics/populate/:type',
  analyticsController.populateEmployeeAnalytics
);

module.exports = employeeRouter;
