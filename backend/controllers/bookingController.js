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

// Customer: Start Inquiry / Booking Request
exports.createBooking = async (req, res) => {
    try {
        const { vendorId, eventId, serviceType, date, price, notes } = req.body;

        const newBooking = await Booking.create({
            customer: req.user.id,
            vendor: vendorId,
            event: eventId,
            serviceType,
            date,
            status: 'inquiry',
            negotiation: {
                currentPrice: price, // Initial offer/inquiry price
                history: [{
                    offeredBy: 'customer',
                    price: price,
                    message: notes,
                    action: 'offer'
                }]
            }
        });

        res.status(201).json({ status: 'success', data: { booking: newBooking } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Negotiation: Make Offer / Counter-Offer
exports.negotiateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { price, message } = req.body;

        const booking = await Booking.findById(bookingId).populate('vendor');
        if (!booking) return res.status(404).json({ status: 'fail', message: 'Booking not found' });

        // Identify role (Customer or Vendor)
        let role = 'customer';
        if (req.user.role === 'vendor') {
            // Verify ownership
            if (booking.vendor.user && booking.vendor.user.toString() !== req.user.id) {
                // If vendor field is Profile ID, we need to check if req.user owns that profile
                // Assuming logic here matches Profile check or populate user
                // For MVP, relying on the fact that we populate 'vendor' which is a Profile, that has a 'user' field?
                // Let's assume booking.vendor is ObjectId of VendorProfile.
                // We need to fetch it to check user.
                // Simpler check:
                const VendorProfile = require('../models/VendorProfile');
                const profile = await VendorProfile.findOne({ user: req.user.id });
                if (!profile || profile._id.toString() !== booking.vendor._id.toString()) {
                    return res.status(403).json({ status: 'fail', message: 'Not authorized' });
                }
                role = 'vendor';
            }
        } else if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ status: 'fail', message: 'Not authorized' });
        }

        // Add to history
        booking.negotiation.currentPrice = price;
        booking.negotiation.history.push({
            offeredBy: role,
            price: price,
            message: message,
            action: 'counter'
        });
        booking.status = 'negotiation';

        await booking.save();

        res.status(200).json({ status: 'success', data: { booking } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Negotiation: Accept Offer
exports.acceptBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        // Add authorization check similar to above...

        booking.status = 'confirmed';
        booking.finalPrice = booking.negotiation.currentPrice;
        booking.negotiation.history.push({
            offeredBy: req.user.role === 'vendor' ? 'vendor' : 'customer',
            price: booking.finalPrice,
            action: 'accept'
        });

        await booking.save();
        res.status(200).json({ status: 'success', data: { booking } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Negotiation: Reject/Cancel
exports.rejectBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        booking.status = 'cancelled'; // or rejected
        booking.negotiation.history.push({
            offeredBy: req.user.role === 'vendor' ? 'vendor' : 'customer',
            price: booking.negotiation.currentPrice,
            action: 'reject'
        });

        await booking.save();
        res.status(200).json({ status: 'success', data: { booking } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

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
