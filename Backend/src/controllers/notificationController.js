const Notification = require('../models/Notification');

// ─── GET /api/notifications ───────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findByUserId(req.user.id);
    const unreadCount   = await Notification.countUnread(req.user.id);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.markRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────
const markAllRead = async (req, res, next) => {
  try {
    await Notification.markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markRead, markAllRead };
