const Feedback = require('../models/Feedback');
const Event = require('../models/Event');

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private
const getFeedback = async (req, res, next) => {
  try {
    const { eventId, clientId } = req.query;
    let query = {};

    if (eventId) query.event = eventId;
    if (clientId) query.client = clientId;

    const feedback = await Feedback.find(query)
      .populate('event', 'eventName eventType eventDate status')
      .populate('client', 'name email phone city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res, next) => {
  try {
    const { event, client, rating, comments } = req.body;

    if (!event || !client || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event, client, and rating.',
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const newFeedback = await Feedback.create({
      event,
      client,
      rating: numRating,
      comments: comments || '',
    });

    const populated = await Feedback.findById(newFeedback._id)
      .populate('event', 'eventName eventType eventDate status')
      .populate('client', 'name email phone');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.',
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeedback,
  createFeedback,
  deleteFeedback,
};
