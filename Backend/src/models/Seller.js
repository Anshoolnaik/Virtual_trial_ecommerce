const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const SAFE_FIELDS = `
  id, full_name, store_name, email, is_verified, created_at,
  phone, store_description, return_policy, shipping_info,
  bank_account, upi_id, notif_orders, notif_low_stock, notif_flash_sales
`;

class Seller {
  static async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM sellers WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${SAFE_FIELDS} FROM sellers WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async create({ fullName, storeName, email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO sellers (full_name, store_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SAFE_FIELDS}`,
      [fullName.trim(), storeName.trim(), email.toLowerCase().trim(), passwordHash]
    );
    return rows[0];
  }

  static async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  static async update(id, fields) {
    const allowed = [
      'full_name', 'store_name', 'email', 'phone', 'store_description',
      'return_policy', 'shipping_info', 'bank_account', 'upi_id',
      'notif_orders', 'notif_low_stock', 'notif_flash_sales',
    ];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));
    if (keys.length === 0) return Seller.findById(id);

    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map((k) => fields[k]);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE sellers SET ${setClauses} WHERE id = $${values.length} RETURNING ${SAFE_FIELDS}`,
      values
    );
    return rows[0];
  }

  static async changePassword(id, currentPassword, newPassword) {
    const { rows } = await pool.query(
      'SELECT password_hash FROM sellers WHERE id = $1',
      [id]
    );
    if (!rows[0]) throw new Error('Seller not found.');

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) throw new Error('Current password is incorrect.');

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE sellers SET password_hash = $1 WHERE id = $2', [newHash, id]);
  }
}

module.exports = Seller;
