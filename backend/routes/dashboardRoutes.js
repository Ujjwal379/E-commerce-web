const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

module.exports = router;
