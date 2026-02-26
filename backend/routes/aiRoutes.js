const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Unified Chat Endpoint
router.post('/chat', aiController.chat);

module.exports = router;
