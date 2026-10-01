const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getClients)
  .post(protect, authorize('admin', 'coordinator'), createClient);

router
  .route('/:id')
  .get(protect, getClientById)
  .put(protect, authorize('admin', 'coordinator'), updateClient)
  .delete(protect, authorize('admin'), deleteClient);

module.exports = router;
