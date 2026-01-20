const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', authMiddleware.restrictTo('customer'), bookingController.createBooking);
router.get('/', bookingController.getBookings);
// Negotiation & Actions
router.post('/:bookingId/negotiate', authMiddleware.restrictTo('vendor', 'customer'), bookingController.negotiateBooking);
router.patch('/:bookingId/accept', authMiddleware.restrictTo('vendor', 'customer'), bookingController.acceptBooking);
router.patch('/:bookingId/reject', authMiddleware.restrictTo('vendor', 'customer'), bookingController.rejectBooking);

module.exports = router;
