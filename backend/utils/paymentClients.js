const Stripe = require('stripe');
const Razorpay = require('razorpay');

// Guard against missing keys in local/dev so the server still boots;
// payment routes will throw a clear error only when actually called.
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
});

module.exports = { stripe, razorpayInstance };
