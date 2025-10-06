const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Health check route
router.get('/health', teamController.healthCheck);

// Add other team routes here
router.get('/', teamController.getAll);
router.get('/event/:eventId', teamController.getByEvent);
router.get('/college/:collegeId', teamController.getByCollege);
router.post('/', teamController.create);
router.post('/:id/members', teamController.addMember);
router.delete('/:id/members/:memberId', teamController.removeMember);
router.get('/:id', teamController.getById);
router.put('/:id', teamController.update);
router.delete('/:id', teamController.delete);

module.exports = router;
