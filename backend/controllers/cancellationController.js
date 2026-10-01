const CancellationRequest = require('../models/CancellationRequest');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

// @desc    Get all cancellation requests
// @route   GET /api/cancellations
// @access  Private
const getCancellationRequests = async (req, res, next) => {
  try {
    const { status, eventId } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (eventId) {
      query.event = eventId;
    }

    const requests = await CancellationRequest.find(query)
      .populate({
        path: 'event',
        select: 'eventName eventType eventDate startTime endTime status budget',
        populate: [
          { path: 'client', select: 'name email phone' },
          { path: 'venue', select: 'name location' },
        ],
      })
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a cancellation request
// @route   POST /api/cancellations
// @access  Private
const createCancellationRequest = async (req, res, next) => {
  try {
    const { event, reason } = req.body;

    if (!event || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event ID and reason for cancellation.',
      });
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (eventDoc.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This event has already been cancelled.',
      });
    }

    // Check if there is already a pending cancellation request for this event
    const existingPending = await CancellationRequest.findOne({
      event,
      status: 'Pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'A cancellation request is already pending for this event.',
      });
    }

    const request = await CancellationRequest.create({
      event,
      requestedBy: req.user._id,
      reason,
      status: 'Pending',
    });

    // Update event status to Pending Cancellation
    eventDoc.status = 'Pending Cancellation';
    await eventDoc.save();

    const populated = await CancellationRequest.findById(request._id)
      .populate('event', 'eventName eventType eventDate status')
      .populate('requestedBy', 'name email role');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve cancellation request
// @route   PUT /api/cancellations/:id/approve
// @access  Private (Admin, Coordinator)
const approveCancellationRequest = async (req, res, next) => {
  try {
    const { reviewComment } = req.body;

    const request = await CancellationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Cancellation request not found.',
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This cancellation request is already ${request.status}.`,
      });
    }

    request.status = 'Approved';
    request.reviewedBy = req.user._id;
    request.reviewComment = reviewComment || 'Approved by coordinator/admin';
    await request.save();

    // Update Event status to Cancelled
    const event = await Event.findById(request.event);
    if (event) {
      event.status = 'Cancelled';
      await event.save();

      // Check if venue can be marked Available (no other Confirmed events)
      const otherConfirmed = await Event.countDocuments({
        venue: event.venue,
        status: 'Confirmed',
        _id: { $ne: event._id },
      });
      if (otherConfirmed === 0) {
        await Venue.findByIdAndUpdate(event.venue, { availabilityStatus: 'Available' });
      }
    }

    const populated = await CancellationRequest.findById(request._id)
      .populate('event', 'eventName eventType eventDate status')
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email role');

    res.json({
      success: true,
      message: 'Cancellation request approved. Event status updated to Cancelled.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject cancellation request
// @route   PUT /api/cancellations/:id/reject
// @access  Private (Admin, Coordinator)
const rejectCancellationRequest = async (req, res, next) => {
  try {
    const { reviewComment } = req.body;

    const request = await CancellationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Cancellation request not found.',
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This cancellation request is already ${request.status}.`,
      });
    }

    request.status = 'Rejected';
    request.reviewedBy = req.user._id;
    request.reviewComment = reviewComment || 'Rejected by coordinator/admin';
    await request.save();

    // Restore Event status to Confirmed
    const event = await Event.findById(request.event);
    if (event) {
      event.status = 'Confirmed';
      await event.save();
    }

    const populated = await CancellationRequest.findById(request._id)
      .populate('event', 'eventName eventType eventDate status')
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email role');

    res.json({
      success: true,
      message: 'Cancellation request rejected. Event status restored to Confirmed.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCancellationRequests,
  createCancellationRequest,
  approveCancellationRequest,
  rejectCancellationRequest,
};
