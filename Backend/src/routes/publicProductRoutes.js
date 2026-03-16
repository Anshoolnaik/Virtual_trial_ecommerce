const { Router } = require('express');
const ctrl = require('../controllers/publicProductController');

const router = Router();

router.get('/',             ctrl.list);
router.get('/new-arrivals', ctrl.newArrivals);
router.get('/trending',     ctrl.trending);
router.get('/:id',          ctrl.getOne);

module.exports = router;
