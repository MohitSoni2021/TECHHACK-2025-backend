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
}

module.exports = BaseController;
