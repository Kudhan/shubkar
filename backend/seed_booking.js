const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const VendorProfile = require('./models/VendorProfile');
const Booking = require('./models/Booking');

dotenv.config();

const seedBooking = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shubkar');

        // 1. Get Seed Vendor
        const vendorUser = await User.findOne({ email: 'seed_vendor@test.com' });
        const vendorProfile = await VendorProfile.findOne({ user: vendorUser._id });

        // 2. Create/Get Customer
        let customer = await User.findOne({ email: 'final_user_paid@test.com' });
        if (!customer) {
            customer = await User.create({
                name: 'Final User Payment',
                email: 'final_user_paid@test.com',
                password: 'password123',
                passwordConfirm: 'password123',
                role: 'customer'
            });
        }

        // 3. Create Accepted Booking
        await Booking.create({
            user: customer._id,
            vendor: vendorProfile._id,
            serviceType: 'Decor',
            date: new Date('2025-05-20'),
            price: 50000,
            status: 'accepted', // Ready for payment
            notes: 'Seeded for Payment Verification'
        });

        console.log('Accepted Booking Created for final_user_paid@test.com');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedBooking();
