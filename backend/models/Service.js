const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Service must belong to a vendor']
    },
    title: {
        type: String,
        required: [true, 'Service must have a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Service must have a description']
    },
    category: {
        type: String,
        required: [true, 'Service must have a category'],
        enum: ['Venue', 'Catering', 'Decor', 'Photography', 'Music', 'Entertainment', 'Makeup', 'Other']
    },
    basePrice: {
        type: Number,
        required: [true, 'Service must have a base price']
    },
    priceUnit: {
        type: String, // e.g., 'per hour', 'per event', 'per plate'
        required: true
    },
    images: [String],
    lifecycleStatus: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'published', 'archived', 'rejected'],
        default: 'draft'
    },
    adminFeedback: String, // Reason for rejection or simple feedback
    avgRating: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666 -> 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index adjustments
serviceSchema.index({ basePrice: 1, ratingsAverage: -1 });

module.exports = mongoose.model('Service', serviceSchema);
