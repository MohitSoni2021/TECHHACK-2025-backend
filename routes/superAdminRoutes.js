const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

// Health check route
router.get('/health', superAdminController.healthCheck);

// Add other super admin routes here
// router.post('/login', superAdminController.login);
// router.post('/reset-password', superAdminController.resetPassword);
// router.get('/:id', superAdminController.getById);
// router.get('/:id/activity-logs', superAdminController.getActivityLogs);
// router.post('/', superAdminController.create);
// router.put('/:id', superAdminController.update);
// router.delete('/:id', superAdminController.delete);

module.exports = router;
