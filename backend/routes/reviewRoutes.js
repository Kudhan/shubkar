const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public: Get reviews for a specific vendor
router.get('/vendor/:vendorId', reviewController.getVendorReviews);

// Protected
router.use(authMiddleware.protect);

router.get('/eligibility/:vendorId', reviewController.checkEligibility);

router.post('/', reviewController.createReview);

// Vendor-specific
router.get('/my-reviews', authMiddleware.restrictTo('vendor'), reviewController.getMyReviews);
router.patch('/:reviewId/reply', authMiddleware.restrictTo('vendor'), reviewController.replyToReview);

module.exports = router;
