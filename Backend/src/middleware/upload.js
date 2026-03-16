const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Store files in memory so we can stream to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5 MB per file, max 5 files
});

/**
 * Streams a buffer to Cloudinary and returns the result.
 * @param {Buffer} buffer
 * @param {string} folder  e.g. 'vogue/products'
 */
const uploadToCloudinary = (buffer, folder = 'vogue/products') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

/**
 * Deletes an image from Cloudinary by its public_id.
 */
const deleteFromCloudinary = (publicId) =>
  cloudinary.uploader.destroy(publicId);

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
