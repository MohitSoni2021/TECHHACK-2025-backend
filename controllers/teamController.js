const BaseController = require('./baseController');
const Team = require('../models/Team');

class TeamController extends BaseController {
  constructor() {
    super(Team);
  }

  // Add Team-specific controller methods here
  // For example:
  // getByEvent = async (req, res) => { ... }
  // getByCollege = async (req, res) => { ... }
  // addMember = async (req, res) => { ... }
  // removeMember = async (req, res) => { ... }
}

module.exports = new TeamController();
