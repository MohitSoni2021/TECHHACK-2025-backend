const BaseController = require('./baseController');
const Student = require('../models/Student');

class StudentController extends BaseController {
  constructor() {
    super(Student);
  }

  // Add Student-specific controller methods here
  // For example:
  // getByCollege = async (req, res) => { ... }
  // getByTeam = async (req, res) => { ... }
  // getByEvent = async (req, res) => { ... }
}

module.exports = new StudentController();
