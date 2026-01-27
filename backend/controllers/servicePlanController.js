const ServicePlan = require('../models/ServicePlan');
const VendorProfile = require('../models/VendorProfile');

// Create a new Service Plan
exports.createPlan = async (req, res) => {
    try {
        // 1. Get Vendor Profile for the current logged-in user
        const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
        if (!vendorProfile) {
            return res.status(404).json({
                status: 'fail',
                message: 'Vendor profile not found. Please create a profile first.'
            });
        }

        // 2. Create Plan
        const newPlan = await ServicePlan.create({
            ...req.body,
            vendor: vendorProfile._id
        });

        res.status(201).json({
            status: 'success',
            data: {
                plan: newPlan
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get Plans for a specific Vendor (Public)
exports.getVendorPlans = async (req, res) => {
    try {
        let vendorId = req.params.vendorId || req.query.vendorId;

        // If requesting own plans but vendorId not allowed/provided in query for public endpoint, 
        // usually public endpoint requires explicit vendorId.

        if (!vendorId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Vendor ID is required to fetch plans.'
            });
        }

        const plans = await ServicePlan.find({ vendor: vendorId, isActive: true });

        res.status(200).json({
            status: 'success',
            results: plans.length,
            data: {
                plans
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get My Plans (Vendor Protected - sees inactive too)
exports.getMyPlans = async (req, res) => {
    try {
        const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
        if (!vendorProfile) {
            return res.status(404).json({
                status: 'fail',
                message: 'Vendor profile not found.'
            });
        }

        const plans = await ServicePlan.find({ vendor: vendorProfile._id });

        res.status(200).json({
            status: 'success',
            results: plans.length,
            data: {
                plans
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Update Plan
exports.updatePlan = async (req, res) => {
    try {
        const plan = await ServicePlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                status: 'fail',
                message: 'No plan found with that ID'
            });
        }

        // Check ownership
        const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
        if (!vendorProfile || plan.vendor.toString() !== vendorProfile._id.toString()) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to edit this plan'
            });
        }

        const updatedPlan = await ServicePlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                plan: updatedPlan
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Delete Plan
exports.deletePlan = async (req, res) => {
    try {
        const plan = await ServicePlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                status: 'fail',
                message: 'No plan found with that ID'
            });
        }

        // Check ownership
        const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
        if (!vendorProfile || plan.vendor.toString() !== vendorProfile._id.toString()) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to delete this plan'
            });
        }

        await ServicePlan.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
