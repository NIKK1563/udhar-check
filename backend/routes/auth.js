const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { uploadOnboarding, uploadProfile, handleUploadError } = require('../middleware/upload');
const validate = require('../middleware/validate');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['lender', 'borrower']).withMessage('Role must be lender or borrower'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/change-password', verifyToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, authController.changePassword);

// Onboarding
router.post('/onboarding', 
  verifyToken, 
  uploadOnboarding, 
  handleUploadError,
  authController.completeOnboarding
);

// Profile picture upload
router.post('/profile-picture',
  verifyToken,
  uploadProfile,
  handleUploadError,
  authController.uploadProfilePicture
);

// Email verification
router.post('/send-email-verification', verifyToken, authController.sendEmailVerification);
router.post('/verify-email', verifyToken, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], validate, authController.verifyEmail);

// Phone verification
router.post('/send-phone-verification', verifyToken, authController.sendPhoneVerification);
router.post('/verify-phone', verifyToken, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], validate, authController.verifyPhone);

// Admin only - create admin
router.post('/create-admin', verifyToken, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('phone').trim().notEmpty()
], validate, authController.createAdmin);

module.exports = router;
