const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String, // e.g., "Rahul's Wedding"
        required: [true, 'Event name is required']
    },
    type: {
        type: String,
        enum: ['Wedding', 'Birthday', 'Corporate', 'Engagement', 'Other'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    guestCount: Number,
    location: String,
    budget: {
        total: Number,
        spent: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'completed', 'cancelled'],
        default: 'planning'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
