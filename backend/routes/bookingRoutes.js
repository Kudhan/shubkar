const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', authMiddleware.restrictTo('customer'), bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.patch('/:bookingId', authMiddleware.restrictTo('vendor', 'customer'), bookingController.updateBookingStatus);

module.exports = router;
