const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');

exports.protectSeller = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorised. No token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await Seller.findById(decoded.sellerId);
    if (!seller) {
      return res.status(401).json({ success: false, message: 'Seller not found.' });
    }

    req.seller = seller;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
