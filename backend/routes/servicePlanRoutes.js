const express = require('express');
const router = express.Router();
const servicePlanController = require('../controllers/servicePlanController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Routes
router.get('/', servicePlanController.getVendorPlans); // ?vendorId=...

// Protected Routes
router.use(authMiddleware.protect);

router.get('/admin/all', authMiddleware.restrictTo('admin', 'superadmin'), servicePlanController.getAllPlans);

router.post('/', servicePlanController.createPlan);
router.get('/my-plans', servicePlanController.getMyPlans);
router.patch('/:id', servicePlanController.updatePlan);
router.delete('/:id', servicePlanController.deletePlan);

module.exports = router;
