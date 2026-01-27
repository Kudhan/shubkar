const mongoose = require('mongoose');

const servicePlanSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: [true, 'Service Plan must belong to a vendor']
    },
    name: {
        type: String,
        required: [true, 'Plan name is required'],
        trim: true,
        maxlength: [100, 'Plan name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Plan description is required'],
        trim: true
    },
    pricingModel: {
        type: String,
        enum: ['FIXED', 'PER_UNIT'],
        required: true,
        default: 'FIXED'
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    unitType: {
        type: String,
        // Common units: 'event', 'hour', 'plate', 'day', 'session', 'guest', 'sqft'
        default: 'event',
        required: function () { return this.pricingModel === 'PER_UNIT'; }
    },
    minQuantity: {
        type: Number,
        default: 1,
        min: [1, 'Minimum quantity must be at least 1']
    },
    maxQuantity: {
        type: Number,
        // No default, optional. If null, essentially unlimited.
    },
    includedItems: [{
        type: String,
        trim: true
    }],
    addOns: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        unit: { type: String, default: 'item' }, // e.g., 'per extra hour', 'per item'
        description: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for quick retrieval by vendor
servicePlanSchema.index({ vendor: 1, isActive: 1 });

module.exports = mongoose.model('ServicePlan', servicePlanSchema);
