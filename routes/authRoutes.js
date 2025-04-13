const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateToken } = require('../middleware/auth');

router.get('/instagram/url', authController.getAuthUrl);

router.get('/instagram/callback', authController.handleCallbackGet);

router.post('/instagram/callback', authController.handleCallbackPost);

router.get('/status', validateToken, authController.checkAuthStatus);

router.post('/logout', validateToken, authController.logout);

module.exports = router;