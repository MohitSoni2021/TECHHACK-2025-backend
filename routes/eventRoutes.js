const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Health check route
router.get('/health', eventController.healthCheck);

// Add other event routes here
// router.get('/', eventController.getAll);
// router.get('/upcoming', eventController.getUpcoming);
// router.get('/college/:collegeId', eventController.getByCollege);
// router.get('/:id', eventController.getById);
// router.post('/', eventController.create);
// router.put('/:id', eventController.update);
// router.delete('/:id', eventController.delete);
// router.post('/:id/register', eventController.registerParticipant);

module.exports = router;
