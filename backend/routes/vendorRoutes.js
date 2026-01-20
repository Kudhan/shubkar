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
router.patch('/profile', authMiddleware.restrictTo('vendor'), vendorController.updateMyProfile);

// Admin Routes
router.get('/all', authMiddleware.restrictTo('admin', 'superadmin'), vendorController.getAllVendors);
router.patch('/status/:vendorId', authMiddleware.restrictTo('admin', 'superadmin'), vendorController.updateVendorStatus);

router.get('/:id', authMiddleware.restrictTo('admin', 'superadmin'), vendorController.getVendorById);
router.patch('/:id', authMiddleware.restrictTo('admin', 'superadmin'), vendorController.updateVendorByAdmin);
router.delete('/:id', authMiddleware.restrictTo('admin', 'superadmin'), vendorController.deleteVendor);


module.exports = router;
