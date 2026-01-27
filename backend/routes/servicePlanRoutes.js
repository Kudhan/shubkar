const express = require('express');
const router = express.Router();
const servicePlanController = require('../controllers/servicePlanController');
const authController = require('../controllers/authController');

// Public Routes
router.get('/', servicePlanController.getVendorPlans); // ?vendorId=...

// Protected Routes
router.use(authController.protect);

router.post('/', servicePlanController.createPlan);
router.get('/my-plans', servicePlanController.getMyPlans);
router.patch('/:id', servicePlanController.updatePlan);
router.delete('/:id', servicePlanController.deletePlan);

module.exports = router;
