const express = require('express');
const router = express.Router();
const {
  getEventVendors,
  assignVendor,
  updateEventVendorStatus,
  removeEventVendor,
} = require('../controllers/eventVendorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getEventVendors)
  .post(protect, authorize('admin', 'coordinator'), assignVendor);

router
  .route('/:id')
  .put(protect, updateEventVendorStatus)
  .delete(protect, authorize('admin', 'coordinator'), removeEventVendor);

module.exports = router;
