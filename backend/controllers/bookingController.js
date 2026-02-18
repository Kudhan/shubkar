const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Customer: Create Booking Request
// Customer: Start Inquiry / Booking Request
// Customer: Start Inquiry / Booking Request
const ServicePlan = require('../models/ServicePlan');

// Customer: Create Booking Request
exports.createBooking = async (req, res) => {
    try {
        const {
            vendorId,
            eventId,
            serviceType,
            date,
            price,
            notes,
            servicePlanId,
            quantity = 1,
            addOns = [] // Array of { name, quantity } from frontend, but we need to verify prices
        } = req.body;

        // 1. Validate Event Ownership
        const event = await Event.findOne({ _id: eventId, customer: req.user.id });
        if (!event) {
            return res.status(404).json({
                status: 'fail',
                message: 'Event not found. Please create an event first.'
            });
        }

        // 2. Validate Vendor
        const VendorProfile = require('../models/VendorProfile');
        const vendor = await VendorProfile.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
        }

        // Location Check
        const eventCity = event.location.city;
        const vendorCity = vendor.location.city;
        const isLocationMatch =
            (vendorCity && vendorCity.toLowerCase() === eventCity.toLowerCase()) ||
            (vendor.serviceCities && vendor.serviceCities.some(city => city.toLowerCase() === eventCity.toLowerCase()));

        if (!isLocationMatch) {
            return res.status(400).json({
                status: 'fail',
                message: `Vendor does not serve ${eventCity}. Please choose a local vendor.`
            });
        }

        // Check Blocked Dates
        const requestedDate = new Date(date || event.date.startDate);
        const isBlocked = vendor.blockedDates.some(blockedDate => {
            const bDate = new Date(blockedDate);
            return bDate.toISOString().split('T')[0] === requestedDate.toISOString().split('T')[0];
        });

        if (isBlocked) {
            return res.status(400).json({
                status: 'fail',
                message: 'Vendor is not available on this date'
            });
        }

        let finalPrice = price; // Default to manual price (Legacy/Fallback)
        let pricingDetails = {};
        let selectedPlan = null;
        let selectedAddOnsData = [];

        // 3. Service Plan Logic (If Plan ID Provided)
        if (servicePlanId) {
            const plan = await ServicePlan.findById(servicePlanId);
            if (!plan) {
                return res.status(404).json({ status: 'fail', message: 'Service Plan not found' });
            }
            if (plan.vendor.toString() !== vendorId.toString()) {
                return res.status(400).json({ status: 'fail', message: 'Plan does not belong to this vendor' });
            }

            selectedPlan = plan._id;

            // Calculate Base Price
            let basePrice = 0;
            if (plan.pricingModel === 'FIXED') {
                basePrice = plan.price * quantity; // Usually quantity 1 for fixed, but valid multiplier
            } else {
                basePrice = plan.price * quantity;
            }

            // Calculate Add-ons
            let addOnsTotal = 0;
            if (addOns && addOns.length > 0) {
                // Verify add-ons exist in plan
                selectedAddOnsData = addOns.map(reqAddOn => {
                    const planAddOn = plan.addOns.find(a => a.name === reqAddOn.name);
                    if (planAddOn) {
                        const cost = planAddOn.price * (reqAddOn.quantity || 1);
                        addOnsTotal += cost;
                        return {
                            name: planAddOn.name,
                            price: planAddOn.price,
                            quantity: reqAddOn.quantity || 1,
                            total: cost
                        };
                    }
                    return null;
                }).filter(a => a !== null);
            }

            finalPrice = basePrice + addOnsTotal;

            pricingDetails = {
                basePrice,
                addOnsTotal,
                platformFee: 0, // Placeholder
                grandTotal: finalPrice
            };
        }

        // 4. Create Booking
        const newBooking = await Booking.create({
            customer: req.user.id,
            vendor: vendorId,
            event: eventId,
            serviceType: serviceType || (selectedPlan ? 'Plan Based' : 'General'),
            servicePlan: selectedPlan,
            quantity,
            selectedAddOns: selectedAddOnsData,
            pricingDetails,
            date: date || event.date.startDate,
            status: 'inquiry',
            negotiation: {
                status: 'CUSTOMER_ACCEPTED',
                currentOffer: {
                    price: finalPrice,
                    message: notes,
                    by: 'customer'
                },
                history: [{
                    offeredBy: 'customer',
                    price: finalPrice,
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
// Negotiation: Reject/Cancel
exports.rejectBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ status: 'fail', message: 'Booking not found' });

        const role = await validateBookingAccess(booking, req.user);
        if (!role) return res.status(403).json({ status: 'fail', message: 'Not authorized' });

        booking.status = 'cancelled';
        booking.negotiation.status = 'REJECTED';

        booking.negotiation.history.push({
            offeredBy: role,
            price: booking.negotiation.currentOffer?.price,
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
        console.log("GET BOOKINGS REQUEST STARTED");
        console.log("User Role:", req.user.role);
        console.log("User ID:", req.user.id);
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
        // 3. Vendor
        else if (req.user.role === 'vendor') {
            const VendorProfile = require('../models/VendorProfile');
            const profile = await VendorProfile.findOne({ user: req.user.id });

            if (profile) {
                query.vendor = profile._id;
            } else {
                return res.status(400).json({ status: 'fail', message: 'Vendor profile not found' });
            }
        }

        const bookings = await Booking.find(query)
            .populate('customer', 'name')
            .populate('vendor', 'companyName')
            .populate('event', 'title date');

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: { bookings }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
}
