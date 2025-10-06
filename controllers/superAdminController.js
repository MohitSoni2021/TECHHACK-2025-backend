const BaseController = require('./baseController');
const SuperAdmin = require('../models/SuperAdmin');

class SuperAdminController extends BaseController {
  constructor() {
    super(SuperAdmin);
  }

  // Add SuperAdmin-specific controller methods here
  // For example:
  // login = async (req, res) => { ... }
  // resetPassword = async (req, res) => { ... }
  // getActivityLogs = async (req, res) => { ... }
}

module.exports = new SuperAdminController();
