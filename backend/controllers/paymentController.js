const Booking = require('../models/Booking');

exports.processPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod } = req.body;

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

        const invoice = {
            id: 'INV-' + booking.transactionId.split('_')[1],
            date: new Date(),
            customer: booking.customer.name,
            vendor: booking.vendor.companyName,
            service: booking.serviceType,
            amount: booking.price,
            status: 'PAID'
        };

        res.status(200).json({ status: 'success', data: { invoice } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
