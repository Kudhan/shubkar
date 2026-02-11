const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// Mock Payment Gateway processing
exports.processPayment = async (req, res) => {
    console.log("--------------------------------------------------");
    console.log("PROCESSING MOCK PAYMENT - START");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    try {
        const { bookingId, amount, paymentMethod } = req.body;

        if (!bookingId) {
            console.error("❌ Error: Missing bookingId in request");
            return res.status(400).json({ status: 'fail', message: 'Missing bookingId' });
        }

        // Validate Booking
        let booking;
        try {
            booking = await Booking.findById(bookingId);
        } catch (dboErr) {
            console.error("❌ Database Error finding booking:", dboErr);
            return res.status(400).json({ status: 'fail', message: 'Invalid booking ID format' });
        }

        if (!booking) {
            console.error("❌ Error: Booking not found for ID:", bookingId);
            return res.status(404).json({ status: 'fail', message: 'Booking not found' });
        }

        console.log("✅ Found Booking:", booking._id);
        console.log("   Current Status:", booking.status);
        console.log("   Payment Status:", booking.paymentStatus);

        // Simulate Processing Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Success Logic
        const transactionId = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        console.log("💳 Generated Transaction ID:", transactionId);

        // Update to 'paid'
        booking.paymentStatus = 'paid';
        booking.transactionId = transactionId;

        // If booking was in negotiation/inquiry, confirm it now
        // BUT prioritize 'confirmed' if it's not cancelled/completed
        if (booking.status !== 'completed' && booking.status !== 'cancelled') {
            console.log("🔄 Updating status to 'confirmed'");
            booking.status = 'confirmed';
        }

        // Ensure final price is set and is a Number
        let finalAmount = amount;
        if (!finalAmount && booking.finalPrice) finalAmount = booking.finalPrice;
        if (!finalAmount && booking.pricingDetails?.grandTotal) finalAmount = booking.pricingDetails.grandTotal;

        // Safety check for amount
        if (isNaN(finalAmount)) {
            console.warn("⚠️ Warning: Amount is not a number, defaulting to 0. Received:", amount);
            finalAmount = 0;
        }

        if (!booking.finalPrice) {
            // Need to set it for the record
            booking.finalPrice = Number(finalAmount);
        }

        // --- SPECIFIC SAVE ATTEMPT ---
        try {
            console.log("💾 Attempting to save booking updates...");
            await booking.save();
            console.log("✅ Booking saved successfully!");
        } catch (saveError) {
            console.error("❌ CRITICAL: Failed to save booking:", saveError);
            // Return 500 but don't crash main process if possible, though express catches async errors usually
            return res.status(500).json({
                status: 'error',
                message: 'Failed to update booking status in database',
                details: saveError.message
            });
        }

        console.log("PAYMENT PROCESSED SUCCESSFULLY");
        console.log("--------------------------------------------------");

        res.status(200).json({
            status: 'success',
            data: {
                paymentStatus: 'paid',
                transactionId,
                amount: Number(finalAmount),
                date: new Date()
            }
        });

    } catch (err) {
        console.error("❌ CRITICAL UNHANDLED PAYMENT ERROR:", err);
        console.log("--------------------------------------------------");
        res.status(500).json({ status: 'error', message: 'Internal Payment Processing Error', details: err.message });
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
