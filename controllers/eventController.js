const BaseController = require('./baseController');
const Event = require('../models/Event');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

class EventController extends BaseController {
  constructor() {
    super(Event);
  }

  // @desc    Create a new event
  // @route   POST /api/events
  // @access  Private/Admin/CollegeAdmin
  createEvent = catchAsync(async (req, res, next) => {
    const newEvent = await Event.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        event: newEvent
      }
    });
  });

  // @desc    Get all events
  // @route   GET /api/events
  // @access  Public
  getAllEvents = catchAsync(async (req, res, next) => {
    // Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Event.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const events = await query;
    const total = await Event.countDocuments(JSON.parse(queryStr));

    // Send response
    res.status(200).json({
      status: 'success',
      results: events.length,
      total,
      data: {
        events
      }
    });
  });

  // @desc    Get a single event
  // @route   GET /api/events/:id
  // @access  Public
  getEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id)
      .populate('college', 'name')
      .populate('teachers', 'name email')
      .populate('participants', 'name email')
      .populate('teams', 'name');

    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  });

  // @desc    Update an event
  // @route   PATCH /api/events/:id
  // @access  Private/Admin/CollegeAdmin
  updateEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  });

  // @desc    Delete an event
  // @route   DELETE /api/events/:id
  // @access  Private/Admin/CollegeAdmin
  deleteEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  // @desc    Add participant to event
  // @route   POST /api/events/:id/participants
  // @access  Private
  addParticipant = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }
    
    // Check if participant already exists
    if (event.participants.includes(req.body.participantId)) {
      return next(new AppError('Participant already registered for this event', 400));
    }
    
    // Add participant
    event.participants.push(req.body.participantId);
    await event.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  });

  // @desc    Remove participant from event
  // @route   DELETE /api/events/:id/participants/:participantId
  // @access  Private
  removeParticipant = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }
    
    // Remove participant
    event.participants = event.participants.filter(
      participant => participant.toString() !== req.params.participantId
    );
    
    await event.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  });

  // @desc    Add team to event
  // @route   POST /api/events/:id/teams
  // @access  Private
  addTeam = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }
    
    // Check if team already exists in event
    if (event.teams.includes(req.body.teamId)) {
      return next(new AppError('Team already registered for this event', 400));
    }
    
    // Add team
    event.teams.push(req.body.teamId);
    await event.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  });

  // @desc    Remove team from event
  // @route   DELETE /api/events/:id/teams/:teamId
  // @access  Private
  removeTeam = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }
    
    // Remove team
    event.teams = event.teams.filter(
      team => team.toString() !== req.params.teamId
    );
    
    await event.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  });

  // @desc    Update event results
  // @route   PATCH /api/events/:id/results
  // @access  Private/Admin/Judge
  updateEventResults = catchAsync(async (req, res, next) => {
    const { winner, winnerModel, runnerUp, runnerUpModel, scoreBoard } = req.body;
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }
    
    // Update results
    event.results = {
      winner,
      winnerModel,
      runnerUp,
      runnerUpModel,
      scoreBoard
    };
    
    // Update event status to completed
    event.status = 'completed';
    
    await event.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  });
}

module.exports = new EventController();
