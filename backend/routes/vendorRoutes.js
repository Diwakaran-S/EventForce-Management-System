const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getVendors)
  .post(protect, authorize('admin', 'coordinator'), createVendor);

router
  .route('/:id')
  .get(protect, getVendorById)
  .put(protect, authorize('admin', 'coordinator'), updateVendor)
  .delete(protect, authorize('admin'), deleteVendor);

module.exports = router;
