const Event = require('../models/Event');

// Customer: Create Event
exports.createEvent = async (req, res) => {
    try {
        const newEvent = await Event.create({
            customer: req.user.id,
            ...req.body
        });
        res.status(201).json({ status: 'success', data: { event: newEvent } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Customer: Get My Events
exports.getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ customer: req.user.id }).populate('bookings');
        res.status(200).json({
            status: 'success',
            results: events.length,
            data: { events }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Customer: Update Event (Budget, tasks etc)
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, customer: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

        res.status(200).json({ status: 'success', data: { event } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Customer: Add Task
exports.addTask = async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, customer: req.user.id });
        if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

        event.tasks.push(req.body);
        await event.save();

        res.status(200).json({ status: 'success', data: { event } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
