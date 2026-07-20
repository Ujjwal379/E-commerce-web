const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createOrder,
  createStripeSession,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

// NOTE: the Stripe webhook route is mounted separately in server.js
// BEFORE express.json(), since Stripe requires the raw request body.

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

router.post('/:id/stripe-session', createStripeSession);
router.post('/:id/razorpay-order', createRazorpayOrder);
router.post('/:id/razorpay-verify', verifyRazorpayPayment);

router.get('/:id', getOrder); // also used for order tracking page

// Admin
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
