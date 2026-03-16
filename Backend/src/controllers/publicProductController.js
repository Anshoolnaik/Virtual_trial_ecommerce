const Product = require('../models/Product');

exports.list = async (req, res, next) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    const products = await Product.findAll({ category, search, limit: parseInt(limit), offset: parseInt(offset) });
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

exports.newArrivals = async (req, res, next) => {
  try {
    const products = await Product.findNewArrivals(parseInt(req.query.limit) || 8);
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

exports.trending = async (req, res, next) => {
  try {
    const products = await Product.findTrending(parseInt(req.query.limit) || 8);
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: { product } });
  } catch (err) { next(err); }
};
