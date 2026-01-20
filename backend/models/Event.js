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
        default: 'Other'
    },
    date: {
        type: Date,
        required: [true, 'Event must have a date']
    },
    guestCount: Number,
    budget: {
        total: Number,
        currency: {
            type: String,
            default: 'INR'
        }
    },
    location: {
        city: String,
        venue: String
    },
    status: {
        type: String,
        enum: ['planning', 'confirmed', 'completed', 'cancelled'],
        default: 'planning'
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
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
});

module.exports = mongoose.model('Event', eventSchema);
