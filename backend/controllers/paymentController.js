const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// Mock Payment Gateway processing
exports.processPayment = async (req, res) => {
    console.log("--------------------------------------------------");
    console.log("PROCESSING MOCK PAYMENT - START");
    const timestamp = new Date().toISOString();
    console.log("Timestamp:", timestamp);
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
            console.log("🔍 Finding booking:", bookingId);
            booking = await Booking.findById(bookingId);
        } catch (dboErr) {
            console.error("❌ Database Error finding booking:", dboErr);
            return res.status(400).json({ status: 'fail', message: 'Invalid booking ID format or DB Error' });
        }

        if (!booking) {
            console.error("❌ Error: Booking not found for ID:", bookingId);
            return res.status(404).json({ status: 'fail', message: 'Booking not found' });
        }

        console.log("✅ Found Booking:", booking._id);
        console.log("   Current Status:", booking.status);
        console.log("   Payment Status:", booking.paymentStatus);

        // Simulate Processing Delay
        console.log("⏳ Simulating delay...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("⏳ Delay finished.");

        // Mock Success Logic
        const transactionId = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        console.log("💳 Generated Transaction ID:", transactionId);

        // Ensure final price is set and is a Number
        let finalAmount = amount;
        if (!finalAmount && booking.finalPrice) finalAmount = booking.finalPrice;
        if (!finalAmount && booking.pricingDetails?.grandTotal) finalAmount = booking.pricingDetails.grandTotal;

        // Safety check for amount
        if (isNaN(finalAmount)) {
            console.warn("⚠️ Warning: Amount is not a number, defaulting to 0. Received:", amount);
            finalAmount = 0;
        }

        // Create Transaction Record
        try {
            console.log("📝 Creating Transaction record...");
            const transaction = await Transaction.create({
                booking: booking._id,
                amount: finalAmount,
                gatewayTransactionId: transactionId,
                paymentMethod: paymentMethod || 'mock_gateway',
                status: 'released', // Direct release for mock
                releasedAt: new Date()
            });
            console.log("✅ Transaction created:", transaction._id);
        } catch (txErr) {
            console.error("❌ Error creating transaction:", txErr);
            // Continue? or fail? Fails safe to continue or return error?
            // If transaction fails, we probably shouldn't update booking.
            return res.status(500).json({ status: 'error', message: 'Failed to create transaction record', details: txErr.message });
        }

        // Construct Update Object
        const updateData = {
            paymentStatus: 'paid',
            transactionId: transactionId,
        };

        if (!booking.finalPrice) {
            updateData.finalPrice = Number(finalAmount);
        }

        // If booking was in negotiation/inquiry, confirm it now
        if (booking.status !== 'completed' && booking.status !== 'cancelled') {
            console.log("🔄 Updating status to 'confirmed'");
            updateData.status = 'confirmed';
        }

        // --- UPDATE WITH findByIdAndUpdate ---
        try {
            console.log("💾 Attempting to update booking with ID:", bookingId);
            console.log("💾 Update Data:", JSON.stringify(updateData, null, 2));

            // modify validation to false or just use findByIdAndUpdate which defaults to no validation for updates unless specified
            await Booking.findByIdAndUpdate(bookingId, updateData, { runValidators: false });
            console.log("✅ Booking updated successfully!");
        } catch (saveError) {
            console.error("❌ CRITICAL: Failed to update booking:", saveError);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to update booking status in database',
                details: saveError.message
            });
        }

        console.log("PAYMENT PROCESSED SUCCESSFULLY");
        console.log("--------------------------------------------------");

        return res.status(200).json({
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
        if (!res.headersSent) {
            return res.status(500).json({ status: 'error', message: 'Internal Payment Processing Error', details: err.message });
        }
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
