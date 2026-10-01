const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getEvents)
  .post(protect, authorize('admin', 'coordinator'), createEvent);

router
  .route('/:id')
  .get(protect, getEventById)
  .put(protect, authorize('admin', 'coordinator', 'staff'), updateEvent)
  .delete(protect, authorize('admin'), deleteEvent);

module.exports = router;
