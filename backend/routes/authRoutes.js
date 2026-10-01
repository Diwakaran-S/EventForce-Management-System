const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getMe,
  getAllUsers,
  deleteUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
