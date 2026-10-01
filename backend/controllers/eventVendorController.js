const EventVendor = require('../models/EventVendor');
const Event = require('../models/Event');
const Vendor = require('../models/Vendor');

// @desc    Get event-vendor assignments
// @route   GET /api/event-vendors
// @access  Private
const getEventVendors = async (req, res, next) => {
  try {
    const { event, vendor } = req.query;
    let query = {};

    if (event) query.event = event;
    if (vendor) query.vendor = vendor;

    const assignments = await EventVendor.find(query)
      .populate('event', 'eventName eventType eventDate startTime endTime status')
      .populate('vendor', 'name email phone serviceType status')
      .sort({ assignedDate: -1 });

    res.json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign vendor to event
// @route   POST /api/event-vendors
// @access  Private (Admin, Coordinator)
const assignVendor = async (req, res, next) => {
  try {
    const { event, vendor, status } = req.body;

    if (!event || !vendor) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both event and vendor IDs.',
      });
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const vendorDoc = await Vendor.findById(vendor);
    if (!vendorDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
      });
    }

    // Check duplicate assignment
    const existing = await EventVendor.findOne({ event, vendor });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This vendor is already assigned to this event.',
      });
    }

    const assignment = await EventVendor.create({
      event,
      vendor,
      status: status || 'Assigned',
    });

    // Mark vendor status as 'Booked'
    await Vendor.findByIdAndUpdate(vendor, { status: 'Booked' });

    const populated = await EventVendor.findById(assignment._id)
      .populate('event', 'eventName eventType eventDate status')
      .populate('vendor', 'name email phone serviceType status');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This vendor is already assigned to this event.',
      });
    }
    next(error);
  }
};

// @desc    Update assignment status
// @route   PUT /api/event-vendors/:id
// @access  Private (Admin, Coordinator, Staff)
const updateEventVendorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let assignment = await EventVendor.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    assignment.status = status || assignment.status;
    await assignment.save();

    const populated = await EventVendor.findById(assignment._id)
      .populate('event', 'eventName eventType eventDate status')
      .populate('vendor', 'name email phone serviceType status');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove vendor assignment
// @route   DELETE /api/event-vendors/:id
// @access  Private (Admin, Coordinator)
const removeEventVendor = async (req, res, next) => {
  try {
    const assignment = await EventVendor.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    const vendorId = assignment.vendor;
    await EventVendor.findByIdAndDelete(req.params.id);

    // If no other active assignments exist for this vendor, set back to Available
    const otherActive = await EventVendor.countDocuments({
      vendor: vendorId,
      status: 'Assigned',
    });
    if (otherActive === 0) {
      await Vendor.findByIdAndUpdate(vendorId, { status: 'Available' });
    }

    res.json({
      success: true,
      message: 'Vendor assignment removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventVendors,
  assignVendor,
  updateEventVendorStatus,
  removeEventVendor,
};
