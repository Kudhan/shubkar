const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile', // Reference the Profile directly or User? Profile is better for vendor details.
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: false // allowing quick bookings without pre-created event
    },
    serviceType: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['inquiry', 'negotiation', 'confirmed', 'completed', 'cancelled', 'disputed', 'refunded'],
        default: 'inquiry'
    },
    negotiation: {
        currentPrice: Number,
        history: [{
            offeredBy: { type: String, enum: ['customer', 'vendor'] },
            price: Number,
            message: String,
            timestamp: { type: Date, default: Date.now },
            action: { type: String, enum: ['offer', 'counter', 'accept', 'reject'] }
        }]
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'escrow', 'released', 'refunded', 'failed'],
        default: 'pending'
    },
    escrowTransactionId: String,
    finalPrice: Number, // Agreed price after negotiation
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
