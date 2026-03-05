const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/projects/shubkar/backend/.env' });
const VendorProfile = require('./models/VendorProfile');

async function testQuery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const safeCity = 'Visakhapatnam'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const safeCategory = 'Catering'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        console.log("Searching for City:", safeCity, "and Category:", safeCategory);

        const query = {
            services: { $in: [new RegExp(safeCategory, 'i')] },
            $or: [
                { 'location.city': new RegExp(safeCity, 'i') },
                { serviceCities: { $in: [new RegExp(safeCity, 'i')] } }
            ]
        };

        const vendors = await VendorProfile.find(query).select('companyName services location serviceCities');
        
        console.log("RESULTS FOUND:", vendors.length);
        vendors.forEach(v => {
            console.log(`- ${v.companyName} | Services: ${v.services} | Loc: ${v.location?.city} | ServCity: ${v.serviceCities}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
testQuery();
