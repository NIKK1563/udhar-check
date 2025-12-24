const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require admin privileges
router.use(verifyToken, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/block', [
  body('block').isBoolean().withMessage('Block status required'),
  body('reason').optional().trim()
], validate, adminController.toggleBlockUser);
router.put('/users/:id/verify', [
  body('approve').isBoolean().withMessage('Approval status required')
], validate, adminController.verifyUser);
router.put('/users/:id/reject', [
  body('reason').notEmpty().trim().withMessage('Rejection reason required')
], validate, adminController.rejectUser);
router.put('/users/:id/partial-reject', [
  body('rejections').isArray().withMessage('Rejections array required'),
  body('rejections.*.type').isIn(['identity', 'address', 'selfie']).withMessage('Invalid rejection type'),
  body('rejections.*.reason').notEmpty().trim().withMessage('Rejection reason required')
], validate, adminController.partialRejectUser);

// Reports management
router.get('/reports', adminController.getAllReports);
router.put('/reports/:id', [
  body('status').isIn(['pending', 'under_review', 'resolved', 'dismissed']).withMessage('Valid status required')
], validate, adminController.resolveReport);

// Disputes management
router.get('/disputes', adminController.getAllDisputes);
router.put('/disputes/:id', [
  body('status').isIn(['open', 'under_review', 'resolved', 'closed']).withMessage('Valid status required')
], validate, adminController.resolveDispute);

// Loans management
router.get('/loans', adminController.getAllLoans);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', [
  body('key').notEmpty().withMessage('Setting key required'),
  body('value').notEmpty().withMessage('Setting value required')
], validate, adminController.updateSetting);
router.post('/settings/initialize', adminController.initializeSettings);

// Activity logs
router.get('/activity-logs', adminController.getActivityLogs);

module.exports = router;
