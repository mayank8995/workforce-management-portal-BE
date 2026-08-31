const analyticsRouter = require('express').Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyJWT } = require('../middleware/verifyJWT');

// analyticsRouter.get(
//   '/dashboard/analytics',
//   verifyJWT,
//   analyticsController.getAnalytics
// );
//analyticsRouter.get('/filterList', verifyJWT, analyticsController.getFilters);
analyticsRouter.get('/dashboard/analytics', analyticsController.getAnalytics);
analyticsRouter.get('/filterList', analyticsController.getFilters);

module.exports = analyticsRouter;
