const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Profile picture must be 5 MB or smaller' : (err.message || 'Image upload failed') });
    next();
  });
}, auth.register);
router.post('/login', auth.login);
router.get('/logout', auth.logout);
router.get('/me', isAuthenticated, auth.getMe);
router.put('/profile', isAuthenticated, auth.updateProfile);
router.get('/profile-stats', isAuthenticated, auth.getProfileStats);

module.exports = router;
