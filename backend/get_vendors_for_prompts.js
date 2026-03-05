const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/projects/shubkar/backend/.env' });

async function getVendorsForPrompt() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const vendors = await mongoose.connection.db.collection('vendorprofiles').find({}, { projection: { companyName: 1, services: 1, 'location.city': 1, serviceCities: 1 } }).toArray();
        
        console.log("VENDORS FOUND IN DB:");
        vendors.forEach(v => {
            console.log(`- ${v.companyName} | Services: ${v.services?.join(', ')} | City: ${v.location?.city || v.serviceCities?.[0]}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
getVendorsForPrompt();
