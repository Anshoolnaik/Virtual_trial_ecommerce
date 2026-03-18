const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Seller = require('../models/Seller');

const generateToken = (sellerId) =>
  jwt.sign({ sellerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { fullName, storeName, email, password } = req.body;

    const existing = await Seller.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A seller account with this email already exists.',
      });
    }

    const seller = await Seller.create({ fullName, storeName, email, password });
    const token = generateToken(seller.id);

    res.status(201).json({
      success: true,
      message: 'Seller account created successfully.',
      data: { token, seller },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const seller = await Seller.findByEmail(email);
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const valid = await Seller.verifyPassword(password, seller.password_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const { password_hash, ...safeSeller } = seller;
    const token = generateToken(seller.id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: { token, seller: safeSeller },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, data: { seller: req.seller } });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { fullName, storeName, email, phone, storeDescription } = req.body;

    // Check email uniqueness if changing
    if (email && email.toLowerCase().trim() !== req.seller.email) {
      const existing = await Seller.findByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'This email is already in use by another account.',
        });
      }
    }

    const updated = await Seller.update(req.seller.id, {
      ...(fullName        && { full_name: fullName.trim() }),
      ...(storeName       && { store_name: storeName.trim() }),
      ...(email           && { email: email.toLowerCase().trim() }),
      ...(phone  !== undefined && { phone: phone?.trim() || null }),
      ...(storeDescription !== undefined && { store_description: storeDescription?.trim() || null }),
    });

    // Sync localStorage-friendly fields back
    if (typeof window === 'undefined' && updated) {
      // server context — nothing to sync
    }

    res.json({ success: true, message: 'Profile updated.', data: { seller: updated } });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      await Seller.changePassword(req.seller.id, currentPassword, newPassword);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.updateNotifications = async (req, res, next) => {
  try {
    const { notifOrders, notifLowStock, notifFlashSales } = req.body;

    const updated = await Seller.update(req.seller.id, {
      notif_orders:      notifOrders      ?? true,
      notif_low_stock:   notifLowStock    ?? true,
      notif_flash_sales: notifFlashSales  ?? true,
    });

    res.json({ success: true, message: 'Notification preferences saved.', data: { seller: updated } });
  } catch (err) {
    next(err);
  }
};

exports.updatePayout = async (req, res, next) => {
  try {
    const { bankAccount, upiId } = req.body;

    const updated = await Seller.update(req.seller.id, {
      bank_account: bankAccount?.trim() || null,
      upi_id:       upiId?.trim()       || null,
    });

    res.json({ success: true, message: 'Payout info saved.', data: { seller: updated } });
  } catch (err) {
    next(err);
  }
};

exports.updatePolicies = async (req, res, next) => {
  try {
    const { returnPolicy, shippingInfo } = req.body;

    const updated = await Seller.update(req.seller.id, {
      return_policy: returnPolicy?.trim() || null,
      shipping_info: shippingInfo?.trim() || null,
    });

    res.json({ success: true, message: 'Store policies saved.', data: { seller: updated } });
  } catch (err) {
    next(err);
  }
};
