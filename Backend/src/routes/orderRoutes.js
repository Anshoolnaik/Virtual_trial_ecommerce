const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, getOrders, getOrder } = require('../controllers/orderController');

router.use(protect);

router.post('/',    createOrder);
router.get('/',     getOrders);
router.get('/:id',  getOrder);

module.exports = router;
