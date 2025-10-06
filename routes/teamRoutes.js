const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Health check route
router.get('/health', teamController.healthCheck);

// Add other team routes here
// router.get('/', teamController.getAll);
// router.get('/event/:eventId', teamController.getByEvent);
// router.get('/college/:collegeId', teamController.getByCollege);
// router.get('/:id', teamController.getById);
// router.post('/', teamController.create);
// router.put('/:id', teamController.update);
// router.delete('/:id', teamController.delete);
// router.post('/:id/members', teamController.addMember);
// router.delete('/:id/members/:memberId', teamController.removeMember);

module.exports = router;
