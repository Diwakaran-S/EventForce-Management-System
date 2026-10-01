const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide vendor name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide vendor email'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide vendor phone number'],
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Please select a service type'],
      enum: {
        values: [
          'Catering',
          'Decoration',
          'Photography',
          'Videography',
          'Lighting',
          'Stage Setup',
          'Makeup',
          'DJ/Music',
          'Transportation',
          'Other',
        ],
        message: '{VALUE} is not a supported service type',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Available', 'Booked', 'Cancelled'],
        message: '{VALUE} is not a valid vendor status',
      },
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vendor', vendorSchema);
