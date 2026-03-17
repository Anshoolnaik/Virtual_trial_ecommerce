const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/sellerFlashSaleController');
const { protectSeller } = require('../middleware/sellerAuthMiddleware');

const router = Router();
router.use(protectSeller);

const createValidation = [
  body('productId').notEmpty().withMessage('Product is required.'),
  body('salePrice').isFloat({ gt: 0 }).withMessage('Sale price must be a positive number.'),
  body('endsAt').isISO8601().withMessage('Valid end date is required.'),
];

router.get('/',     ctrl.list);
router.post('/',    createValidation, ctrl.create);
router.put('/:id',  ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
