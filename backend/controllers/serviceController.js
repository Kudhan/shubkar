const Service = require('../models/Service');

// Vendor: Create Service (Draft)
exports.createService = async (req, res) => {
    try {
        const newService = await Service.create({
            vendor: req.user.id,
            ...req.body,
            lifecycleStatus: 'draft' // Always start as draft
        });

        res.status(201).json({
            status: 'success',
            data: { service: newService }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Vendor: Get My Services
exports.getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ vendor: req.user.id });
        res.status(200).json({
            status: 'success',
            results: services.length,
            data: { services }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Vendor: Update Service
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findOne({ _id: req.params.id, vendor: req.user.id });
        if (!service) return res.status(404).json({ status: 'fail', message: 'Service not found or not yours' });

        if (service.lifecycleStatus === 'published') {
            // Maybe restrict updates on published services or revert to draft?
            // For now, allow but warn or maybe set to 'submitted' for re-review?
            // Let's keep it simple: if you edit, it goes back to 'draft' or 'submitted'.
            // user request: "Draft -> Submitted -> Approved -> Published"
            req.body.lifecycleStatus = 'draft';
        }

        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: { service: updatedService }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Vendor: Submit for Review
exports.publishService = async (req, res) => {
    try {
        const service = await Service.findOne({ _id: req.params.id, vendor: req.user.id });
        if (!service) return res.status(404).json({ status: 'fail', message: 'Service not found' });

        service.lifecycleStatus = 'submitted';
        await service.save();

        res.status(200).json({
            status: 'success',
            message: 'Service submitted for review',
            data: { service }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Public: Get All Published Services
exports.getAllServices = async (req, res) => {
    try {
        const queryObj = { ...req.query, lifecycleStatus: 'published' };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Service.find(JSON.parse(queryStr)).populate('vendor', 'name vendorStatus');

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const services = await query;

        res.status(200).json({
            status: 'success',
            results: services.length,
            data: { services }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin: Moderate Service
exports.moderateService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { status, feedback } = req.body; // 'approved', 'rejected', 'published' (maybe admin can publish directly)

        if (!['approved', 'published', 'rejected'].includes(status)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid status' });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ status: 'fail', message: 'Service not found' });

        service.lifecycleStatus = status === 'approved' ? 'published' : status; // 'approved' usually means published here or next step
        if (feedback) service.adminFeedback = feedback;

        await service.save();

        res.status(200).json({
            status: 'success',
            message: `Service marked as ${service.lifecycleStatus}`,
            data: { service }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin: Get All Services (for moderation)
exports.getAdminServices = async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        let query = Service.find(queryObj).populate('vendor', 'name vendorStatus email companyName');

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const services = await query;

        res.status(200).json({
            status: 'success',
            results: services.length,
            data: { services }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('vendor');
        if (!service) return res.status(404).json({ status: 'fail', message: 'Service not found' });

        res.status(200).json({
            status: 'success',
            data: { service }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
