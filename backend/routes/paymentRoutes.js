const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/pay', paymentController.processPayment);
router.get('/invoice/:bookingId', paymentController.generateInvoice);

module.exports = router;
