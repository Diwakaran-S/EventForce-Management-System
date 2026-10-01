const Vendor = require('../models/Vendor');
const EventVendor = require('../models/EventVendor');

// @desc    Get all vendors with search and filters
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res, next) => {
  try {
    const { search, serviceType, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (serviceType && serviceType !== 'all') {
      query.serviceType = serviceType;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const vendors = await Vendor.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vendor by ID with assigned events
// @route   GET /api/vendors/:id
// @access  Private
const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    const assignments = await EventVendor.find({ vendor: vendor._id })
      .populate({
        path: 'event',
        select: 'eventName eventType eventDate startTime endTime status budget',
        populate: { path: 'venue', select: 'name location' },
      })
      .sort({ assignedDate: -1 });

    res.json({
      success: true,
      data: {
        ...vendor.toObject(),
        assignments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vendor
// @route   POST /api/vendors
// @access  Private (Admin, Coordinator)
const createVendor = async (req, res, next) => {
  try {
    const { name, email, phone, serviceType, status } = req.body;

    if (!name || !email || !phone || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and service type',
      });
    }

    const vendor = await Vendor.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      serviceType,
      status: status || 'Available',
    });

    res.status(201).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Admin, Coordinator)
const updateVendor = async (req, res, next) => {
  try {
    let vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Admin)
const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    const activeAssignments = await EventVendor.countDocuments({
      vendor: vendor._id,
      status: 'Assigned',
    });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vendor with active event assignments',
      });
    }

    await EventVendor.deleteMany({ vendor: vendor._id });
    await Vendor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};
