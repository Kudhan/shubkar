const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Customer: Create Booking Request
// Customer: Start Inquiry / Booking Request
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
                status: 'CUSTOMER_ACCEPTED',
                currentOffer: {
                    price: price,
                    message: notes,
                    by: 'customer'
                },
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

// Helper to validate access
const validateBookingAccess = async (booking, user) => {
    if (user.role === 'vendor') {
        const VendorProfile = require('../models/VendorProfile');
        // booking.vendor is an ID of VendorProfile (or populated object)
        const vendorProfileId = booking.vendor._id || booking.vendor;
        const profile = await VendorProfile.findOne({ user: user.id });

        if (!profile || profile._id.toString() !== vendorProfileId.toString()) {
            return false;
        }
        return 'vendor';
    } else {
        // Customer
        if (booking.customer.toString() !== user.id) {
            return false;
        }
        return 'customer';
    }
};

// Negotiation: Make Offer / Counter-Offer
// Negotiation: Make Offer / Counter-Offer
exports.negotiateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { price, message } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ status: 'fail', message: 'Booking not found' });

        const role = await validateBookingAccess(booking, req.user);
        if (!role) return res.status(403).json({ status: 'fail', message: 'Not authorized' });

        // State Transition Logic
        const newState = role === 'customer' ? 'CUSTOMER_ACCEPTED' : 'VENDOR_ACCEPTED';

        // Update Negotiation State
        booking.negotiation.status = newState;
        booking.negotiation.currentOffer = {
            price: price,
            message: message,
            by: role
        };

        // Add to history
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
// Negotiation: Accept Offer
exports.acceptBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ status: 'fail', message: 'Booking not found' });

        const role = await validateBookingAccess(booking, req.user);
        if (!role) return res.status(403).json({ status: 'fail', message: 'Not authorized' });

        // Validate State
        const currentStatus = booking.negotiation.status;
        if (role === 'customer' && currentStatus !== 'VENDOR_ACCEPTED') {
            return res.status(400).json({ status: 'fail', message: 'Cannot accept. Waiting for vendor offer.' });
        }
        if (role === 'vendor' && currentStatus !== 'CUSTOMER_ACCEPTED') {
            return res.status(400).json({ status: 'fail', message: 'Cannot accept. Waiting for customer offer.' });
        }

        // Transition
        booking.negotiation.status = 'BOTH_ACCEPTED';
        booking.status = 'confirmed';
        booking.finalPrice = booking.negotiation.currentOffer.price;

        booking.negotiation.history.push({
            offeredBy: role, // Who accepted it
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
        if (!booking) return res.status(404).json({ status: 'fail', message: 'Booking not found' });

        const role = await validateBookingAccess(booking, req.user);
        if (!role) return res.status(403).json({ status: 'fail', message: 'Not authorized' });

        booking.status = 'cancelled'; // or rejected
        booking.negotiation.history.push({
            offeredBy: role,
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
