const { pool } = require('../config/database');

// Converts snake_case DB row → camelCase API response
const format = (row) => {
  if (!row) return null;
  return {
    id:            row.id,
    sellerId:      row.seller_id,
    storeName:     row.store_name,
    name:          row.name,
    brand:         row.brand,
    description:   row.description,
    price:         parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    discount:      row.original_price
      ? Math.round(((row.original_price - row.price) / row.original_price) * 100)
      : null,
    category:      row.category,
    badge:         row.badge,
    tryOn:         row.try_on,
    sizes:         row.sizes,
    colors:        row.colors,
    stock:         row.stock,
    material:      row.material || null,
    fit:           row.fit      || null,
    care:          row.care     || null,
    origin:        row.origin   || null,
    rating:        parseFloat(row.rating) || 0,
    reviews:       row.review_count,
    isActive:      row.is_active,
    imageUrl:      row.primary_image_url || null,   // primary image for mobile compat
    images:        row.images || [],
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
};

class Product {
  // ── Helpers ──────────────────────────────────────────────────────────────────
  static #imagesSubquery = `
    COALESCE(
      (SELECT json_agg(pi)
       FROM (
         SELECT pi2.id, pi2.url, pi2.public_id, pi2.color, pi2.is_primary AS "isPrimary", pi2.sort_order AS "sortOrder"
         FROM product_images pi2 WHERE pi2.product_id = p.id
         ORDER BY pi2.sort_order
       ) pi),
      '[]'
    ) AS images,
    (SELECT pi3.url FROM product_images pi3 WHERE pi3.product_id = p.id AND pi3.is_primary = TRUE LIMIT 1) AS primary_image_url
  `;

  // ── Public queries ────────────────────────────────────────────────────────────
  static async findAll({ category, search, limit = 20, offset = 0 } = {}) {
    const conditions = ['p.is_active = TRUE'];
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.brand ILIKE $${params.length})`);
    }

    params.push(limit, offset);
    const where = conditions.join(' AND ');

    const { rows } = await pool.query(
      `SELECT p.*, s.store_name, ${Product.#imagesSubquery}
       FROM products p
       JOIN sellers s ON s.id = p.seller_id
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return rows.map(format);
  }

  static async findNewArrivals(limit = 8) {
    const { rows } = await pool.query(
      `SELECT p.*, s.store_name, ${Product.#imagesSubquery}
       FROM products p
       JOIN sellers s ON s.id = p.seller_id
       WHERE p.is_active = TRUE
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows.map(format);
  }

  static async findTrending(limit = 8) {
    const { rows } = await pool.query(
      `SELECT p.*, s.store_name, ${Product.#imagesSubquery}
       FROM products p
       JOIN sellers s ON s.id = p.seller_id
       WHERE p.is_active = TRUE
       ORDER BY p.review_count DESC, p.rating DESC
       LIMIT $1`,
      [limit]
    );
    return rows.map(format);
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT p.*, s.store_name, ${Product.#imagesSubquery}
       FROM products p
       JOIN sellers s ON s.id = p.seller_id
       WHERE p.id = $1`,
      [id]
    );
    return format(rows[0]);
  }

  // ── Seller queries ────────────────────────────────────────────────────────────
  static async findBySeller(sellerId, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT p.*, s.store_name, ${Product.#imagesSubquery}
       FROM products p
       JOIN sellers s ON s.id = p.seller_id
       WHERE p.seller_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [sellerId, limit, offset]
    );
    return rows.map(format);
  }

  static async create({ sellerId, name, brand, description, price, originalPrice,
    category, badge, tryOn, sizes, colors, stock, material, fit, care, origin }) {
    const { rows } = await pool.query(
      `INSERT INTO products
         (seller_id, name, brand, description, price, original_price,
          category, badge, try_on, sizes, colors, stock,
          material, fit, care, origin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        sellerId, name.trim(), brand.trim(), description || null,
        price, originalPrice || null,
        category, badge || null, tryOn || false,
        JSON.stringify(sizes || []),
        JSON.stringify(colors || []),
        stock || 0,
        material || null, fit || null, care || null, origin || null,
      ]
    );
    return rows[0];
  }

  static async update(id, sellerId, fields) {
    const allowed = ['name','brand','description','price','original_price',
      'category','badge','try_on','sizes','colors','stock','is_active',
      'material','fit','care','origin'];
    const sets = [];
    const params = [];

    for (const [k, v] of Object.entries(fields)) {
      if (allowed.includes(k)) {
        params.push(typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
        sets.push(`${k} = $${params.length}`);
      }
    }
    if (!sets.length) return null;

    params.push(id, sellerId);
    const { rows } = await pool.query(
      `UPDATE products SET ${sets.join(', ')}
       WHERE id = $${params.length - 1} AND seller_id = $${params.length}
       RETURNING *`,
      params
    );
    return rows[0] || null;
  }

  static async delete(id, sellerId) {
    const { rowCount } = await pool.query(
      'DELETE FROM products WHERE id = $1 AND seller_id = $2',
      [id, sellerId]
    );
    return rowCount > 0;
  }

  // ── Image helpers ─────────────────────────────────────────────────────────────
  static async addImage(productId, { url, publicId, color, isPrimary, sortOrder }) {
    // If marking as primary, clear existing primary first
    if (isPrimary) {
      await pool.query(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = $1',
        [productId]
      );
    }
    const { rows } = await pool.query(
      `INSERT INTO product_images (product_id, url, public_id, color, is_primary, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [productId, url, publicId, color || null, isPrimary || false, sortOrder || 0]
    );
    return rows[0];
  }

  static async deleteImage(imageId, productId) {
    const { rows } = await pool.query(
      'DELETE FROM product_images WHERE id = $1 AND product_id = $2 RETURNING public_id',
      [imageId, productId]
    );
    return rows[0] || null;
  }

  static async setPrimaryImage(imageId, productId) {
    await pool.query(
      'UPDATE product_images SET is_primary = FALSE WHERE product_id = $1',
      [productId]
    );
    await pool.query(
      'UPDATE product_images SET is_primary = TRUE WHERE id = $1 AND product_id = $2',
      [imageId, productId]
    );
  }
}

module.exports = Product;
