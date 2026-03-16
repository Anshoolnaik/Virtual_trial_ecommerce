const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWishlist, getWishlistIds, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.use(protect);

router.get('/',             getWishlist);
router.get('/ids',          getWishlistIds);
router.post('/:productId',  addToWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
