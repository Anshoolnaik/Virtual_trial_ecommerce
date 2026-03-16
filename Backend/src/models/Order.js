const { pool } = require('../config/database');

class Order {
  // Create order + items in a transaction
  static async create(userId, { addressSnapshot, totalAmount, paymentMethod = 'cod', items }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [order] } = await client.query(
        `INSERT INTO orders (user_id, address_snapshot, total_amount, payment_method, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [userId, JSON.stringify(addressSnapshot), totalAmount, paymentMethod]
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items
             (order_id, product_id, seller_id, product_name, product_brand, product_image_url, size, color, quantity, unit_price)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            order.id,
            item.productId,
            item.sellerId,
            item.productName,
            item.productBrand,
            item.productImageUrl || null,
            item.size || null,
            item.color || null,
            item.quantity,
            item.unitPrice,
          ]
        );
      }

      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Buyer: all orders with items
  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT o.*,
         json_agg(
           json_build_object(
             'id',                oi.id,
             'product_id',        oi.product_id,
             'product_name',      oi.product_name,
             'product_brand',     oi.product_brand,
             'product_image_url', oi.product_image_url,
             'size',              oi.size,
             'color',             oi.color,
             'quantity',          oi.quantity,
             'unit_price',        oi.unit_price
           ) ORDER BY oi.created_at
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Buyer: single order
  static async findById(id, userId) {
    const { rows } = await pool.query(
      `SELECT o.*,
         json_agg(
           json_build_object(
             'id',                oi.id,
             'product_id',        oi.product_id,
             'product_name',      oi.product_name,
             'product_brand',     oi.product_brand,
             'product_image_url', oi.product_image_url,
             'size',              oi.size,
             'color',             oi.color,
             'quantity',          oi.quantity,
             'unit_price',        oi.unit_price
           ) ORDER BY oi.created_at
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [id, userId]
    );
    return rows[0] || null;
  }

  // Seller: orders containing their products (only their items shown)
  static async findBySellerId(sellerId) {
    const { rows } = await pool.query(
      `SELECT
         o.id, o.status, o.total_amount, o.payment_method,
         o.address_snapshot, o.created_at,
         u.full_name AS buyer_name,
         u.email     AS buyer_email,
         json_agg(
           json_build_object(
             'id',                oi.id,
             'product_id',        oi.product_id,
             'product_name',      oi.product_name,
             'product_brand',     oi.product_brand,
             'product_image_url', oi.product_image_url,
             'size',              oi.size,
             'color',             oi.color,
             'quantity',          oi.quantity,
             'unit_price',        oi.unit_price
           ) ORDER BY oi.created_at
         ) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id AND oi.seller_id = $1
       JOIN users u ON u.id = o.user_id
       GROUP BY o.id, u.full_name, u.email
       ORDER BY o.created_at DESC`,
      [sellerId]
    );
    return rows;
  }

  // Seller: update order status
  static async updateStatus(orderId, sellerId, status) {
    // Only update if seller has items in this order
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1
       WHERE id = $2
         AND EXISTS (
           SELECT 1 FROM order_items
           WHERE order_id = $2 AND seller_id = $3
         )
       RETURNING *`,
      [status, orderId, sellerId]
    );
    return rows[0] || null;
  }
}

module.exports = Order;
