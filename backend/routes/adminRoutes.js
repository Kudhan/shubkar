const express = require('express');
const statsController = require('../controllers/statsController');
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');

const router = express.Router();

// Stats
router.get('/dashboard', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), statsController.getDashboardStats);

// Get All Transactions for Super Admin
router.get('/transactions', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), async (req, res) => {
    try {
        // First, try to get transactions from Transaction collection
        let transactions = await Transaction.find()
            .sort('-createdAt')
            .populate({
                path: 'booking',
                populate: [
                    { path: 'customer', select: 'name email' },
                    { path: 'vendor', select: 'companyName' }
                ]
            });

        // If no transactions found, get payment data from Bookings
        if (!transactions || transactions.length === 0) {
            const bookings = await Booking.find({ 
                paymentStatus: { $in: ['paid', 'released', 'escrow'] }
            })
            .populate('customer', 'name email')
            .populate('vendor', 'companyName')
            .sort('-createdAt');

            // Transform bookings into transaction-like format
            transactions = bookings.map(booking => ({
                _id: booking._id,
                booking: booking,
                amount: booking.finalPrice || booking.pricingDetails?.grandTotal || 0,
                status: booking.paymentStatus,
                gatewayTransactionId: booking.transactionId,
                paymentMethod: 'Online',
                createdAt: booking.createdAt
            }));
        }

        res.status(200).json({
            status: 'success',
            data: { transactions }
        });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// AI Features (Protected)
router.post('/recommend', authMiddleware.protect, aiController.getVendorRecommendations);
router.post('/risk-check', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), aiController.analyzeRisk);

const vendorController = require('../controllers/vendorController');

// Vendor KYC & Approval
router.post('/vendors/:vendor_id/verify-gst', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), vendorController.verifyGst);
router.post('/vendors/:vendor_id/approve', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), vendorController.approveVendor);
router.post('/vendors/:vendor_id/reject', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), vendorController.rejectVendor);

module.exports = router;
