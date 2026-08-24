const healthCheckRouter = require('express').Router();
const controller = require('../controllers/appController');

healthCheckRouter.get('/health', controller.checkServerHealth);

module.exports = healthCheckRouter;
