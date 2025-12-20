const express = require('express');
const timelineController = require('../controllers/timelineController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(timelineController.getTimeline)
    .post(timelineController.addTimelineItem);

router
    .route('/:id')
    .patch(timelineController.updateTimelineItem)
    .delete(timelineController.deleteTimelineItem);

module.exports = router;
