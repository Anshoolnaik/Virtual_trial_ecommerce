const { pool } = require('../config/database');

class Wishlist {
  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT w.id, w.created_at,
              p.id AS "productId", p.name, p.brand, p.price, p.original_price AS "originalPrice",
              p.category, p.badge, p.try_on AS "tryOn", p.rating, p.review_count AS reviews,
              p.colors, p.sizes,
              pi.url AS "imageUrl"
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    // Normalize: use productId as id so product cards work
    return rows.map((r) => ({ ...r, id: r.productId }));
  }

  static async getWishlistedIds(userId) {
    const { rows } = await pool.query(
      `SELECT product_id FROM wishlists WHERE user_id = $1`,
      [userId]
    );
    return rows.map((r) => r.product_id);
  }

  static async add(userId, productId) {
    const { rows } = await pool.query(
      `INSERT INTO wishlists (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, productId]
    );
    return rows[0] || null;
  }

  static async remove(userId, productId) {
    const { rows } = await pool.query(
      `DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2 RETURNING *`,
      [userId, productId]
    );
    return rows[0] || null;
  }
}

module.exports = Wishlist;
