const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/projects/shubkar/backend/.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bookings = await mongoose.connection.db.collection('bookings').find({}, { projection: { vendor: 1, status: 1 } }).toArray();
        
        const vendorMap = {};
        for (const b of bookings) {
            const vId = b.vendor.toString();
            if(!vendorMap[vId]) vendorMap[vId] = {};
            vendorMap[vId][b.status] = (vendorMap[vId][b.status] || 0) + 1;
        }
        
        console.log("Bookings by Vendor ID:");
        for (const [vId, counts] of Object.entries(vendorMap)) {
            console.log(`Vendor ${vId}: ${JSON.stringify(counts)}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
check();
