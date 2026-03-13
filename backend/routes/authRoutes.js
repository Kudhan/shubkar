const express = require('express');
const authController = require('../controllers/authController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.array('business_documents', 5), authController.register);
router.post('/login', authController.login);
router.post('/verify-email-otp', authController.verifyEmailOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.patch('/update-profile', authController.protect, authController.updateProfile);
router.patch('/update-password', authController.protect, authController.updatePassword);

module.exports = router;
