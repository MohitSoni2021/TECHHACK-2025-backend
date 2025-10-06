const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Health check route
router.get('/health', notificationController.healthCheck);

// Add other notification routes here
// router.get('/', notificationController.getAll);
// router.get('/user/:userId', notificationController.getByUser);
// router.get('/:id', notificationController.getById);
// router.post('/', notificationController.create);
// router.put('/:id', notificationController.update);
// router.put('/:id/mark-read', notificationController.markAsRead);
// router.get('/user/:userId/unread-count', notificationController.getUnreadCount);
// router.delete('/:id', notificationController.delete);

module.exports = router;
