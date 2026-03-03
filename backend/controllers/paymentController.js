const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');
const emailService = require('../services/emailService');

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

        // Fetch Transaction Details
        const transaction = await Transaction.findOne({ booking: bookingId });
        const paymentMethod = transaction ? transaction.paymentMethod : 'N/A';
        // Map internal payment codes to readable names (optional, but good for UI)
        const paymentModeDisplay = paymentMethod === 'upi' ? 'UPI / QR' :
            paymentMethod === 'card' ? 'Credit/Debit Card' :
                paymentMethod === 'netbanking' ? 'Net Banking' :
                    paymentMethod;

        const invoice = {
            id: 'INV-' + (booking.transactionId ? booking.transactionId.split('_')[1] : Date.now()),
            date: new Date(),
            customer: booking.customer?.name || "Customer",
            vendor: booking.vendor?.companyName || "Vendor",
            service: booking.serviceType,
            amount: amount,
            status: 'PAID',
            paymentMode: paymentModeDisplay
        };

        res.status(200).json({ status: 'success', data: { invoice } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.emailInvoice = async (req, res) => {
    try {
        const { bookingId } = req.params;
        // Populate vendor's user to get email if needed
        const booking = await Booking.findById(bookingId)
            .populate('customer')
            .populate({
                path: 'vendor',
                populate: { path: 'user' }
            });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Invoice available only for paid bookings' });
        }

        const amount = booking.finalPrice || booking.pricingDetails?.grandTotal || booking.negotiation?.currentOffer?.price || 0;

        const transaction = await Transaction.findOne({ booking: bookingId });
        const paymentMethod = transaction ? transaction.paymentMethod : 'N/A';
        const invoiceId = 'INV-' + (booking.transactionId ? booking.transactionId.split('_')[1] : Date.now());

        const invoiceDetails = {
            id: invoiceId,
            service: booking.serviceType,
            amount: amount,
            date: new Date(),
            customer: booking.customer?.name || "Customer",
            vendor: booking.vendor?.companyName || "Vendor",
            paymentMode: paymentMethod
        };

        // Determine recipient
        let recipientEmail = booking.customer.email;
        let recipientName = booking.customer.name;
        
        // If current user is the vendor or requested for vendor
        if (req.user && req.user.role === 'vendor') {
            // Check if vendor profile matches.
            // Using user object populated in vendor
            if (booking.vendor?.user?.email) {
                recipientEmail = booking.vendor.user.email;
                recipientName = booking.vendor.user.name;
            } else {
                 recipientEmail = req.user.email;
                 recipientName = req.user.name;
            }
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);
            
            try {
                await emailService.sendInvoiceEmail(recipientEmail, recipientName, invoiceDetails, pdfData);
                res.status(200).json({ status: 'success', message: 'Invoice emailed successfully' });
            } catch (emailErr) {
                console.error('[Invoice Email Error]', emailErr.message);
                res.status(500).json({ status: 'error', message: 'Failed to send invoice email' });
            }
        });

        // Simple PDF Design
        doc.fontSize(28).fillColor('#FF6B6B').text('SHUBKAR', { align: 'center' });
        doc.fontSize(10).fillColor('#6B7280').text('Event Management Platform', { align: 'center' });
        doc.moveDown(2);
        
        doc.fontSize(20).fillColor('#1F2937').text('INVOICE', { underline: true });
        doc.moveDown();
        
        doc.fontSize(12).text(`Invoice ID:  ${invoiceId}`);
        doc.text(`Date:        ${invoiceDetails.date.toLocaleDateString()}`);
        doc.moveDown();
        
        doc.text(`Billed To:  ${invoiceDetails.customer}`);
        doc.text(`Vendor:     ${invoiceDetails.vendor}`);
        doc.moveDown();
        
        doc.rect(50, doc.y, 500, 20).fill('#F9FAFB');
        doc.fillColor('#1F2937').text('Description', 60, doc.y + 5);
        doc.text('Amount', 450, doc.y - 14, { width: 90, align: 'right' });
        
        doc.moveDown(1.5);
        doc.text(`Service: ${invoiceDetails.service}`, 60, doc.y);
        doc.text(`Rs. ${amount}`, 450, doc.y - 14, { width: 90, align: 'right' });
        
        doc.moveDown(2);
        const yLine = doc.y;
        doc.moveTo(50, yLine).lineTo(550, yLine).stroke();
        doc.moveDown(0.5);
        
        doc.fontSize(14).text('Total Paid:', 60, doc.y);
        doc.text(`Rs. ${amount}`, 450, doc.y - 14, { width: 90, align: 'right' });
        
        doc.moveDown(2);
        doc.fontSize(10).fillColor('#6B7280').text(`Payment Mode: ${invoiceDetails.paymentMode}`);
        doc.text(`Status: PAID in Full`);
        
        doc.moveDown(5);
        doc.fontSize(10).text('Thank you for choosing Shubkar!', { align: 'center' });
        
        doc.end();

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
