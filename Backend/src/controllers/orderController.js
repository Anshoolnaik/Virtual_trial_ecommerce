const { pool } = require('../config/database');
const Address      = require('../models/Address');
const Order        = require('../models/Order');
const Notification = require('../models/Notification');
const { emitToUser } = require('../socket');

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// ─── POST /api/orders ─────────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  const { addressId, items } = req.body;

  if (!addressId) {
    return res.status(400).json({ success: false, message: 'Delivery address is required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
  }

  try {
    // 1. Validate address belongs to this user
    const address = await Address.findById(addressId, req.user.id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    // 2. Fetch product details from DB (prices + seller_id + stock)
    const productIds = items.map((i) => i.productId);
    const { rows: products } = await pool.query(
      `SELECT p.id, p.name, p.brand, p.price, p.seller_id, p.stock,
              (SELECT url FROM product_images
               WHERE product_id = p.id AND is_primary = TRUE
               LIMIT 1) AS image_url
       FROM products p
       WHERE p.id = ANY($1::uuid[]) AND p.is_active = TRUE`,
      [productIds]
    );

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products are unavailable.' });
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    // 3. Validate stock availability
    for (const item of items) {
      const product = productMap[item.productId];
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: product.stock === 0
            ? `"${product.name}" is out of stock.`
            : `Only ${product.stock} left in stock for "${product.name}".`,
        });
      }
    }

    // 4. Build order items with server-side price snapshots
    const orderItems = items.map((item) => {
      const product = productMap[item.productId];
      return {
        productId:        item.productId,
        sellerId:         product.seller_id,
        productName:      product.name,
        productBrand:     product.brand,
        productImageUrl:  product.image_url,
        size:             item.size  || null,
        color:            item.color || null,
        quantity:         item.quantity,
        unitPrice:        parseFloat(product.price),
      };
    });

    // 5. Calculate total (shipping free over ₹100 equivalent threshold kept at $100)
    const subtotal  = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const shipping  = subtotal >= 100 ? 0 : 9.99;
    const totalAmount = +(subtotal + shipping).toFixed(2);

    // 6. Address snapshot
    const addressSnapshot = {
      fullName:     address.full_name,
      phone:        address.phone,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2 || null,
      city:         address.city,
      state:        address.state,
      pincode:      address.pincode,
      country:      address.country,
    };

    // 7. Create order + deduct stock atomically
    const order = await Order.create(req.user.id, {
      addressSnapshot,
      totalAmount,
      paymentMethod: 'cod',
      items: orderItems,
    });

    // Notify buyer that the order was placed
    Notification.create({
      userId: req.user.id,
      type:   'order_placed',
      title:  'Order Placed!',
      body:   `Your order of ${orderItems.length} item${orderItems.length !== 1 ? 's' : ''} has been placed. Total: ₹${totalAmount}.`,
      data:   { orderId: order.id },
    }).then((notification) => {
      emitToUser(req.user.id, notification);
    }).catch(() => {});

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders ──────────────────────────────────────────────────────────
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrder };
