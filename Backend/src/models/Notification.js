const { pool } = require('../config/database');

class Notification {
  // Create a notification for a user
  static async create({ userId, type, title, body, data = {} }) {
    const { rows } = await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, body, JSON.stringify(data)]
    );
    return rows[0];
  }

  // Get all notifications for a user, newest first
  static async findByUserId(userId, limit = 50) {
    const { rows } = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  // Count unread notifications for a user
  static async countUnread(userId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return rows[0].count;
  }

  // Mark a single notification as read (only if it belongs to this user)
  static async markRead(id, userId) {
    const { rows } = await pool.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return rows[0] || null;
  }

  // Mark all notifications as read for a user
  static async markAllRead(userId) {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
  }
}

module.exports = Notification;
