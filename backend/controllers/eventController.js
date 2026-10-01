const Event = require('../models/Event');
const Venue = require('../models/Venue');
const EventVendor = require('../models/EventVendor');
const Feedback = require('../models/Feedback');
const CancellationRequest = require('../models/CancellationRequest');

// Helper to check for venue booking overlap
const checkVenueOverlap = async (venueId, eventDate, startTime, endTime, excludeEventId = null) => {
  const targetDate = new Date(eventDate);
  const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

  const query = {
    venue: venueId,
    eventDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['Cancelled', 'Rejected'] },
  };

  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }

  const existingEvents = await Event.find(query);

  for (const event of existingEvents) {
    // Time overlap check: startA < endB && endA > startB
    if (startTime < event.endTime && endTime > event.startTime) {
      return {
        hasOverlap: true,
        conflictingEvent: event,
      };
    }
  }

  return { hasOverlap: false };
};

// @desc    Get all events with search, filtering and sorting
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res, next) => {
  try {
    const { search, status, eventType, dateFrom, dateTo, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    if (dateFrom || dateTo) {
      query.eventDate = {};
      if (dateFrom) query.eventDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.eventDate.$lte = toDate;
      }
    }

    let sortOptions = { eventDate: 1 };
    if (sort === 'date_desc') sortOptions = { eventDate: -1 };
    if (sort === 'created_desc') sortOptions = { createdAt: -1 };
    if (sort === 'budget_desc') sortOptions = { budget: -1 };
    if (sort === 'budget_asc') sortOptions = { budget: 1 };

    const events = await Event.find(query)
      .populate('client', 'name email phone city')
      .populate('venue', 'name location capacity availabilityStatus')
      .populate('createdBy', 'name email role')
      .sort(sortOptions);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID with vendors, cancellation, feedback
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('client', 'name email phone address city')
      .populate('venue', 'name location address capacity availabilityStatus')
      .populate('createdBy', 'name email role');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const assignedVendors = await EventVendor.find({ event: event._id })
      .populate('vendor', 'name email phone serviceType status')
      .sort({ assignedDate: -1 });

    const cancellationRequests = await CancellationRequest.find({ event: event._id })
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    const feedbackList = await Feedback.find({ event: event._id })
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        assignedVendors,
        cancellationRequests,
        feedback: feedbackList,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin, Coordinator)
const createEvent = async (req, res, next) => {
  try {
    const {
      eventName,
      eventType,
      eventDate,
      startTime,
      endTime,
      client,
      venue,
      budget,
      description,
      status,
    } = req.body;

    if (!eventName || !eventType || !eventDate || !startTime || !endTime || !client || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields.',
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time.',
      });
    }

    if (budget !== undefined && Number(budget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be greater than or equal to 0.',
      });
    }

    // Check venue existence
    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) {
      return res.status(404).json({
        success: false,
        message: 'Selected venue does not exist.',
      });
    }

    if (venueDoc.availabilityStatus === 'Unavailable') {
      return res.status(400).json({
        success: false,
        message: 'Selected venue is marked as Unavailable.',
      });
    }

    // Check Venue Double-Booking (Backend Validation Rule 19)
    const { hasOverlap } = await checkVenueOverlap(venue, eventDate, startTime, endTime);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'Venue is already booked for the selected date and time.',
      });
    }

    const eventInitialStatus = status || 'Planned';

    const event = await Event.create({
      eventName,
      eventType,
      eventDate,
      startTime,
      endTime,
      client,
      venue,
      budget: Number(budget) || 0,
      description: description || '',
      status: eventInitialStatus,
      createdBy: req.user ? req.user._id : null,
    });

    // If confirmed, update venue status to Reserved
    if (eventInitialStatus === 'Confirmed') {
      await Venue.findByIdAndUpdate(venue, { availabilityStatus: 'Reserved' });
    }

    const populatedEvent = await Event.findById(event._id)
      .populate('client', 'name email phone')
      .populate('venue', 'name location capacity')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin, Coordinator, Staff for status/notes)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const targetVenue = req.body.venue || event.venue;
    const targetDate = req.body.eventDate || event.eventDate;
    const targetStartTime = req.body.startTime || event.startTime;
    const targetEndTime = req.body.endTime || event.endTime;

    if (targetStartTime >= targetEndTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time.',
      });
    }

    if (req.body.budget !== undefined && Number(req.body.budget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be greater than or equal to 0.',
      });
    }

    // If venue, date, or time is being updated and status is active, verify overlap
    const newStatus = req.body.status || event.status;
    if (!['Cancelled', 'Rejected'].includes(newStatus)) {
      const { hasOverlap } = await checkVenueOverlap(
        targetVenue,
        targetDate,
        targetStartTime,
        targetEndTime,
        event._id
      );

      if (hasOverlap) {
        return res.status(400).json({
          success: false,
          message: 'Venue is already booked for the selected date and time.',
        });
      }
    }

    const oldStatus = event.status;
    const oldVenueId = event.venue;

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('client', 'name email phone')
      .populate('venue', 'name location capacity')
      .populate('createdBy', 'name email');

    // Venue status synchronization rules (Rule 21)
    if (event.status === 'Confirmed' && oldStatus !== 'Confirmed') {
      await Venue.findByIdAndUpdate(event.venue._id, { availabilityStatus: 'Reserved' });
    } else if (
      (event.status === 'Cancelled' || event.status === 'Completed') &&
      oldStatus !== event.status
    ) {
      // Check if any other confirmed events exist for this venue
      const otherConfirmedEvents = await Event.countDocuments({
        venue: event.venue._id,
        status: 'Confirmed',
        _id: { $ne: event._id },
      });
      if (otherConfirmedEvents === 0) {
        await Venue.findByIdAndUpdate(event.venue._id, { availabilityStatus: 'Available' });
      }
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Cascade cleanups
    await EventVendor.deleteMany({ event: event._id });
    await CancellationRequest.deleteMany({ event: event._id });
    await Feedback.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);

    // Refresh venue availability status if needed
    const otherConfirmedEvents = await Event.countDocuments({
      venue: event.venue,
      status: 'Confirmed',
    });
    if (otherConfirmedEvents === 0) {
      await Venue.findByIdAndUpdate(event.venue, { availabilityStatus: 'Available' });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
