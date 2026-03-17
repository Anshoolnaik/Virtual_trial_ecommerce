const { Router } = require('express');
const ctrl = require('../controllers/publicFlashSaleController');

const router = Router();

router.get('/', ctrl.active);

module.exports = router;
