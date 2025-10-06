const BaseController = require('./baseController');
const Student = require('../models/Student');

class StudentController extends BaseController {
  constructor() {
    super(Student);
  }

  // Create new student (pre-save hook hashes password)
  create = async (req, res) => {
    try {
      const student = await this.model.create(req.body);
      res.status(201).json({ status: 'success', data: { doc: student } });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: 'Creation failed', error: error.message });
    }
  };

  // Get all active students
  getAll = async (req, res) => {
    try {
      const filter = { active: { $ne: false } };
      const docs = await this.model.find(filter);
      res.status(200).json({ status: 'success', results: docs.length, data: { docs } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching all failed', error: error.message });
    }
  };

  // Get student by id (active only)
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

  // Update student; handle password correctly by using save()
  update = async (req, res) => {
    try {
      const { id } = req.params;

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

      const doc = await this.model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: 'Update failed', error: error.message });
    }
  };

  // Soft delete student
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

  // Get students by college id
  getByCollege = async (req, res) => {
    try {
      const { collegeId } = req.params;
      const docs = await this.model.find({ college: collegeId, active: { $ne: false } });
      res.status(200).json({ status: 'success', results: docs.length, data: { docs } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching by college failed', error: error.message });
    }
  };

  // Get students by event id
  getByEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const docs = await this.model.find({ eventsParticipated: eventId, active: { $ne: false } });
      res.status(200).json({ status: 'success', results: docs.length, data: { docs } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching by event failed', error: error.message });
    }
  };

  // Get students by department
  getByDepartment = async (req, res) => {
    try {
      const { department } = req.params;
      const docs = await this.model.find({ department, active: { $ne: false } });
      res.status(200).json({ status: 'success', results: docs.length, data: { docs } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching by department failed', error: error.message });
    }
  };

  // Get one student by roll number
  getByRollNumber = async (req, res) => {
    try {
      const { rollNumber } = req.params;
      const doc = await this.model.findOne({ rollNumber, active: { $ne: false } });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching by roll number failed', error: error.message });
    }
  };
}

module.exports = new StudentController();