const express = require('express');
const router = express.Router();

// Import all route files
const certificateRoutes = require('./certificateRoutes');
const collegeRoutes = require('./collegeRoutes');
const eventRoutes = require('./eventRoutes');
const notificationRoutes = require('./notificationRoutes');
const studentRoutes = require('./studentRoutes');
const superAdminRoutes = require('./superAdminRoutes');
const teacherRoutes = require('./teacherRoutes');
const teamRoutes = require('./teamRoutes');

// Define routes
router.use('/certificates', certificateRoutes);
router.use('/colleges', collegeRoutes);
router.use('/events', eventRoutes);
router.use('/notifications', notificationRoutes);
router.use('/students', studentRoutes);
router.use('/super-admins', superAdminRoutes);
router.use('/teachers', teacherRoutes);
router.use('/teams', teamRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = router;
