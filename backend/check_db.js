const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/projects/shubkar/backend/.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const reviews = await mongoose.connection.db.collection('reviews').find({}).toArray();
        console.log("Total Reviews:", reviews.length);
        console.log("Review Data:", JSON.stringify(reviews, null, 2));
        
        const vendors = await mongoose.connection.db.collection('vendorprofiles').find({}).toArray();
        console.log("Total Vendors:", vendors.length);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
check();
