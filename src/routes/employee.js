const employeeRouter = require('express').Router();
const controller = require('../controllers/appController');
const { verifyJWT } = require('../middleware/verifyJWT');
employeeRouter.get(
  '/paginatedEmployeeList',
  verifyJWT,
  controller.getPaginatedEmployees
);
employeeRouter.get('/analytics', verifyJWT, controller.getAnalytics);
employeeRouter.get(
  '/performanceCards',
  verifyJWT,
  controller.getPerformanceCards
);
employeeRouter.get(
  '/getEmployeeDetails',
  verifyJWT,
  controller.getEmployeeDetails
);
employeeRouter.get('/getFilterList', verifyJWT, controller.getFilters);
employeeRouter.get(
  '/getEmployeeFormConfig',

  controller.fetchEmployeeFormConfig
);
employeeRouter.post(
  '/seed/employees',

  controller.seedEmployees
);

module.exports = employeeRouter;
