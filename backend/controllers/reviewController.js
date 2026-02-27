const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.createReview = async (req, res) => {
    try {
        const { vendorId, bookingId, rating, comment } = req.body;

        // 1. Verify Booking (mandatory for customer feedback now)
        if (!bookingId) {
            return res.status(400).json({ status: 'fail', message: 'A valid booking ID is required to leave a review.' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 'fail', message: 'Booking not found' });
        }
        
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ status: 'fail', message: 'You are not authorized to review this booking' });
        }

        // ENFORCE Business Logic: Feedback only after payment is done and date is completed
        const currentDate = new Date();
        const bookingDate = new Date(booking.date);

        if (booking.paymentStatus !== 'paid' && booking.paymentStatus !== 'released') {
            return res.status(400).json({ status: 'fail', message: 'Feedback can only be provided after payments are fully processed.' });
        }

        if (currentDate <= bookingDate) {
            return res.status(400).json({ status: 'fail', message: 'Feedback can only be provided after the booking date is completed.' });
        }

        // Prevent multiple reviews for the same booking
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ status: 'fail', message: 'You have already submitted a review for this booking.' });
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
            const mongoose = require('mongoose');
            await mongoose.model('VendorProfile').findByIdAndUpdate(vendorId, {
                'rating.average': stats[0].avgRating.toFixed(1),
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

exports.checkEligibility = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const customerId = req.user.id;
        const currentDate = new Date();

        // Find completed bookings for this vendor and customer that are fully paid
        const eligibleBookings = await Booking.find({
            vendor: vendorId,
            customer: customerId,
            paymentStatus: { $in: ['paid', 'released'] },
            date: { $lt: currentDate }
        });

        if (eligibleBookings.length === 0) {
            return res.status(200).json({
                status: 'success',
                data: { isEligible: false, bookings: [] }
            });
        }

        // Filter out bookings that already have reviews
        const eligibleBookingIds = eligibleBookings.map(b => b._id);
        const existingReviews = await Review.find({ booking: { $in: eligibleBookingIds } });
        const reviewedBookingIds = existingReviews.map(r => r.booking.toString());

        const finalEligibleBookings = eligibleBookings.filter(b => !reviewedBookingIds.includes(b._id.toString()));

        res.status(200).json({
            status: 'success',
            data: { 
                isEligible: finalEligibleBookings.length > 0,
                bookings: finalEligibleBookings
            }
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
