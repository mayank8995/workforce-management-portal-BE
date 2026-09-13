const aiRouter = require('express').Router();
const aiController = require('../controllers/aiController');

aiRouter.post('/ai/query', aiController.summarize);

module.exports = aiRouter;
