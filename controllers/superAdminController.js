const BaseController = require('./baseController');
const SuperAdmin = require('../models/SuperAdmin');
const jwt = require('jsonwebtoken');

class SuperAdminController extends BaseController {
  constructor() {
    super(SuperAdmin);
  }

  // Add SuperAdmin-specific controller methods here
  // For example:
  // login = async (req, res) => { ... }
  // resetPassword = async (req, res) => { ... }
  // getActivityLogs = async (req, res) => { ... }

  // Helper to sign JWT token
  signToken = (id) => {
    return jwt.sign({ id, role: 'superadmin' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });
  };

  // POST /api/super-admin/login
  // Body: { email, password }
  login = async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide email and password',
        });
      }

      const user = await this.model.findOne({ email }).select('+password');
      if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).json({
          status: 'fail',
          message: 'Incorrect email or password',
        });
      }

      const token = this.signToken(user._id);

      // Remove password from output
      const { password: _, ...safeUser } = user.toObject();

      return res.status(200).json({
        status: 'success',
        token,
        data: {
          user: safeUser,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error logging in super admin',
        error: error.message,
      });
    }
  };

  // PATCH /api/super-admin/reset-password
  // Body: { currentPassword, newPassword }
  resetPassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body || {};
      const userId = req.user?.id || req.user?._id || req.body?.userId; // support middleware or direct body

      if (!userId) {
        return res.status(400).json({
          status: 'fail',
          message: 'User identification missing. Ensure auth middleware sets req.user or provide userId.',
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide currentPassword and newPassword',
        });
      }

      const user = await this.model.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ status: 'fail', message: 'Super admin not found' });
      }

      const isCorrect = await user.correctPassword(currentPassword, user.password);
      if (!isCorrect) {
        return res.status(401).json({ status: 'fail', message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      const token = this.signToken(user._id);
      const { password: _, ...safeUser } = user.toObject();

      return res.status(200).json({
        status: 'success',
        message: 'Password updated successfully',
        token,
        data: { user: safeUser },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error resetting password',
        error: error.message,
      });
    }
  };

  // GET /api/super-admin/:id/activity-logs
  // Placeholder until ActivityLog model exists
  getActivityLogs = async (req, res) => {
    try {
      const { id } = req.params;
      // TODO: Integrate with ActivityLog model when available.
      return res.status(200).json({
        status: 'success',
        message: 'Activity logs endpoint not yet implemented. Returning placeholder data.',
        data: { superAdminId: id, logs: [] },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error fetching activity logs',
        error: error.message,
      });
    }
  };

  // Update super admin; handle password correctly by using save()
  // Mirrors logic from `studentController.update` to ensure hashing hooks run
  update = async (req, res) => {
    try {
      const { id } = req.params;

      // If password is provided, fetch doc with password and use save() so pre('save') runs
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'password')) {
        const doc = await this.model.findById(id).select('+password');
        if (!doc) {
          return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
        }
        Object.keys(req.body).forEach((key) => {
          doc[key] = req.body[key];
        });
        if (doc.isModified('password')) {
          doc.passwordChangedAt = new Date();
        }
        const updated = await doc.save();
        return res.status(200).json({ status: 'success', data: { doc: updated } });
      }

      // No password field; safe to use findByIdAndUpdate
      const doc = await this.model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: 'Update failed', error: error.message });
    }
  };
}

module.exports = new SuperAdminController();
