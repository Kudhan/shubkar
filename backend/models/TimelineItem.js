const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a title for the activity']
    },
    time: {
        type: String, // storing as HH:MM string for simplicity in this version, could be Date
        required: [true, 'Please provide a time']
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        default: 'General',
        enum: ['Ceremony', 'Catering', 'Photography', 'Music', 'General', 'Logistics']
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index to easily query by user and sort by time (alphabetical sort works for HH:MM 24h format)
timelineItemSchema.index({ user: 1, time: 1 });

module.exports = mongoose.model('TimelineItem', timelineItemSchema);
