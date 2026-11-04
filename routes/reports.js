const express = require('express');
const router = express.Router();
const reports = require('../controllers/reportController');
const { isAuthenticated, isAuthority } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', isAuthenticated, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'photos', maxCount: 5 }]), reports.createReport);
router.get('/', reports.getReports);
router.get('/my', isAuthenticated, reports.getMyReports);
router.get('/stats', reports.getStats);
router.get('/authority', isAuthenticated, isAuthority, reports.getAuthorityReports);
router.get('/:id', reports.getReportById);
router.post('/:id/support', isAuthenticated, reports.supportReport);
router.put('/:id/status', isAuthenticated, isAuthority, reports.updateStatus);
router.post('/:id/feedback', isAuthenticated, reports.addFeedback);
router.post('/:id/flag', isAuthenticated, reports.flagReport);

module.exports = router;
