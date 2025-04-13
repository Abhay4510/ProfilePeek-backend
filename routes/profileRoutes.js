const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { validateToken } = require('../middleware/auth');

router.use(validateToken);

router.get('/', profileController.getProfile);

router.put('/', profileController.updateProfile);

module.exports = router;