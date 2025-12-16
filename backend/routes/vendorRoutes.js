const express = require('express');
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.get('/search', vendorController.searchVendors);

// Protected Vendor Routes
router.use(authMiddleware.protect);

router.post('/profile', authMiddleware.restrictTo('vendor'), vendorController.createProfile);
router.get('/profile', authMiddleware.restrictTo('vendor'), vendorController.getProfile);

// Admin Routes
router.get('/all', authMiddleware.restrictTo('admin', 'super-admin'), vendorController.getAllVendors);
router.patch('/approve/:vendorId', authMiddleware.restrictTo('admin', 'super-admin'), vendorController.approveVendor);

module.exports = router;
