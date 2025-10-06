const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');

// Health check route
router.get('/health', collegeController.healthCheck);

// Add other college routes here
// router.get('/', collegeController.getAll);
// router.get('/:id', collegeController.getById);
// router.post('/', collegeController.create);
// router.put('/:id', collegeController.update);
// router.delete('/:id', collegeController.delete);

module.exports = router;
