const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');

// Health check route
router.get('/health', collegeController.healthCheck);

// CRUD routes
router.get('/', collegeController.getAll);
router.get('/verified', collegeController.getVerified);
router.get('/:id', collegeController.getById);
router.post('/', collegeController.create);
router.put('/:id', collegeController.update);
router.delete('/:id', collegeController.delete);

// Actions
router.patch('/:id/verify', collegeController.verify);

module.exports = router;
