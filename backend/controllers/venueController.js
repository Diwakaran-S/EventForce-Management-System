const Venue = require('../models/Venue');
const Event = require('../models/Event');

// @desc    Get all venues with search and filter
// @route   GET /api/venues
// @access  Private
const getVenues = async (req, res, next) => {
  try {
    const { search, availabilityStatus } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    if (availabilityStatus && availabilityStatus !== 'all') {
      query.availabilityStatus = availabilityStatus;
    }

    const venues = await Venue.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: venues.length,
      data: venues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single venue by ID with events
// @route   GET /api/venues/:id
// @access  Private
const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    const events = await Event.find({ venue: venue._id })
      .populate('client', 'name email phone')
      .sort({ eventDate: 1 });

    res.json({
      success: true,
      data: {
        ...venue.toObject(),
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create venue
// @route   POST /api/venues
// @access  Private (Admin, Coordinator)
const createVenue = async (req, res, next) => {
  try {
    const { name, location, address, capacity, availabilityStatus } = req.body;

    if (!name || !location || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide venue name, location, and capacity',
      });
    }

    if (Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Venue capacity must be greater than 0',
      });
    }

    const venue = await Venue.create({
      name,
      location,
      address: address || '',
      capacity: Number(capacity),
      availabilityStatus: availabilityStatus || 'Available',
    });

    res.status(201).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
// @access  Private (Admin, Coordinator)
const updateVenue = async (req, res, next) => {
  try {
    let venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    if (req.body.capacity !== undefined && Number(req.body.capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Venue capacity must be greater than 0',
      });
    }

    venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
// @access  Private (Admin)
const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    const activeEvents = await Event.countDocuments({
      venue: venue._id,
      status: { $in: ['Planned', 'Confirmed', 'Pending Cancellation'] },
    });

    if (activeEvents > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete venue associated with active events',
      });
    }

    await Venue.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Venue deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
};
