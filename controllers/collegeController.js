const BaseController = require('./baseController');
const College = require('../models/College');

class CollegeController extends BaseController {
  constructor() {
    super(College);
  }

  // Add College-specific controller methods here
  // For example:
  // getByLocation = async (req, res) => { ... }
  // getByType = async (req, res) => { ... }
}

module.exports = new CollegeController();
