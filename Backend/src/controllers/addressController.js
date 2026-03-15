const { body, param, validationResult } = require('express-validator');
const Address = require('../models/Address');

// ─── Validation Rules ─────────────────────────────────────────────────────────
const addressValidation = [
  body('label').trim().notEmpty().withMessage('Address name (label) is required.'),
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('state').trim().notEmpty().withMessage('State is required.'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required.'),
];

// ─── GET /api/addresses ───────────────────────────────────────────────────────
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findByUserId(req.user.id);
    res.json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/addresses ──────────────────────────────────────────────────────
const createAddress = [
  ...addressValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
      const address = await Address.create(req.user.id, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  },
];

// ─── PUT /api/addresses/:id ───────────────────────────────────────────────────
const updateAddress = [
  ...addressValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
      const address = await Address.update(req.params.id, req.user.id, req.body);
      if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
      res.json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  },
];

// ─── PATCH /api/addresses/:id/default ────────────────────────────────────────
const setDefault = async (req, res, next) => {
  try {
    const address = await Address.setDefault(req.params.id, req.user.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    res.json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/addresses/:id ────────────────────────────────────────────────
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.delete(req.params.id, req.user.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    res.json({ success: true, message: 'Address deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAddresses, createAddress, updateAddress, setDefault, deleteAddress };
