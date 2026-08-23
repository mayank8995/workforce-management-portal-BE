const authRouter = require('express').Router();
const controller = require('../controllers/appController');
authRouter.post('/login', controller.login);
authRouter.post('/logout', controller.logout);
authRouter.post('/signup', controller.signup);
authRouter.post('/signupbulk', controller.signupbulk);
authRouter.get('/refreshToken', controller.refreshToken);

module.exports = authRouter;
