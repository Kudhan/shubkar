const VendorProfile = require('../models/VendorProfile');
const User = require('../models/User');

exports.createProfile = async (req, res) => {
    try {
        // 1. Check if profile already exists for this user
        const existingProfile = await VendorProfile.findOne({ user: req.user.id });
        if (existingProfile) {
            return res.status(400).json({ status: 'fail', message: 'Profile already exists' });
        }

        // 2. Create profile
        const newProfile = await VendorProfile.create({
            user: req.user.id,
            ...req.body
        });

        // 3. Link profile to user and set status to pending (should be default but explicit here)
        await User.findByIdAndUpdate(req.user.id, {
            vendorProfile: newProfile._id,
            vendorStatus: 'pending'
        });

        res.status(201).json({
            status: 'success',
            data: {
                profile: newProfile
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const profile = await VendorProfile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ status: 'fail', message: 'No profile found' });
        }
        res.status(200).json({
            status: 'success',
            data: { profile }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin only
exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await VendorProfile.find().populate('user', 'name email vendorStatus');
        res.status(200).json({
            status: 'success',
            results: vendors.length,
            data: { vendors }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Public
exports.searchVendors = async (req, res) => {
    try {
        const { service, city, minPrice, maxPrice } = req.query;
        let query = { isApproved: true }; // Only show approved vendors

        if (service) query.services = service;
        if (city) query["location.city"] = new RegExp(city, 'i');
        if (minPrice || maxPrice) {
            query["priceRange.min"] = { $gte: minPrice || 0 };
            // Simple overlap logic or just min check. For now just start price check.
        }

        const vendors = await VendorProfile.find(query).populate('user', 'name');
        res.status(200).json({
            status: 'success',
            results: vendors.length,
            data: { vendors }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
}

// Admin only
exports.approveVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid status' });
        }

        const profile = await VendorProfile.findById(vendorId);
        if (!profile) return res.status(404).json({ status: 'fail', message: 'Vendor profile not found' });

        // Update Profile
        profile.isApproved = (status === 'approved');
        await profile.save();

        // Update User Status
        await User.findByIdAndUpdate(profile.user, { vendorStatus: status });

        res.status(200).json({
            status: 'success',
            message: `Vendor ${status}`
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
}
