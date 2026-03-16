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
