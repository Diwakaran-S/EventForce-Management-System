const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Please provide event name'],
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'Please select event type'],
      enum: {
        values: [
          'Wedding',
          'Corporate',
          'Birthday',
          'Anniversary',
          'Festival',
          'Concert',
          'Other',
        ],
        message: '{VALUE} is not a valid event type',
      },
    },
    eventDate: {
      type: Date,
      required: [true, 'Please provide event date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (HH:MM)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time (HH:MM)'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'Planned',
          'Confirmed',
          'Completed',
          'Pending Cancellation',
          'Cancelled',
          'Rejected',
        ],
        message: '{VALUE} is not a valid event status',
      },
      default: 'Planned',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Please select a client'],
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Please select a venue'],
    },
    budget: {
      type: Number,
      required: [true, 'Please provide budget amount'],
      min: [0, 'Budget must be greater than or equal to 0'],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
