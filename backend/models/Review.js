const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: false // Optional if they review without a specific booking linked (though recommended)
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: String,
    reply: String, // Vendor's reply
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient fetching
reviewSchema.index({ vendor: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
