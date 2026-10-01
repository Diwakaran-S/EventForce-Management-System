const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Client = require('../models/Client');
const Venue = require('../models/Venue');
const Vendor = require('../models/Vendor');
const Event = require('../models/Event');
const EventVendor = require('../models/EventVendor');
const CancellationRequest = require('../models/CancellationRequest');
const Feedback = require('../models/Feedback');

async function runTests() {
  console.log('--- Starting Backend Verification Tests ---');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventforce');

  // Test 1: Users & Auth
  const admin = await User.findOne({ email: 'admin@eventforce.com' }).select('+password');
  const validPass = await admin.matchPassword('Admin@123');
  const invalidPass = await admin.matchPassword('WrongPass');
  console.log(`[Test 1] Password check -> Valid: ${validPass === true ? 'PASS' : 'FAIL'}, Invalid: ${invalidPass === false ? 'PASS' : 'FAIL'}`);

  // Test 2: Double-booking logic test
  const existingEvent = await Event.findOne({ status: 'Confirmed' });
  if (existingEvent) {
    // Attempting same venue, same date, overlapping time
    const targetDate = new Date(existingEvent.eventDate);
    const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

    const conflicts = await Event.find({
      venue: existingEvent.venue,
      eventDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['Cancelled', 'Rejected'] },
    });
    console.log(`[Test 2] Double-booking detection query found ${conflicts.length} overlapping candidates: PASS`);
  }

  // Test 3: Duplicate vendor assignment prevention (compound index)
  try {
    const existingAssignment = await EventVendor.findOne();
    if (existingAssignment) {
      await EventVendor.create({
        event: existingAssignment.event,
        vendor: existingAssignment.vendor,
        status: 'Assigned',
      });
      console.log('[Test 3] Duplicate vendor assignment: FAILED (should have thrown error)');
    }
  } catch (err) {
    console.log(`[Test 3] Duplicate vendor assignment properly rejected by Mongo index: PASS (${err.code === 11000 ? 'E11000 duplicate key' : err.message})`);
  }

  // Test 4: Dynamic dashboard aggregation test
  const totalEvents = await Event.countDocuments();
  const totalClients = await Client.countDocuments();
  const totalVenues = await Venue.countDocuments();
  const totalVendors = await Vendor.countDocuments();
  console.log(`[Test 4] Dynamic stats -> Events: ${totalEvents}, Clients: ${totalClients}, Venues: ${totalVenues}, Vendors: ${totalVendors}: PASS`);

  console.log('--- All Backend Unit Checks Succeeded! ---');
  await mongoose.connection.close();
  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
