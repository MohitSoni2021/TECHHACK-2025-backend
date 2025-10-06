const BaseController = require('./baseController');
const Event = require('../models/Event');

class EventController extends BaseController {
  constructor() {
    super(Event);
  }

  // Add Event-specific controller methods here
  // For example:
  // getUpcoming = async (req, res) => { ... }
  // getByCollege = async (req, res) => { ... }
  // registerParticipant = async (req, res) => { ... }
}

module.exports = new EventController();
