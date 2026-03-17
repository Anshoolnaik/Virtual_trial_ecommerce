const { pool } = require('../config/database');

const format = (row) => {
  if (!row) return null;
  return {
    id:            row.id,
    sellerId:      row.seller_id,
    productId:     row.product_id,
    salePrice:     parseFloat(row.sale_price),
    startsAt:      row.starts_at,
    endsAt:        row.ends_at,
    isActive:      row.is_active,
    createdAt:     row.created_at,
    // Joined product fields (present on public queries)
    product: row.product_name ? {
      id:            row.product_id,
      name:          row.product_name,
      brand:         row.product_brand,
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      imageUrl:      row.primary_image_url || null,
      category:      row.category,
    } : undefined,
  };
};

const productJoin = `
  JOIN products p ON p.id = fs.product_id
  LEFT JOIN (
    SELECT pi.product_id, pi.url AS primary_image_url
    FROM product_images pi
    WHERE pi.is_primary = TRUE
  ) img ON img.product_id = fs.product_id
`;

class FlashSale {
  // Public: active flash sales (not expired, is_active = true)
  static async findActive(limit = 20) {
    const { rows } = await pool.query(
      `SELECT fs.*, p.name AS product_name, p.brand AS product_brand,
              p.original_price, p.category, img.primary_image_url
       FROM flash_sales fs
       ${productJoin}
       WHERE fs.is_active = TRUE
         AND p.is_active  = TRUE
         AND NOW() BETWEEN fs.starts_at AND fs.ends_at
       ORDER BY fs.ends_at ASC
       LIMIT $1`,
      [limit]
    );
    return rows.map(format);
  }

  // Seller: all flash sales for a seller
  static async findBySeller(sellerId) {
    const { rows } = await pool.query(
      `SELECT fs.*, p.name AS product_name, p.brand AS product_brand,
              p.original_price, p.category, img.primary_image_url
       FROM flash_sales fs
       ${productJoin}
       WHERE fs.seller_id = $1
       ORDER BY fs.created_at DESC`,
      [sellerId]
    );
    return rows.map(format);
  }

  static async create({ sellerId, productId, salePrice, startsAt, endsAt }) {
    const { rows } = await pool.query(
      `INSERT INTO flash_sales (seller_id, product_id, sale_price, starts_at, ends_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sellerId, productId, salePrice, startsAt || new Date(), endsAt]
    );
    return rows[0];
  }

  static async update(id, sellerId, { salePrice, startsAt, endsAt, isActive }) {
    const sets = [];
    const params = [];

    if (salePrice  !== undefined) { params.push(salePrice);  sets.push(`sale_price = $${params.length}`); }
    if (startsAt   !== undefined) { params.push(startsAt);   sets.push(`starts_at  = $${params.length}`); }
    if (endsAt     !== undefined) { params.push(endsAt);     sets.push(`ends_at    = $${params.length}`); }
    if (isActive   !== undefined) { params.push(isActive);   sets.push(`is_active  = $${params.length}`); }

    if (!sets.length) return null;
    params.push(id, sellerId);

    const { rows } = await pool.query(
      `UPDATE flash_sales SET ${sets.join(', ')}
       WHERE id = $${params.length - 1} AND seller_id = $${params.length}
       RETURNING *`,
      params
    );
    return rows[0] || null;
  }

  static async delete(id, sellerId) {
    const { rowCount } = await pool.query(
      'DELETE FROM flash_sales WHERE id = $1 AND seller_id = $2',
      [id, sellerId]
    );
    return rowCount > 0;
  }
}

module.exports = FlashSale;
