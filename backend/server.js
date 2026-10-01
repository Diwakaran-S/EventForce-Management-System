const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const venueRoutes = require('./routes/venueRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventVendorRoutes = require('./routes/eventVendorRoutes');
const cancellationRoutes = require('./routes/cancellationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EventForce API is operational',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-vendors', eventVendorRoutes);
app.use('/api/cancellations', cancellationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[EventForce] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
