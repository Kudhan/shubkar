const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin', 'super-admin'],
        default: 'customer',
    },
    // Vendor specific fields
    vendorStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'not-vendor'],
        default: function () {
            return this.role === 'vendor' ? 'pending' : 'not-vendor';
        }
    },
    vendorProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile', // Separate model for rich vendor data
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Safety check: if password starts with $2a$ or $2b$ (bcrypt signals), it might be already hashed.
    // However, user might pick a password starting with that (rare). 
    // Better relies on isModified which Mongoose handles well unless we manually set it.

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
