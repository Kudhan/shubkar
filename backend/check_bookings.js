const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/projects/shubkar/backend/.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bookings = await mongoose.connection.db.collection('bookings').find({}, { projection: { status: 1 } }).toArray();
        console.log("Total Bookings:", bookings.length);
        
        const statusCounts = {};
        for (const b of bookings) {
            statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
        }
        
        console.log("Booking Statuses found in DB:", statusCounts);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
check();
