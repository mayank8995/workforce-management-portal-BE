const aiRouter = require('express').Router();
const aiController = require('../controllers/aiController');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({ windowMs: 60_000, max: 10 });
aiRouter.post('/ai/query', limiter, aiController.summarize);

module.exports = aiRouter;
