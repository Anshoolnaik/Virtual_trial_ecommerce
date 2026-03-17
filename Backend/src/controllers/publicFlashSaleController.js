const FlashSale = require('../models/FlashSale');

exports.active = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const flashSales = await FlashSale.findActive(limit);
    res.json({ success: true, data: { flashSales } });
  } catch (err) { next(err); }
};
