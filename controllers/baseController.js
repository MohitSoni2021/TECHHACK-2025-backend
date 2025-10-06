class BaseController {
  constructor(model) {
    this.model = model;
  }

  // Health check endpoint
  healthCheck = async (req, res) => {
    try {
      const count = await this.model.countDocuments();
      res.status(200).json({
        status: 'success',
        message: `${this.model.modelName} service is running`,
        data: {
          model: this.model.modelName,
          documentCount: count
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: `Error checking ${this.model.modelName} health`,
        error: error.message
      });
    }
  };

  // Basic CRUD operations can be added here
  // create = async (req, res) => { ... }
  // getAll = async (req, res) => { ... }
  // getById = async (req, res) => { ... }
  // update = async (req, res) => { ... }
  // delete = async (req, res) => { ... }

  // Create a new document
  create = async (req, res) => {
    try {
      const doc = await this.model.create(req.body);
      res.status(201).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: 'Creation failed', error: error.message });
    }
  };

  // Get all documents
  getAll = async (req, res) => {
    try {
      const docs = await this.model.find();
      res.status(200).json({ status: 'success', results: docs.length, data: { docs } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching all failed', error: error.message });
    }
  };

  // Get a single document by ID
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await this.model.findById(id);
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Fetching by id failed', error: error.message });
    }
  };

  // Update a document by ID
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await this.model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: 'Update failed', error: error.message });
    }
  };

  // Delete a document by ID
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await this.model.findByIdAndDelete(id);
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: `${this.model.modelName} not found` });
      }
      res.status(204).json({ status: 'success', data: null });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Deletion failed', error: error.message });
    }
  };
}

module.exports = BaseController;
