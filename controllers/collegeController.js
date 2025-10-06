const BaseController = require('./baseController');
const College = require('../models/College');

class CollegeController extends BaseController {
  constructor() {
    super(College);
  }

  // Override create to ensure password hashing via Mongoose save hooks still apply
  create = async (req, res) => {
    try {
      const college = await this.model.create(req.body);
      res.status(201).json({ status: 'success', data: { doc: college } });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: 'Creation failed', error: error.message });
    }
  };

  // Get all colleges (exclude inactive by default)
  getAll = async (req, res) => {
    try {
      const filter = { active: { $ne: false } };
      const docs = await this.model.find(filter);
      res.status(200).json({ status: 'success', results: docs.length, data: { docs } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching all failed', error: error.message });
    }
  };

  // Get by id (avoid returning inactive)
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await this.model.findOne({ _id: id, active: { $ne: false } });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching by id failed', error: error.message });
    }
  };

  // Update by id, handling password changes correctly
  update = async (req, res) => {
    try {
      const { id } = req.params;

      // If password is being updated, we must use save() to trigger pre-save hook
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'password')) {
        const doc = await this.model.findById(id).select('+password');
        if (!doc) {
          return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
        }
        Object.keys(req.body).forEach((key) => {
          doc[key] = req.body[key];
        });
        // Update passwordChangedAt if password changed
        if (doc.isModified('password')) {
          doc.passwordChangedAt = new Date();
        }
        const updated = await doc.save();
        return res.status(200).json({ status: 'success', data: { doc: updated } });
      }

      // For non-password updates, findByIdAndUpdate is fine
      const doc = await this.model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: 'Update failed', error: error.message });
    }
  };

  // Soft delete: set active=false
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await this.model.findByIdAndUpdate(id, { active: false }, { new: true });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc: null } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Deletion failed', error: error.message });
    }
  };

  // Example custom query: find by verification status
  getVerified = async (req, res) => {
    try {
      const docs = await this.model.find({ isVerified: true, active: { $ne: false } });
      res.status(200).json({ status: 'success', results: docs.length, data: { docs } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching verified colleges failed', error: error.message });
    }
  };

  // Mark a college as verified
  verify = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await this.model.findByIdAndUpdate(id, { isVerified: true }, { new: true, runValidators: true });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: 'Verify failed', error: error.message });
    }
  };
}

module.exports = new CollegeController();
