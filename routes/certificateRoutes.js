const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// Health check route
router.get('/health', certificateController.healthCheck);

// Add other certificate routes here
// router.get('/', certificateController.getAll);
// router.get('/:id', certificateController.getById);
// router.post('/', certificateController.create);
// router.put('/:id', certificateController.update);
// router.delete('/:id', certificateController.delete);

module.exports = router;
