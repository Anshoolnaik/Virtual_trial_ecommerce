const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// ── List seller's products ────────────────────────────────────────────────────
exports.list = async (req, res, next) => {
  try {
    const products = await Product.findBySeller(req.seller.id);
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

// ── Get one product (must belong to seller) ───────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.sellerId !== req.seller.id) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: { product } });
  } catch (err) { next(err); }
};

// ── Create product + upload images ────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const {
      name, brand, description, price, originalPrice,
      category, badge, tryOn, stock,
      material, fit, care, origin,
    } = req.body;

    // Parse JSON fields sent as strings from multipart form
    const sizes       = req.body.sizes        ? JSON.parse(req.body.sizes)        : [];
    const colors      = req.body.colors       ? JSON.parse(req.body.colors)       : [];
    const imageColors = req.body.imageColors  ? JSON.parse(req.body.imageColors)  : [];

    const product = await Product.create({
      sellerId: req.seller.id,
      name, brand, description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category, badge, tryOn: tryOn === 'true' || tryOn === true,
      sizes, colors,
      stock: parseInt(stock) || 0,
      material, fit, care, origin,
    });

    // Upload images in parallel
    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((file, idx) =>
        uploadToCloudinary(file.buffer, 'vogue/products').then((result) =>
          Product.addImage(product.id, {
            url:       result.secure_url,
            publicId:  result.public_id,
            color:     imageColors[idx] || null,
            isPrimary: idx === 0,
            sortOrder: idx,
          })
        )
      );
      await Promise.all(uploads);
    }

    const full = await Product.findById(product.id);
    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product: full },
    });
  } catch (err) { next(err); }
};

// ── Update product ────────────────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const {
      name, brand, description, price, originalPrice,
      category, badge, tryOn, stock, isActive,
      material, fit, care, origin,
    } = req.body;

    const sizes  = req.body.sizes  ? JSON.parse(req.body.sizes)  : undefined;
    const colors = req.body.colors ? JSON.parse(req.body.colors) : undefined;

    const fields = {};
    if (name          !== undefined) fields.name           = name;
    if (brand         !== undefined) fields.brand          = brand;
    if (description   !== undefined) fields.description    = description;
    if (price         !== undefined) fields.price          = parseFloat(price);
    if (originalPrice !== undefined) fields.original_price = originalPrice ? parseFloat(originalPrice) : null;
    if (category      !== undefined) fields.category       = category;
    if (badge         !== undefined) fields.badge          = badge || null;
    if (tryOn         !== undefined) fields.try_on         = tryOn === 'true' || tryOn === true;
    if (sizes         !== undefined) fields.sizes          = sizes;
    if (colors        !== undefined) fields.colors         = colors;
    if (stock         !== undefined) fields.stock          = parseInt(stock);
    if (isActive      !== undefined) fields.is_active      = isActive === 'true' || isActive === true;
    if (material      !== undefined) fields.material       = material || null;
    if (fit           !== undefined) fields.fit            = fit       || null;
    if (care          !== undefined) fields.care           = care      || null;
    if (origin        !== undefined) fields.origin         = origin    || null;

    const updated = await Product.update(req.params.id, req.seller.id, fields);
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Upload any new images
    if (req.files && req.files.length > 0) {
      const existing = await Product.findById(req.params.id);
      const startOrder  = existing.images.length;
      const imageColors = req.body.imageColors ? JSON.parse(req.body.imageColors) : [];
      const uploads = req.files.map((file, idx) =>
        uploadToCloudinary(file.buffer, 'vogue/products').then((result) =>
          Product.addImage(req.params.id, {
            url:       result.secure_url,
            publicId:  result.public_id,
            color:     imageColors[idx] || null,
            isPrimary: existing.images.length === 0 && idx === 0,
            sortOrder: startOrder + idx,
          })
        )
      );
      await Promise.all(uploads);
    }

    const full = await Product.findById(req.params.id);
    res.json({ success: true, message: 'Product updated.', data: { product: full } });
  } catch (err) { next(err); }
};

// ── Delete product ────────────────────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    // Fetch images first to delete from Cloudinary
    const product = await Product.findById(req.params.id);
    if (!product || product.sellerId !== req.seller.id) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    // Delete images from Cloudinary
    await Promise.all(product.images.map((img) => deleteFromCloudinary(img.public_id)));
    await Product.delete(req.params.id, req.seller.id);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) { next(err); }
};

// ── Delete a single image ─────────────────────────────────────────────────────
exports.removeImage = async (req, res, next) => {
  try {
    const deleted = await Product.deleteImage(req.params.imageId, req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Image not found.' });
    await deleteFromCloudinary(deleted.public_id);
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) { next(err); }
};

// ── Set primary image ─────────────────────────────────────────────────────────
exports.setPrimary = async (req, res, next) => {
  try {
    await Product.setPrimaryImage(req.params.imageId, req.params.id);
    res.json({ success: true, message: 'Primary image updated.' });
  } catch (err) { next(err); }
};
