const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validateMiddleware');
const { submitContactForm } = require('../controllers/contactController');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validate,
  submitContactForm
);

module.exports = router;
