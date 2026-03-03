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
    email_verified: {
        type: Boolean,
        default: false,
    },
    otp_hash: {
        type: String,
        select: false,
    },
    otp_expiry: {
        type: Date,
        select: false,
    },
    otp_resend_count: {
        type: Number,
        default: 0,
    },
    otp_last_resent_at: {
        type: Date,
    },
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin', 'superadmin'],
        default: 'customer',
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active',
    },
    // Vendor specific fields
    vendorStatus: {
        type: String,
        enum: ['applied', 'verified', 'approved', 'active', 'suspended', 'not-vendor'],
        default: function () {
            return this.role === 'vendor' ? 'applied' : 'not-vendor';
        }
    },
    vendorProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile', // Separate model for rich vendor data
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date
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
