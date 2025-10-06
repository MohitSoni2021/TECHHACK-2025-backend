const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Health check route
router.get('/health', studentController.healthCheck);

// CRUD routes
router.get('/', studentController.getAll);
router.get('/college/:collegeId', studentController.getByCollege);
router.get('/event/:eventId', studentController.getByEvent);
router.get('/department/:department', studentController.getByDepartment);
router.get('/roll/:rollNumber', studentController.getByRollNumber);
router.get('/:id', studentController.getById);
router.post('/', studentController.create);
router.put('/:id', studentController.update);
router.delete('/:id', studentController.delete);

module.exports = router;
