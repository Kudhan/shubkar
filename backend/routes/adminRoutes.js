const express = require('express');
const statsController = require('../controllers/statsController');
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Stats
router.get('/dashboard', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), statsController.getDashboardStats);

// AI Features (Protected)
router.post('/recommend', authMiddleware.protect, aiController.getVendorRecommendations);
router.post('/risk-check', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), aiController.analyzeRisk);

const vendorController = require('../controllers/vendorController');

// Vendor KYC & Approval
router.post('/vendors/:vendor_id/verify-gst', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), vendorController.verifyGst);
router.post('/vendors/:vendor_id/approve', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), vendorController.approveVendor);
router.post('/vendors/:vendor_id/reject', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), vendorController.rejectVendor);

module.exports = router;
