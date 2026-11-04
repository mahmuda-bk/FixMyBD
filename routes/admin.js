const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/users', isAuthenticated, isAdmin, admin.getUsers);
router.put('/users/:id/role', isAuthenticated, isAdmin, admin.updateUserRole);
router.put('/users/:id/toggle', isAuthenticated, isAdmin, admin.toggleUserActive);
router.get('/categories', admin.getCategories);
router.post('/categories', isAuthenticated, isAdmin, admin.createCategory);
router.delete('/categories/:id', isAuthenticated, isAdmin, admin.deleteCategory);
router.get('/locations', admin.getLocations);
router.post('/locations', isAuthenticated, isAdmin, admin.createLocation);
router.delete('/locations/:id', isAuthenticated, isAdmin, admin.deleteLocation);
router.get('/dashboard', isAuthenticated, isAdmin, admin.getDashboardStats);
router.put('/assign/:id', isAuthenticated, isAdmin, admin.assignAuthority);

module.exports = router;
