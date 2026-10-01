const express = require('express');
const router = express.Router();
const {
  getFeedback,
  createFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getFeedback)
  .post(protect, createFeedback);

router
  .route('/:id')
  .delete(protect, authorize('admin'), deleteFeedback);

module.exports = router;
