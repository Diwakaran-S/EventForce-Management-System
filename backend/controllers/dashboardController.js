const Event = require('../models/Event');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const Venue = require('../models/Venue');
const CancellationRequest = require('../models/CancellationRequest');
const Feedback = require('../models/Feedback');

// @desc    Get dashboard statistics, counts, charts data and upcoming events
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Core Counts
    const totalEvents = await Event.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalVenues = await Venue.countDocuments();

    // 2. Specific Counts
    const upcomingEventsCount = await Event.countDocuments({
      eventDate: { $gte: today },
      status: { $in: ['Planned', 'Confirmed'] },
    });

    const completedEventsCount = await Event.countDocuments({
      status: 'Completed',
    });

    const pendingCancellationsCount = await CancellationRequest.countDocuments({
      status: 'Pending',
    });

    // 3. Total Event Budget (sum of non-cancelled/rejected events)
    const budgetAggregation = await Event.aggregate([
      {
        $match: {
          status: { $nin: ['Cancelled', 'Rejected'] },
        },
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
        },
      },
    ]);
    const totalEventBudget = budgetAggregation.length > 0 ? budgetAggregation[0].totalBudget : 0;

    // 4. Average Client Rating
    const ratingAggregation = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    const averageRating = ratingAggregation.length > 0 ? Number(ratingAggregation[0].avgRating.toFixed(1)) : 0;
    const totalReviews = ratingAggregation.length > 0 ? ratingAggregation[0].totalReviews : 0;

    // 5. Chart 1: Events by Status
    const statusAggregation = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const eventsByStatus = [
      'Planned',
      'Confirmed',
      'Completed',
      'Pending Cancellation',
      'Cancelled',
      'Rejected',
    ].map((status) => {
      const found = statusAggregation.find((s) => s._id === status);
      return {
        name: status,
        count: found ? found.count : 0,
      };
    });

    // 6. Chart 2: Events by Type
    const typeAggregation = await Event.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);
    const eventTypes = [
      'Wedding',
      'Corporate',
      'Birthday',
      'Anniversary',
      'Festival',
      'Concert',
      'Other',
    ];
    const eventsByType = eventTypes.map((type) => {
      const found = typeAggregation.find((t) => t._id === type);
      return {
        name: type,
        count: found ? found.count : 0,
      };
    });

    // 7. Chart 3: Monthly Events (current year)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyAggregation = await Event.aggregate([
      {
        $match: {
          eventDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: '$eventDate' },
          count: { $sum: 1 },
          budget: { $sum: '$budget' },
        },
      },
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlyEvents = months.map((monthName, idx) => {
      const monthNum = idx + 1;
      const found = monthlyAggregation.find((m) => m._id === monthNum);
      return {
        month: monthName,
        events: found ? found.count : 0,
        budget: found ? found.budget : 0,
      };
    });

    // 8. Chart 4: Vendor Status
    const vendorStatusAggregation = await Vendor.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const vendorStatuses = ['Available', 'Booked', 'Cancelled'];
    const vendorStatus = vendorStatuses.map((st) => {
      const found = vendorStatusAggregation.find((v) => v._id === st);
      return {
        name: st,
        count: found ? found.count : 0,
      };
    });

    // 9. Chart 5: Feedback Rating Distribution
    const feedbackDistAggregation = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);
    const feedbackDistribution = [5, 4, 3, 2, 1].map((r) => {
      const found = feedbackDistAggregation.find((f) => f._id === r);
      return {
        rating: `${r} Stars`,
        stars: r,
        count: found ? found.count : 0,
      };
    });

    // 10. Upcoming Events Table (sorted by eventDate ascending)
    const upcomingEvents = await Event.find({
      eventDate: { $gte: today },
    })
      .populate('client', 'name email phone')
      .populate('venue', 'name location')
      .sort({ eventDate: 1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        summary: {
          totalEvents,
          totalClients,
          totalVendors,
          totalVenues,
          upcomingEvents: upcomingEventsCount,
          completedEvents: completedEventsCount,
          pendingCancellations: pendingCancellationsCount,
          totalEventBudget,
          averageRating,
          totalReviews,
        },
        charts: {
          eventsByStatus,
          eventsByType,
          monthlyEvents,
          vendorStatus,
          feedbackDistribution,
        },
        upcomingEventsTable: upcomingEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
