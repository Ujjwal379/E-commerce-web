const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { stripe } = require('../utils/paymentClients');
const { razorpayInstance } = require('../utils/paymentClients');
const crypto = require('crypto');

const SHIPPING_FLAT_RATE = 99;
const TAX_RATE = 0.18; // 18% GST example

const calcPrices = (items) => {
  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice > 999 ? 0 : SHIPPING_FLAT_RATE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

// @desc    Create order from cart (COD or pre-payment-confirmation record)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Verify stock for every item before creating the order
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calcPrices(cart.items);

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map((i) => ({
      product: i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
      variantId: i.variantId,
    })),
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Decrement stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // COD orders are confirmed immediately; card payments are confirmed via webhook/verify endpoints
  if (paymentMethod === 'cod') {
    order.status = 'processing';
    order.statusHistory.push({ status: 'processing', note: 'Cash on delivery order confirmed' });
    await order.save();
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
});

// @desc    Create a Stripe Checkout Session for an existing order
// @route   POST /api/orders/:id/stripe-session
// @access  Private
const createStripeSession = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: order.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.CLIENT_URL}/order-success/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout`,
    metadata: { orderId: order._id.toString() },
  });

  res.status(200).json({ success: true, url: session.url, sessionId: session.id });
});

// @desc    Stripe webhook - marks order paid on checkout.session.completed
// @route   POST /api/orders/stripe-webhook  (raw body required)
// @access  Public (verified via Stripe signature)
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    const order = await Order.findById(orderId);
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'processing';
      order.paymentResult = {
        id: session.id,
        status: session.payment_status,
        updateTime: new Date().toISOString(),
        emailAddress: session.customer_details?.email,
      };
      order.statusHistory.push({ status: 'processing', note: 'Payment confirmed via Stripe' });
      await order.save();
    }
  }

  res.status(200).json({ received: true });
});

// @desc    Create a Razorpay order for an existing order
// @route   POST /api/orders/:id/razorpay-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found');
  }

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: Math.round(order.totalPrice * 100),
    currency: 'INR',
    receipt: order.orderNumber,
  });

  res.status(200).json({ success: true, razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID });
});

// @desc    Verify Razorpay payment signature and mark order paid
// @route   POST /api/orders/:id/razorpay-verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order || order.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found');
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  order.paymentResult = {
    id: razorpay_payment_id,
    status: 'paid',
    updateTime: new Date().toISOString(),
  };
  order.statusHistory.push({ status: 'processing', note: 'Payment confirmed via Razorpay' });
  await order.save();

  res.status(200).json({ success: true, order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Get single order (owner or admin) - used for order tracking page
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.status(200).json({ success: true, order });
});

// ---------- Admin ----------

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort('-createdAt').skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: orders.length, total, page, pages: Math.ceil(total / limit), orders });
});

// @desc    Update order status (admin) - drives order tracking
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  order.statusHistory.push({ status, note });
  await order.save();

  res.status(200).json({ success: true, order });
});

module.exports = {
  createOrder,
  createStripeSession,
  stripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
};
