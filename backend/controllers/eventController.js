const Event = require('../models/Event');

// Customer: Create Event
exports.createEvent = async (req, res) => {
    try {
        const { title, eventType, date, guestCount, budget, location } = req.body;

        const newEvent = await Event.create({
            customer: req.user.id,
            title,
            eventType,
            date,
            guestCount,
            budget,
            location
        });

        res.status(201).json({ status: 'success', data: { event: newEvent } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Customer: Get My Events
exports.getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ customer: req.user.id })
            .populate('bookings') // Virtual populate
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: events.length,
            data: { events }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Customer: Get Single Event Details (Dashboard)
exports.getEventDetails = async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, customer: req.user.id })
            .populate({
                path: 'bookings',
                populate: { path: 'vendor', select: 'companyName serviceType' }
            });

        if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

        // Calculate Budget Stats
        const committedBudget = event.bookings.reduce((acc, booking) => {
            // Use final price if confirmed, else current offer or 0
            const price = booking.finalPrice || booking.negotiation?.currentOffer?.price || 0;
            return acc + price;
        }, 0);

        const eventObj = event.toObject();
        eventObj.budget.committed = committedBudget;
        eventObj.budget.remaining = event.budget.total - committedBudget;

        res.status(200).json({ status: 'success', data: { event: eventObj } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Customer: Update Event
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, customer: req.user.id }).populate('bookings');

        if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

        // 1. Lifecycle Check
        if (event.status === 'cancelled' || event.status === 'completed') {
            return res.status(400).json({ status: 'fail', message: `Cannot edit event in ${event.status} state.` });
        }

        // 2. Budget Integrity Check
        if (req.body.budget && req.body.budget.total) {
            const committedBudget = event.bookings.reduce((acc, booking) => {
                const price = booking.finalPrice || booking.negotiation?.currentOffer?.price || 0;
                // Only count active bookings (not cancelled/rejected)
                if (['cancelled', 'rejected'].includes(booking.status)) return acc;
                return acc + price;
            }, 0);

            if (req.body.budget.total < committedBudget) {
                return res.status(400).json({
                    status: 'fail',
                    message: `New budget (₹${req.body.budget.total}) cannot be less than committed expenses (₹${committedBudget}).`
                });
            }
        }

        // 3. Create Update Object (Sanitize)
        // Prevent overwriting customer, _id, or bookings directly
        const allowedUpdates = ['title', 'date', 'location', 'guestCount', 'budget', 'status', 'description'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // 4. Perform Update
        // using set to merge nested objects like budget correctly if needed, but for simple replacement:
        const updatedEvent = await Event.findByIdAndUpdate(event._id, updates, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ status: 'success', data: { event: updatedEvent } });
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
