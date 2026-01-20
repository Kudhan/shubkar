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

module.exports = router;
