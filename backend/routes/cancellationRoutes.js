const express = require('express');
const router = express.Router();
const {
  getCancellationRequests,
  createCancellationRequest,
  approveCancellationRequest,
  rejectCancellationRequest,
} = require('../controllers/cancellationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getCancellationRequests)
  .post(protect, createCancellationRequest);

router
  .route('/:id/approve')
  .put(protect, authorize('admin', 'coordinator'), approveCancellationRequest);

router
  .route('/:id/reject')
  .put(protect, authorize('admin', 'coordinator'), rejectCancellationRequest);

module.exports = router;
