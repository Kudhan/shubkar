const express = require('express');
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Vendor Routes
router.use(authMiddleware.protect);

router.post('/', authMiddleware.restrictTo('vendor'), serviceController.createService);
router.get('/my/services', authMiddleware.restrictTo('vendor'), serviceController.getMyServices);
router.patch('/:id', authMiddleware.restrictTo('vendor'), serviceController.updateService);
router.put('/:id/publish', authMiddleware.restrictTo('vendor'), serviceController.publishService);

// Admin Routes
router.patch('/:serviceId/moderate', authMiddleware.restrictTo('admin', 'superadmin'), serviceController.moderateService);

module.exports = router;
