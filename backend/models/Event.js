const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Event must belong to a customer']
    },
    title: {
        type: String,
        required: [true, 'Please provide an event name'], // e.g., "Rahul's Wedding"
        trim: true
    },
    eventType: {
        type: String,
        enum: ['Wedding', 'Birthday', 'Corporate', 'Anniversary', 'Other'],
        required: true,
        default: 'Other'
    },
    date: {
        startDate: { type: Date, required: [true, 'Event must have a start date'] },
        endDate: Date
    },
    location: {
        city: String,
        venue: String,
        address: String,
        coordinates: [Number]
    },
    guestCount: {
        type: Number,
        required: [true, 'Please estimate guest count']
    },
    budget: {
        total: {
            type: Number,
            required: [true, 'Please set a total budget']
        },
        currency: {
            type: String,
            default: 'INR'
        },
        // Virtual-like fields or cached aggregations could go here, 
        // but for now we will calculate spent/committed on the fly or in controller.
    },
    status: {
        type: String,
        enum: ['draft', 'planning', 'confirmed', 'ongoing', 'completed', 'cancelled'],
        default: 'planning'
    },
    tasks: [{
        title: String,
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'done'],
            default: 'pending'
        },
        dueDate: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate bookings
eventSchema.virtual('bookings', {
    ref: 'Booking',
    foreignField: 'event',
    localField: '_id'
});

module.exports = mongoose.model('Event', eventSchema);
