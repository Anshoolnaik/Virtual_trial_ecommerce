const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAddresses,
  createAddress,
  updateAddress,
  setDefault,
  deleteAddress,
} = require('../controllers/addressController');

router.use(protect); // all address routes require auth

router.get('/',           getAddresses);
router.post('/',          createAddress);
router.put('/:id',        updateAddress);
router.patch('/:id/default', setDefault);
router.delete('/:id',     deleteAddress);

module.exports = router;
