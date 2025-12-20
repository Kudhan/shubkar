const TimelineItem = require('../models/TimelineItem');

exports.getTimeline = async (req, res) => {
    try {
        const items = await TimelineItem.find({ user: req.user.id }).sort({ time: 1 });

        res.status(200).json({
            status: 'success',
            results: items.length,
            data: {
                timeline: items
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.addTimelineItem = async (req, res) => {
    try {
        const newItem = await TimelineItem.create({
            ...req.body,
            user: req.user.id
        });

        res.status(201).json({
            status: 'success',
            data: {
                item: newItem
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteTimelineItem = async (req, res) => {
    try {
        await TimelineItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateTimelineItem = async (req, res) => {
    try {
        const item = await TimelineItem.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                status: 'fail',
                message: 'No item found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                item
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
