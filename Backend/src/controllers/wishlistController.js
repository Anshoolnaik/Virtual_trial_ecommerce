const Wishlist = require('../models/Wishlist');

// GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findByUserId(req.user.id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/wishlist/ids
const getWishlistIds = async (req, res, next) => {
  try {
    const ids = await Wishlist.getWishlistedIds(req.user.id);
    res.json({ success: true, data: ids });
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist/:productId
const addToWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.add(req.user.id, req.params.productId);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.remove(req.user.id, req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in wishlist.' });
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, getWishlistIds, addToWishlist, removeFromWishlist };
