const express = require('express');
const router = express.Router();
const comments = require('../controllers/commentController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/:id', comments.getComments);
router.post('/:id', isAuthenticated, comments.addComment);
router.delete('/:id/:commentId', isAuthenticated, comments.deleteComment);

module.exports = router;
