const express = require('express');
const router = express.Router();
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getVenues)
  .post(protect, authorize('admin', 'coordinator'), createVenue);

router
  .route('/:id')
  .get(protect, getVenueById)
  .put(protect, authorize('admin', 'coordinator'), updateVenue)
  .delete(protect, authorize('admin'), deleteVenue);

module.exports = router;
