const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Models
const User = require('../models/User');
const Client = require('../models/Client');
const Venue = require('../models/Venue');
const Vendor = require('../models/Vendor');
const Event = require('../models/Event');
const EventVendor = require('../models/EventVendor');
const Feedback = require('../models/Feedback');
const CancellationRequest = require('../models/CancellationRequest');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventforce';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing demo collections...');
    await User.deleteMany({});
    await Client.deleteMany({});
    await Venue.deleteMany({});
    await Vendor.deleteMany({});
    await Event.deleteMany({});
    await EventVendor.deleteMany({});
    await Feedback.deleteMany({});
    await CancellationRequest.deleteMany({});

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const users = await User.create([
      {
        name: 'System Administrator',
        email: 'admin@eventforce.com',
        password: 'Admin@123',
        role: 'admin',
      },
      {
        name: 'Event Coordinator',
        email: 'coordinator@eventforce.com',
        password: 'Admin@123',
        role: 'coordinator',
      },
      {
        name: 'Operations Staff',
        email: 'staff@eventforce.com',
        password: 'Admin@123',
        role: 'staff',
      },
    ]);
    const adminUser = users[0];
    const coordinatorUser = users[1];

    // 2. Create Clients
    console.log('[Seed] Creating demo clients...');
    const clients = await Client.create([
      {
        name: 'Ramesh Kumar',
        email: 'ramesh@example.com',
        phone: '9876543210',
        address: '12 Anna Salai, Mount Road',
        city: 'Chennai',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876543211',
        address: '45 Avinashi Road, Peelamedu',
        city: 'Coimbatore',
      },
      {
        name: 'Arun Kumar',
        email: 'arun@example.com',
        phone: '9876543212',
        address: '88 KK Nagar, Bypass Road',
        city: 'Madurai',
      },
    ]);

    // 3. Create Venues
    console.log('[Seed] Creating demo venues...');
    const venues = await Venue.create([
      {
        name: 'Grand Palace Convention Hall',
        location: 'Chennai',
        address: '100 GST Road, Guindy, Chennai',
        capacity: 1000,
        availabilityStatus: 'Reserved',
      },
      {
        name: 'Green Garden Banquet Hall',
        location: 'Coimbatore',
        address: '22 Race Course Road, Coimbatore',
        capacity: 500,
        availabilityStatus: 'Available',
      },
      {
        name: 'City Convention Centre',
        location: 'Madurai',
        address: '14 Mattuthavani Link Road, Madurai',
        capacity: 750,
        availabilityStatus: 'Reserved',
      },
    ]);

    // 4. Create Vendors
    console.log('[Seed] Creating demo vendors...');
    const vendors = await Vendor.create([
      {
        name: 'Royal Catering',
        email: 'contact@royalcatering.com',
        phone: '9840112233',
        serviceType: 'Catering',
        status: 'Booked',
      },
      {
        name: 'Creative Decor',
        email: 'info@creativedecor.com',
        phone: '9840223344',
        serviceType: 'Decoration',
        status: 'Booked',
      },
      {
        name: 'Click Studio',
        email: 'hello@clickstudio.com',
        phone: '9840334455',
        serviceType: 'Photography',
        status: 'Booked',
      },
      {
        name: 'Beat Masters',
        email: 'bookings@beatmasters.com',
        phone: '9840445566',
        serviceType: 'DJ/Music',
        status: 'Available',
      },
      {
        name: 'Glow Lights & Sound',
        email: 'support@glowlights.com',
        phone: '9840556677',
        serviceType: 'Lighting',
        status: 'Available',
      },
    ]);

    // 5. Create Events
    console.log('[Seed] Creating demo events...');
    // Next week date
    const dateNextWeek = new Date();
    dateNextWeek.setDate(dateNextWeek.getDate() + 7);
    dateNextWeek.setHours(9, 0, 0, 0);

    // Next month date
    const dateNextMonth = new Date();
    dateNextMonth.setDate(dateNextMonth.getDate() + 25);
    dateNextMonth.setHours(10, 0, 0, 0);

    // Past completed date
    const pastCompletedDate = new Date();
    pastCompletedDate.setDate(pastCompletedDate.getDate() - 10);
    pastCompletedDate.setHours(11, 0, 0, 0);

    // Another future planned date
    const futurePlannedDate = new Date();
    futurePlannedDate.setDate(futurePlannedDate.getDate() + 40);
    futurePlannedDate.setHours(14, 0, 0, 0);

    const events = await Event.create([
      {
        eventName: 'Grand Royal Wedding Celebration',
        eventType: 'Wedding',
        eventDate: dateNextWeek,
        startTime: '09:00',
        endTime: '15:00',
        status: 'Confirmed',
        client: clients[0]._id, // Ramesh
        venue: venues[0]._id, // Grand Palace
        budget: 450000,
        description: 'Traditional morning wedding ceremony followed by grand banquet reception.',
        createdBy: coordinatorUser._id,
      },
      {
        eventName: 'TechCorp Annual Summit 2026',
        eventType: 'Corporate',
        eventDate: dateNextMonth,
        startTime: '09:30',
        endTime: '17:30',
        status: 'Confirmed',
        client: clients[1]._id, // Priya
        venue: venues[2]._id, // City Convention Centre
        budget: 320000,
        description: 'Keynotes, networking sessions, exhibition booths and evening awards gala.',
        createdBy: adminUser._id,
      },
      {
        eventName: 'Aarav 1st Birthday Carnival',
        eventType: 'Birthday',
        eventDate: pastCompletedDate,
        startTime: '16:00',
        endTime: '20:30',
        status: 'Completed',
        client: clients[2]._id, // Arun
        venue: venues[1]._id, // Green Garden
        budget: 85000,
        description: 'Jungle themed first birthday with interactive games, magic show and balloon decoration.',
        createdBy: coordinatorUser._id,
      },
      {
        eventName: 'Golden Jubilee Anniversary Gala',
        eventType: 'Anniversary',
        eventDate: futurePlannedDate,
        startTime: '18:00',
        endTime: '22:00',
        status: 'Planned',
        client: clients[0]._id,
        venue: venues[1]._id,
        budget: 120000,
        description: 'Intimate dinner celebration with acoustic band and personalized slideshow.',
        createdBy: coordinatorUser._id,
      },
    ]);

    // 6. Create Event-Vendor Assignments
    console.log('[Seed] Creating event-vendor assignments...');
    await EventVendor.create([
      {
        event: events[0]._id,
        vendor: vendors[0]._id, // Royal Catering
        status: 'Assigned',
      },
      {
        event: events[0]._id,
        vendor: vendors[1]._id, // Creative Decor
        status: 'Assigned',
      },
      {
        event: events[0]._id,
        vendor: vendors[2]._id, // Click Studio
        status: 'Assigned',
      },
      {
        event: events[2]._id,
        vendor: vendors[0]._id, // Royal Catering for past birthday
        status: 'Completed',
      },
      {
        event: events[2]._id,
        vendor: vendors[1]._id, // Creative Decor for past birthday
        status: 'Completed',
      },
    ]);

    // 7. Create Feedback for Completed Event
    console.log('[Seed] Creating client feedback...');
    await Feedback.create([
      {
        event: events[2]._id,
        client: clients[2]._id,
        rating: 5,
        comments: 'Outstanding coordination and decorations! The team handled everything flawlessly.',
      },
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ Demo database seeded successfully!');
    console.log('Demo Credentials:');
    console.log('  Admin:       admin@eventforce.com       / Admin@123');
    console.log('  Coordinator: coordinator@eventforce.com / Admin@123');
    console.log('  Staff:       staff@eventforce.com       / Admin@123');
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
