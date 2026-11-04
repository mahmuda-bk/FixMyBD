const express = require('express');
const router = express.Router();
const notif = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, notif.getNotifications);
router.get('/unread', isAuthenticated, notif.getUnreadCount);
router.put('/:id/read', isAuthenticated, notif.markRead);
router.put('/read-all', isAuthenticated, notif.markAllRead);

module.exports = router;
