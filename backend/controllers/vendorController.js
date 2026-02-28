const VendorProfile = require('../models/VendorProfile');
const User = require('../models/User');
const Event = require('../models/Event');
const axios = require('axios');

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

        // 3. Link profile to user and set status to applied
        await User.findByIdAndUpdate(req.user.id, {
            vendorProfile: newProfile._id,
            vendorStatus: 'applied'
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

exports.updateMyProfile = async (req, res) => {
    try {
        // Prevent updating user field or approval status directly here
        if (req.body.user || req.body.isApproved || req.body.rating) {
            delete req.body.user;
            delete req.body.isApproved;
            delete req.body.rating;
        }

        // Ensure blockedDates is handled correctly if passed
        // (Mongoose/Express might auto-handle arrays, but checking just in case)

        const profile = await VendorProfile.findOneAndUpdate(
            { user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ status: 'fail', message: 'Profile not found' });
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

exports.getVendorsForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ status: 'fail', message: 'Event not found' });
        }

        const targetCity = event.location.city;
        if (!targetCity) {
            return res.status(400).json({ status: 'fail', message: 'Event does not have a location defined' });
        }

        // Case-insensitive regex for city matching
        const cityRegex = new RegExp(`^${targetCity}$`, 'i');

        const query = {
            isApproved: true,
            $or: [
                { "location.city": cityRegex },
                { "serviceCities": { $in: [cityRegex] } }
            ]
        };

        // Optional filters from query params
        const { service, minPrice, maxPrice } = req.query;
        if (service) query.services = service;
        if (minPrice || maxPrice) {
            query["priceRange.min"] = { $gte: minPrice || 0 };
        }

        const vendors = await VendorProfile.find(query).populate('user', 'name');

        res.status(200).json({
            status: 'success',
            results: vendors.length,
            eventLocation: targetCity,
            data: { vendors }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getPublicVendorDetails = async (req, res) => {
    try {
        const vendor = await VendorProfile.findById(req.params.id).populate('user', 'name');

        if (!vendor) {
            return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
        }

        if (!vendor.isApproved) {
            return res.status(404).json({ status: 'fail', message: 'Vendor not available' });
        }

        res.status(200).json({
            status: 'success',
            data: { vendor }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin only: Manage Vendor Lifecycle
exports.updateVendorStatus = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { status, remarks } = req.body; // 'verified', 'approved', 'active', 'suspended', 'rejected'

        const validStatuses = ['applied', 'verified', 'approved', 'active', 'suspended', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: 'fail', message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` });
        }

        const profile = await VendorProfile.findById(vendorId);
        if (!profile) return res.status(404).json({ status: 'fail', message: 'Vendor profile not found' });

        // Update Profile
        // 'approved' and 'active' imply isApproved = true
        profile.isApproved = ['approved', 'active'].includes(status);
        if (remarks) profile.adminRemarks = remarks; // Assuming we add this field or just log it

        await profile.save();

        // Update User Status
        await User.findByIdAndUpdate(profile.user, { vendorStatus: status });

        res.status(200).json({
            status: 'success',
            message: `Vendor status updated to ${status}`,
            data: { status }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
}

// Admin: Get Single Vendor
exports.getVendorById = async (req, res) => {
    try {
        const vendor = await VendorProfile.findById(req.params.id).populate('user', 'name email vendorStatus role');
        if (!vendor) {
            return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
        }
        res.status(200).json({
            status: 'success',
            data: { vendor }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin: Update Vendor
exports.updateVendorByAdmin = async (req, res) => {
    try {
        const vendor = await VendorProfile.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!vendor) {
            return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
        }

        res.status(200).json({
            status: 'success',
            data: { vendor }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin: Delete Vendor
exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await VendorProfile.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
        }

        // 1. Reset User Role and Status
        await User.findByIdAndUpdate(vendor.user, {
            role: 'customer',
            vendorStatus: 'not-vendor',
            $unset: { vendorProfile: 1 }
        });

        // 2. Delete Profile
        await VendorProfile.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin: Verify GST
exports.verifyGst = async (req, res) => {
    try {
        const { vendor_id } = req.params;
        const vendor = await VendorProfile.findById(vendor_id);
        
        if (!vendor) {
            return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
        }
        
        if (!vendor.gst_number) {
            return res.status(400).json({ status: 'fail', message: 'Vendor does not have a GST number' });
        }
        
        // Call external API
        const gstApiUrl = `https://rappid.in/apis/gst.php?mobile=123&gst=${vendor.gst_number}`;
        const response = await axios.get(gstApiUrl);
        
        res.status(200).json({
            status: 'success',
            data: response.data
        });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: 'Failed to verify GST' });
    }
};

// Admin: Approve Vendor
exports.approveVendor = async (req, res) => {
    try {
        const { vendor_id } = req.params;
        const vendor = await VendorProfile.findByIdAndUpdate(vendor_id, {
            is_verified: true,
            verification_status: 'APPROVED',
            isApproved: true
        }, { new: true });
        
        if (!vendor) return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
        
        await User.findByIdAndUpdate(vendor.user, { vendorStatus: 'approved' });
        
        res.status(200).json({ status: 'success', data: { vendor } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin: Reject Vendor
exports.rejectVendor = async (req, res) => {
    try {
        const { vendor_id } = req.params;
        const vendor = await VendorProfile.findByIdAndUpdate(vendor_id, {
            is_verified: false,
            verification_status: 'REJECTED',
            isApproved: false
        }, { new: true });
        
        if (!vendor) return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
        
        await User.findByIdAndUpdate(vendor.user, { vendorStatus: 'rejected' });
        
        res.status(200).json({ status: 'success', data: { vendor } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
