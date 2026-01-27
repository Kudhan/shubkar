const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true
    },
    // CHANGED: Event is likely required now, but we might allow null for migration or specific edge cases
    // adhering to plan: "Constraint: No booking can exist without being linked to an Event."
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Booking must belong to an event']
    },
    serviceType: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    // CHANGED: New Service Plan Integration
    servicePlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicePlan',
        required: false // Optional for backward compatibility, but recommended for new bookings
    },
    quantity: {
        type: Number,
        default: 1
    },
    selectedAddOns: [{
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        total: Number
    }],
    pricingDetails: {
        basePrice: Number,      // (Plan Price * Quantity)
        addOnsTotal: Number,    // Sum of AddOns
        platformFee: Number,
        grandTotal: Number      // Should match finalPrice initially
    },

    status: {
        type: String,
        enum: ['inquiry', 'negotiation', 'confirmed', 'completed', 'cancelled', 'disputed', 'refunded'],
        default: 'inquiry'
    },
    negotiation: {
        status: {
            type: String,
            enum: ['OPEN', 'CUSTOMER_ACCEPTED', 'VENDOR_ACCEPTED', 'BOTH_ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
            default: 'OPEN'
        },
        currentOffer: {
            price: Number,
            message: String,
            by: { type: String, enum: ['customer', 'vendor'] },
            timestamp: { type: Date, default: Date.now }
        },
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

// Index to quickly find bookings for an event
bookingSchema.index({ event: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
