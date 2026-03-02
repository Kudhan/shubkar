const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Rate Limiter to prevent AI API abuse in large scale
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 50, // limit each IP to 50 requests per windowMs
    message: { status: "fail", message: "Too many AI requests from this IP, please try again after 15 minutes" },
    standardHeaders: true, 
    legacyHeaders: false,
});

// Unified Chat Endpoint
router.post('/chat', aiLimiter, aiController.chat);

module.exports = router;
