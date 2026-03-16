const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/sellerProductController');
const { protectSeller } = require('../middleware/sellerAuthMiddleware');
const { upload } = require('../middleware/upload');

const router = Router();
router.use(protectSeller);   // all seller product routes require auth

const createValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('brand').trim().notEmpty().withMessage('Brand is required.'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
];

router.get('/',                         ctrl.list);
router.get('/:id',                      ctrl.getOne);
router.post('/', upload.array('images', 5), createValidation, ctrl.create);
router.put('/:id', upload.array('images', 5), ctrl.update);
router.delete('/:id',                   ctrl.remove);
router.delete('/:id/images/:imageId',   ctrl.removeImage);
router.patch('/:id/images/:imageId/primary', ctrl.setPrimary);

module.exports = router;
