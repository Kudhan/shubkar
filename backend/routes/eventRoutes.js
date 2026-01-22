const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', eventController.createEvent);
router.get('/', eventController.getMyEvents);
router.get('/:id', eventController.getEventDetails); // New Route
router.patch('/:id', eventController.updateEvent);
router.post('/:id/tasks', eventController.addTask); // Sub-resource for tasks

module.exports = router;
