const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  getUsers,
  updateUserByAdmin,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);

router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

// Admin only
router.get('/', authorize('admin'), getUsers);
router.put('/:id', authorize('admin'), updateUserByAdmin);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
