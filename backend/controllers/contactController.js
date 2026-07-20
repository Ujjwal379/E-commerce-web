const asyncHandler = require('express-async-handler');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
// In production, wire this to an email service (SendGrid/SES/Nodemailer) or
// store submissions in a Contact collection for the admin to review.
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email and message are required');
  }

  console.log('New contact form submission:', { name, email, subject, message });

  res.status(200).json({
    success: true,
    message: "Thanks for reaching out! We'll get back to you within 1-2 business days.",
  });
});

module.exports = { submitContactForm };
