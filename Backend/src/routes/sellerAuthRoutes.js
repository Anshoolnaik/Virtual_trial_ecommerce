const { Router } = require('express');
const { body } = require('express-validator');
const {
  register, login, getMe,
  updateProfile, changePassword,
  updateNotifications, updatePayout, updatePolicies,
} = require('../controllers/sellerAuthController');
const { protectSeller } = require('../middleware/sellerAuthMiddleware');

const router = Router();

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('storeName').trim().notEmpty().withMessage('Store name is required.'),
    body('email')
      .isEmail().withMessage('Please enter a valid email.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  login
);

router.get('/me', protectSeller, getMe);

// Settings routes (all protected)
router.patch(
  '/settings/profile',
  protectSeller,
  [
    body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty.'),
    body('storeName').optional().trim().notEmpty().withMessage('Store name cannot be empty.'),
    body('email').optional().isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
    body('phone').optional({ nullable: true }).trim(),
    body('storeDescription').optional({ nullable: true }).trim(),
  ],
  updateProfile
);

router.patch(
  '/settings/password',
  protectSeller,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
  ],
  changePassword
);

router.patch('/settings/notifications', protectSeller, updateNotifications);
router.patch('/settings/payout', protectSeller, updatePayout);
router.patch('/settings/policies', protectSeller, updatePolicies);

module.exports = router;
