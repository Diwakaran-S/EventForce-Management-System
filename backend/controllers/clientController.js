const Client = require('../models/Client');
const Event = require('../models/Event');

// @desc    Get all clients with search and filter
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res, next) => {
  try {
    const { search, city } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client by ID with events
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const events = await Event.find({ client: client._id }).populate('venue', 'name location');

    res.json({
      success: true,
      data: {
        ...client.toObject(),
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a client
// @route   POST /api/clients
// @access  Private (Admin, Coordinator)
const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, address, city } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide client name, email, and phone number',
      });
    }

    const existingClient = await Client.findOne({ email: email.toLowerCase().trim() });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client email already exists.',
      });
    }

    const client = await Client.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      address,
      city,
    });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private (Admin, Coordinator)
const updateClient = async (req, res, next) => {
  try {
    let client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    if (req.body.email && req.body.email.toLowerCase().trim() !== client.email) {
      const emailExists = await Client.findOne({
        email: req.body.email.toLowerCase().trim(),
        _id: { $ne: client._id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Client email already exists.',
        });
      }
    }

    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const activeEvents = await Event.countDocuments({
      client: client._id,
      status: { $in: ['Planned', 'Confirmed', 'Pending Cancellation'] },
    });

    if (activeEvents > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete client with active events',
      });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
