const BaseController = require('./baseController');
const Notification = require('../models/Notification');

class NotificationController extends BaseController {
  constructor() {
    super(Notification);
  }

  // Add Notification-specific controller methods here
  // For example:
  // getByUser = async (req, res) => { ... }
  // markAsRead = async (req, res) => { ... }
  // getUnreadCount = async (req, res) => { ... }
}

module.exports = new NotificationController();
