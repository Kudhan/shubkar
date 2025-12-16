const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const VendorProfile = require('./models/VendorProfile');

dotenv.config();

const inspectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Database Inspection ---');

        const users = await User.find({ role: 'vendor' });
        console.log(`\nTotal Vendor Users: ${users.length}`);
        users.forEach(u => console.log(`- ${u.email} (Status: ${u.vendorStatus}, ProfileID: ${u.vendorProfile})`));

        const profiles = await VendorProfile.find();
        console.log(`\nTotal Vendor Profiles: ${profiles.length}`);
        profiles.forEach(p => console.log(`- ${p.companyName} (Approved: ${p.isApproved}, UserID: ${p.user})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectDB();
