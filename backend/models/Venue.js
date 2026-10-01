const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide venue name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide venue location'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide venue capacity'],
      min: [1, 'Capacity must be greater than 0'],
    },
    availabilityStatus: {
      type: String,
      enum: {
        values: ['Available', 'Reserved', 'Unavailable'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Venue', venueSchema);
