const express = require('express');
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Public routes
router
  .route('/')
  .get(eventController.getAllEvents);

router
  .route('/:id')
  .get(eventController.getEvent);

// Protected routes - require authentication
router.use(authController.protect);

// Participant management
router
  .route('/:id/participants')
  .post(
    authController.restrictTo(ROLES.STUDENT, ROLES.TEACHER, ROLES.COLLEGE_ADMIN, ROLES.ADMIN),
    eventController.addParticipant
  );

router
  .route('/:id/participants/:participantId')
  .delete(
    authController.restrictTo(ROLES.STUDENT, ROLES.TEACHER, ROLES.COLLEGE_ADMIN, ROLES.ADMIN),
    eventController.removeParticipant
  );

// Team management
router
  .route('/:id/teams')
  .post(
    authController.restrictTo(ROLES.STUDENT, ROLES.TEACHER, ROLES.COLLEGE_ADMIN, ROLES.ADMIN),
    eventController.addTeam
  );

router
  .route('/:id/teams/:teamId')
  .delete(
    authController.restrictTo(ROLES.STUDENT, ROLES.TEACHER, ROLES.COLLEGE_ADMIN, ROLES.ADMIN),
    eventController.removeTeam
  );

// Admin and College Admin restricted routes
router.use(authController.restrictTo(ROLES.COLLEGE_ADMIN, ROLES.ADMIN));

router
  .route('/')
  .post(eventController.createEvent);

router
  .route('/:id')
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

// Event results (admin and judges)
router
  .route('/:id/results')
  .patch(
    authController.restrictTo(ROLES.ADMIN, ROLES.JUDGE, ROLES.COLLEGE_ADMIN),
    eventController.updateEventResults
  );

module.exports = router;
