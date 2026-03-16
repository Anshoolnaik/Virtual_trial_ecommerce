const express = require('express');
const router  = express.Router();
const { protectSeller } = require('../middleware/sellerAuthMiddleware');
const { getSellerOrders, updateOrderStatus } = require('../controllers/sellerOrderController');

router.use(protectSeller);

router.get('/',               getSellerOrders);
router.patch('/:id/status',   updateOrderStatus);

module.exports = router;
