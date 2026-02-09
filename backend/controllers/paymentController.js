const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// Mock Payment Gateway processing
exports.processPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod } = req.body;

        // Validate Booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 'fail', message: 'Booking not found' });
        }

        // Simulate Processing Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Success Logic
        const transactionId = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

        booking.paymentStatus = 'paid';
        booking.transactionId = transactionId;

        // If booking was in negotiation/inquiry, confirm it now
        if (booking.status !== 'completed' && booking.status !== 'cancelled') {
            booking.status = 'confirmed';
        }

        // Ensure final price is set if not already
        if (!booking.finalPrice) {
            booking.finalPrice = amount;
        }

        await booking.save();

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
        console.error("Payment Error:", err);
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
