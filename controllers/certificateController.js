const BaseController = require('./baseController');
const Certificate = require('../models/Certificate');

class CertificateController extends BaseController {
  constructor() {
    super(Certificate);
  }

  // You can add Certificate-specific controller methods here
  // For example:
  // getByStudentId = async (req, res) => { ... }
  // getByEventId = async (req, res) => { ... }
}

module.exports = new CertificateController();
