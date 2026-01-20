const User = require('../models/User');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

exports.getDashboardStats = async (req, res) => {
    try {
        // Parallel execution for performance
        const [
            totalUsers,
            totalVendors,
            totalBookings,
            totalRevenue
        ] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({ role: 'vendor' }),
            Booking.countDocuments(),
            Transaction.aggregate([
                { $match: { status: 'released' } },
                { $group: { _id: null, total: { $sum: '$platformFee' } } }
            ])
        ]);

        const recentBookings = await Booking.find()
            .sort('-createdAt')
            .limit(5)
            .populate('customer', 'name')
            .populate('vendor', 'companyName');

        res.status(200).json({
            status: 'success',
            data: {
                counts: {
                    customers: totalUsers,
                    vendors: totalVendors,
                    bookings: totalBookings,
                    revenue: totalRevenue[0]?.total || 0
                },
                recentActivity: recentBookings
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
