const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { validateToken } = require('../middleware/auth');

router.use(validateToken);

router.get('/feed', mediaController.getMediaFeed);

router.get('/comments/:mediaId', mediaController.getComments);

router.post('/comments/reply', mediaController.addReply);

router.post('/add/:mediaId/reply', mediaController.addComment);


module.exports = router;