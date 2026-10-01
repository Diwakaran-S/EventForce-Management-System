const mongoose = require('mongoose');

const eventVendorSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Please provide an event reference'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Please provide a vendor reference'],
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['Assigned', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid assignment status',
      },
      default: 'Assigned',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate assignment of the same vendor to the same event
eventVendorSchema.index({ event: 1, vendor: 1 }, { unique: true });

module.exports = mongoose.model('EventVendor', eventVendorSchema);
