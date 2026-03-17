const Order          = require('../models/Order');
const Notification   = require('../models/Notification');
const { emitToUser } = require('../socket');

const STATUS_LABELS = {
  confirmed:  'Order Confirmed',
  shipped:    'Order Shipped',
  delivered:  'Order Delivered',
  cancelled:  'Order Cancelled',
};

const STATUS_BODIES = {
  confirmed:  'Your order has been confirmed and is being prepared.',
  shipped:    'Your order is on its way! Expect delivery soon.',
  delivered:  'Your order has been delivered. Enjoy your purchase!',
  cancelled:  'Your order has been cancelled.',
};

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

    // Notify the buyer about the status change
    if (STATUS_LABELS[status]) {
      Notification.create({
        userId: order.user_id,
        type:   'order_status',
        title:  STATUS_LABELS[status],
        body:   STATUS_BODIES[status],
        data:   { orderId: order.id, status },
      }).then((notification) => {
        emitToUser(order.user_id, notification);
      }).catch(() => {});
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSellerOrders, updateOrderStatus };
