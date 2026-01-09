const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.patch('/update-profile', authController.protect, authController.updateProfile);
router.patch('/update-password', authController.protect, authController.updatePassword);

module.exports = router;
