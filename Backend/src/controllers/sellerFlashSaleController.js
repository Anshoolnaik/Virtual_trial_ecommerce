const { validationResult } = require('express-validator');
const FlashSale = require('../models/FlashSale');

exports.list = async (req, res, next) => {
  try {
    const flashSales = await FlashSale.findBySeller(req.seller.id);
    res.json({ success: true, data: { flashSales } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { productId, salePrice, startsAt, endsAt } = req.body;
    const flashSale = await FlashSale.create({
      sellerId: req.seller.id,
      productId,
      salePrice: parseFloat(salePrice),
      startsAt:  startsAt || new Date(),
      endsAt,
    });
    res.status(201).json({ success: true, message: 'Flash sale created.', data: { flashSale } });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { salePrice, startsAt, endsAt, isActive } = req.body;
    const updated = await FlashSale.update(req.params.id, req.seller.id, {
      salePrice: salePrice !== undefined ? parseFloat(salePrice) : undefined,
      startsAt,
      endsAt,
      isActive,
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Flash sale not found.' });
    res.json({ success: true, message: 'Flash sale updated.', data: { flashSale: updated } });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await FlashSale.delete(req.params.id, req.seller.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Flash sale not found.' });
    res.json({ success: true, message: 'Flash sale deleted.' });
  } catch (err) { next(err); }
};
