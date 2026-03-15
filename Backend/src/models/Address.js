const { pool } = require('../config/database');

class Address {
  // All addresses for a user, default first
  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at ASC`,
      [userId]
    );
    return rows;
  }

  // Single address belonging to user
  static async findById(id, userId) {
    const { rows } = await pool.query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(userId, data) {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = data;

    // If this is the first address or isDefault requested, clear existing defaults first
    if (isDefault) {
      await pool.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [userId]);
    }

    // If this is the user's first address, auto-set as default
    const { rows: existing } = await pool.query(
      `SELECT id FROM addresses WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const shouldBeDefault = isDefault || existing.length === 0;

    const { rows } = await pool.query(
      `INSERT INTO addresses
         (user_id, label, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [userId, label.trim(), fullName.trim(), phone.trim(), addressLine1.trim(),
       addressLine2?.trim() || null, city.trim(), state.trim(), pincode.trim(),
       country?.trim() || 'India', shouldBeDefault]
    );
    return rows[0];
  }

  static async update(id, userId, data) {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = data;

    if (isDefault) {
      await pool.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [userId]);
    }

    const { rows } = await pool.query(
      `UPDATE addresses SET
         label         = $1,
         full_name     = $2,
         phone         = $3,
         address_line1 = $4,
         address_line2 = $5,
         city          = $6,
         state         = $7,
         pincode       = $8,
         country       = $9,
         is_default    = $10
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [label.trim(), fullName.trim(), phone.trim(), addressLine1.trim(),
       addressLine2?.trim() || null, city.trim(), state.trim(), pincode.trim(),
       country?.trim() || 'India', !!isDefault, id, userId]
    );
    return rows[0] || null;
  }

  static async setDefault(id, userId) {
    await pool.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [userId]);
    const { rows } = await pool.query(
      `UPDATE addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return rows[0] || null;
  }

  static async delete(id, userId) {
    const { rows } = await pool.query(
      `DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    const deleted = rows[0] || null;

    // If deleted address was default, promote the oldest remaining one
    if (deleted?.is_default) {
      await pool.query(
        `UPDATE addresses SET is_default = TRUE
         WHERE id = (SELECT id FROM addresses WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1)`,
        [userId]
      );
    }
    return deleted;
  }
}

module.exports = Address;
