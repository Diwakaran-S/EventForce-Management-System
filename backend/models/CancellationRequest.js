const mongoose = require('mongoose');

const cancellationRequestSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Please provide an event reference'],
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the requester user reference'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for cancellation'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid cancellation status',
      },
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewComment: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CancellationRequest', cancellationRequestSchema);
