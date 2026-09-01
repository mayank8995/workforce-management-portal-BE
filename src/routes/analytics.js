const analyticsRouter = require('express').Router();
const analyticsController = require('../controllers/analyticsController');
const { authorizePermissions } = require('../middleware/permissions');
const { verifyJWT } = require('../middleware/verifyJWT');

// analyticsRouter.get(
//   '/dashboard/analytics',
//   verifyJWT,
//   analyticsController.getAnalytics
// );
//analyticsRouter.get('/filterList', verifyJWT, analyticsController.getFilters);
analyticsRouter.get(
  '/dashboard/analytics',
  verifyJWT,
  authorizePermissions('dashboard', 'read'),
  analyticsController.getAnalytics
);
analyticsRouter.get('/filterList', verifyJWT, analyticsController.getFilters);

module.exports = analyticsRouter;
