const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const VendorProfile = require('./models/VendorProfile');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shubkar');
        console.log('Connected to DB');

        // Cleanup
        await User.findOneAndDelete({ email: 'seed_vendor@test.com' });

        // Create User
        const user = await User.create({
            name: 'Seed Vendor',
            email: 'seed_vendor@test.com',
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'vendor'
        });

        // Create Profile
        await VendorProfile.create({
            user: user._id,
            companyName: 'Seed Events Implementation',
            description: 'Manually seeded to verify Admin Dashboard.',
            services: ['Decor'], // Fixed enum
            location: { city: 'Mumbai' },
            contactEmail: 'seed_vendor@test.com',
            experience: 5,
            teamSize: 10,
            isApproved: false // Explicitly Pending
        });

        console.log('failed browser test compensation: Manual pending vendor created.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
