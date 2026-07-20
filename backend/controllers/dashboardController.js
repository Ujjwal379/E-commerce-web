const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get admin dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalProducts, totalUsers, totalOrders, revenueAgg, lowStockCount, recentOrders, ordersByStatus] =
    await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
      Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      lowStockCount,
      ordersByStatus,
    },
    recentOrders,
  });
});

module.exports = { getDashboardStats };
