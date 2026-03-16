const Order = require('../models/Order');

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// ─── GET /api/seller/orders ───────────────────────────────────────────────────
const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.findBySellerId(req.seller.id);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/seller/orders/:id/status ─────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${VALID_STATUSES.join(', ')}.`,
    });
  }

  try {
    const order = await Order.updateStatus(req.params.id, req.seller.id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSellerOrders, updateOrderStatus };
