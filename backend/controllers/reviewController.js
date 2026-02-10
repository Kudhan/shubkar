const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.createReview = async (req, res) => {
    try {
        const { vendorId, bookingId, rating, comment } = req.body;

        // 1. Verify Booking (optional but recommended)
        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ status: 'fail', message: 'Booking not found' });
            }
            if (booking.customer.toString() !== req.user.id) {
                return res.status(403).json({ status: 'fail', message: 'You are not authorized to review this booking' });
            }
        }

        // 2. Create Review
        const newReview = await Review.create({
            vendor: vendorId,
            customer: req.user.id,
            booking: bookingId,
            rating,
            comment
        });

        // 3. Update Vendor Average Rating (Aggregation)
        const stats = await Review.aggregate([
            { $match: { vendor: newReview.vendor } },
            {
                $group: {
                    _id: '$vendor',
                    nRating: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        if (stats.length > 0) {
            await mongoose.model('VendorProfile').findByIdAndUpdate(vendorId, {
                'rating.average': stats[0].avgRating,
                'rating.count': stats[0].nRating
            });
        }

        res.status(201).json({
            status: 'success',
            data: { review: newReview }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getVendorReviews = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const reviews = await Review.find({ vendor: vendorId })
            .populate('customer', 'name photo')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: { reviews }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        // Find the vendor profile for the logged-in user
        const vendorProfile = await mongoose.model('VendorProfile').findOne({ user: req.user.id });

        if (!vendorProfile) {
            return res.status(404).json({ status: 'fail', message: 'Vendor profile not found' });
        }

        const reviews = await Review.find({ vendor: vendorProfile._id })
            .populate('customer', 'name photo')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: { reviews }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Allow vendor to reply
exports.replyToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reply } = req.body;

        const review = await Review.findById(reviewId).populate('vendor');

        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Review not found' });
        }

        // Verify that the logged-in user owns the vendor profile
        if (review.vendor.user.toString() !== req.user.id) {
            return res.status(403).json({ status: 'fail', message: 'Not authorized to reply to this review' });
        }

        review.reply = reply;
        await review.save();

        res.status(200).json({
            status: 'success',
            data: { review }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
