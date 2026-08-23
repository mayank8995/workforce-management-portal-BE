const profileRouter = require('express').Router();
const controller = require('../controllers/appController');
const { verifyJWT } = require('../middleware/verifyJWT');

profileRouter.get('/profile', verifyJWT, controller.getProfile);
profileRouter.post('/profile', verifyJWT, controller.addProfile);
profileRouter.patch('/profile', verifyJWT, controller.editProfile);

module.exports = profileRouter;
