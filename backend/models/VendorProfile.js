const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required']
    },
    description: String,
    services: [{
        type: String,
        enum: ['Venue', 'Catering', 'Decor', 'Photography', 'Music', 'Entertainment', 'Makeup', 'Other']
    }],
    location: {
        city: String,
        address: String,
        coordinates: [Number] // [long, lat] for future map features
    },
    priceRange: {
        min: Number,
        max: Number
    },
    website: String,
    experience: Number,
    teamSize: Number,
    portfolio: [String], // Array of image URLs
    documents: {
        gst: String, // URL
        license: String, // URL
        other: [String]
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    // Extended "Orchids" Fields
    socialLinks: {
        instagram: String,
        facebook: String,
        youtube: String
    },
    bookingPolicy: {
        advancePercentage: Number, // e.g., 50%
        cancellationRules: String
    },
    serviceCities: [String], // Array of cities they operate in
    foundedYear: Number,
    awards: [String],
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
