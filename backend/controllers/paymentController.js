const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// Mock Payment Gateway processing
exports.processPayment = async (req, res) => {
    console.log("--------------------------------------------------");
    console.log("PROCESSING MOCK PAYMENT");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    try {
        const { bookingId, amount, paymentMethod } = req.body;

        if (!bookingId) {
            console.error("Error: Missing bookingId in request");
            return res.status(400).json({ status: 'fail', message: 'Missing bookingId' });
        }

        // Validate Booking
        let booking;
        try {
            booking = await Booking.findById(bookingId);
        } catch (dboErr) {
            console.error("Database Error finding booking:", dboErr);
            return res.status(400).json({ status: 'fail', message: 'Invalid booking ID format' });
        }

        if (!booking) {
            console.error("Error: Booking not found for ID:", bookingId);
            return res.status(404).json({ status: 'fail', message: 'Booking not found' });
        }

        console.log("Found Booking:", booking._id, "Current Status:", booking.status);

        // Simulate Processing Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Success Logic
        const transactionId = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

        // Update to 'paid' (direct payment) or 'escrow' (if we wanted to simulate escrow)
        // For this flow, we'll use 'paid' as it's a direct checkout.
        booking.paymentStatus = 'paid';
        booking.transactionId = transactionId;

        // If booking was in negotiation/inquiry, confirm it now
        if (booking.status !== 'completed' && booking.status !== 'cancelled') {
            console.log("Updating status to confirmed");
            booking.status = 'confirmed';
        }

        // Ensure final price is set if not already
        if (!booking.finalPrice) {
            console.log("Setting finalPrice to amount:", amount);
            booking.finalPrice = amount || 0;
        }

        await booking.save();
        console.log("Payment Processed Successfully. Transaction ID:", transactionId);
        console.log("--------------------------------------------------");

        res.status(200).json({
            status: 'success',
            data: {
                paymentStatus: 'paid',
                transactionId,
                amount,
                date: new Date()
            }
        });

    } catch (err) {
        console.error("CRITICAL PAYMENT ERROR:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.generateInvoice = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate('customer').populate('vendor');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Invoice available only for paid bookings' });
        }

        const amount = booking.finalPrice || booking.pricingDetails?.grandTotal || booking.negotiation?.currentOffer?.price || 0;

        const invoice = {
            id: 'INV-' + (booking.transactionId ? booking.transactionId.split('_')[1] : Date.now()),
            date: new Date(),
            customer: booking.customer?.name || "Customer",
            vendor: booking.vendor?.companyName || "Vendor",
            service: booking.serviceType,
            amount: amount,
            status: 'PAID'
        };

        res.status(200).json({ status: 'success', data: { invoice } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
