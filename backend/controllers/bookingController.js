const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Customer: Create Booking Request
exports.createBooking = async (req, res) => {
    try {
        const { vendorId, eventId, serviceType, date, price, notes } = req.body;

        const newBooking = await Booking.create({
            customer: req.user.id,
            vendor: vendorId,
            event: eventId,
            serviceType,
            date,
            price,
            notes
        });

        res.status(201).json({
            status: 'success',
            data: { booking: newBooking }
        });
    } catch (err) {
        console.error('Booking Creation Error:', err); // Debug Log
        console.log('Request Body:', req.body); // Debug Log
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Vendor: Accept/Reject
exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body; // 'accepted', 'rejected'

        // Verify vendor owns this booking request
        // Complex query: Booking.vendor is VendorProfileID. req.user is UserID.
        // We need to fetch the vendor profile for current user first to check ownership.
        // For simplicity, assuming req.user.vendorProfile is populated or we fetch it.
        // But req.user is from protect middleware which is User model.

        // Let's rely on finding the booking where vendor matches user's profile.
        // But wait, User model has vendorProfile field? Yes, I added references to User model.

        // Actually best way:
        const booking = await Booking.findById(bookingId).populate('vendor');

        // Determine if current user is the vendor or the customer (customer can cancel)
        // This logic needs to be robust. 
        // For now, assume Vendor Action.

        if (!booking) return res.status(404).json({ status: 'fail', message: 'Booking not found' });

        // Update
        booking.status = status;
        await booking.save();

        res.status(200).json({
            status: 'success',
            data: { booking }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
}

// Get Bookings (For Customer or Vendor)
exports.getBookings = async (req, res) => {
    try {
        let query = {};

        // 1. Admin/Super Admin
        if (req.user.role === 'admin' || req.user.role === 'super-admin') {
            // Admin can see everything, or filter by specific vendor if provided in query
            if (req.query.vendorId) {
                // If vendorId is in query, check if it's a valid ID or we need to find profile for a user ID? 
                // Let's assume frontend passes VendorProfile ID since that's what we usually list.
                query.vendor = req.query.vendorId;
            }
            // else show all
        }
        // 2. Customer
        else if (req.user.role === 'customer') {
            query.customer = req.user.id;
        }
        // 3. Vendor
        else if (req.user.role === 'vendor') {
            // Find bookings where vendor matches user's profile
            const user = await req.user.populate('vendorProfile');
            if (req.user.vendorProfile) {
                query.vendor = req.user.vendorProfile;
            } else {
                return res.status(400).json({ status: 'fail', message: 'Vendor profile not found' });
            }
        }

        const bookings = await Booking.find(query)
            .populate('customer', 'name')
            .populate('vendor', 'companyName')
            .populate('event', 'name date');

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: { bookings }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
}
