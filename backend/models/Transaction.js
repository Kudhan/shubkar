const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        default: 0
    },
    vendorPayout: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'escrow_held', 'released', 'refunded', 'failed'],
        default: 'pending'
    },
    gatewayTransactionId: String,
    paymentMethod: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    releasedAt: Date
});

module.exports = mongoose.model('Transaction', transactionSchema);
