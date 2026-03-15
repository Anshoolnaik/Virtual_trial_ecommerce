const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const SAFE_FIELDS = 'id, full_name, email, profile_image_url, is_verified, created_at';

class User {
  static async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${SAFE_FIELDS} FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async create({ fullName, email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING ${SAFE_FIELDS}`,
      [fullName.trim(), email.toLowerCase().trim(), passwordHash]
    );
    return rows[0];
  }

  static async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}

module.exports = User;
