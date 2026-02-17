const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

const fs = require('fs');
// Helper for colored logs
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('verify.log', msg + '\n');
};
const success = (msg) => {
    console.log(`\x1b[32m✔ ${msg}\x1b[0m`);
    fs.appendFileSync('verify.log', `SUCCESS: ${msg}\n`);
};
const fail = (msg, err) => {
    console.log(`\x1b[31m✘ ${msg}\x1b[0m`);
    fs.appendFileSync('verify.log', `FAIL: ${msg}\n`);
    if (err && err.response) {
        fs.appendFileSync('verify.log', `  Status: ${err.response.status}\n`);
        fs.appendFileSync('verify.log', `  Message: ${err.response.data.message}\n`);
        fs.appendFileSync('verify.log', `  Data: ${JSON.stringify(err.response.data)}\n`);
    } else if (err) {
        fs.appendFileSync('verify.log', `  Error: ${err.message}\n`);
        if (err.code === 'ECONNREFUSED') fs.appendFileSync('verify.log', '  Make sure the backend server is running!\n');
    }
};

const runTest = async () => {
    log('\n🚀 Starting Vendor Blocked Date Verification...\n');

    // 0. Connectivity Check
    try {
        await axios.get('http://127.0.0.1:5000/');
        success('Server is reachable');
    } catch (err) {
        fail('Server is not reachable. Is backend running?', err);
        return;
    }

    try {
        // 1. Create unique users for this test run
        const suffix = Date.now();
        const vendorUser = {
            name: `Vendor ${suffix}`,
            email: `vendor_${suffix}@test.com`,
            password: 'password123',
            role: 'vendor'
        };
        const customerUser = {
            name: `Customer ${suffix}`,
            email: `customer_${suffix}@test.com`,
            password: 'password123',
            role: 'customer'
        };

        // 2. Register Vendor
        log('Creating Vendor...');
        let vendorReg;
        try {
            vendorReg = await axios.post(`${API_URL}/auth/register`, vendorUser);
        } catch (e) { fail('Vendor Registration Failed', e); throw e; }

        const vendorToken = vendorReg.data.token;

        // 3. Update Vendor Profile (auto-created)
        const vendorClient = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${vendorToken}` } });

        // Define a blocked date (TOMORROW)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const blockedDateStr = tomorrow.toISOString().split('T')[0];

        // Update Profile
        log('Updating Vendor Profile with details and blocked dates...');
        try {
            await vendorClient.patch('/vendors/profile', {
                companyName: `Test Company ${suffix}`,
                services: ['Photography'],
                location: { city: 'Test City' },
                priceRange: { min: 1000, max: 5000 },
                serviceCities: ['Test City'],
                blockedDates: [tomorrow.toISOString()]
            });
        } catch (e) { fail('Update Profile Failed', e); throw e; }

        // 4. Register Customer
        log('Creating Customer...');
        let customerReg;
        try {
            customerReg = await axios.post(`${API_URL}/auth/register`, customerUser);
        } catch (e) { fail('Customer Registration Failed', e); throw e; }

        const customerToken = customerReg.data.token;
        const customerClient = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${customerToken}` } });

        // 5. Create Event for Customer
        log('Creating Event...');
        let eventId;
        try {
            const eventRes = await customerClient.post('/events', {
                title: `Test Event ${suffix}`,
                date: { startDate: tomorrow.toISOString(), endDate: tomorrow.toISOString() },
                location: { city: 'Test City' },
                guestCount: 100,
                budget: { total: 50000 }
            });
            eventId = eventRes.data.data.event._id;
        } catch (e) { fail('Create Event Failed', e); throw e; }

        // 6. Attempt Booking on Blocked Date
        log('Attempting to book the blocked date (Expect Failure)...');
        try {
            const vProfileId = await getVendorProfileId(vendorClient);
            await customerClient.post('/bookings', {
                vendorId: vProfileId,
                eventId: eventId,
                serviceType: 'Photography',
                date: tomorrow.toISOString(),
                price: 2000
            });
            fail('Booking should have failed but Succeeded!');
        } catch (err) {
            if (err.response && err.response.status === 400 && err.response.data.message.includes('not available')) {
                success('Booking correctly rejected with "not available" message');
            } else {
                fail('Booking failed but with unexpected error', err);
            }
        }

        // 7. Attempt Booking on FREE Date (Day After Tomorrow)
        log('Attempting to book a free date (Expect Success)...');
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);

        try {
            const vProfileId = await getVendorProfileId(vendorClient);
            const res = await customerClient.post('/bookings', {
                vendorId: vProfileId,
                eventId: eventId,
                serviceType: 'Photography',
                date: dayAfter.toISOString(),
                price: 2000
            });
            if (res.status === 201) {
                success('Booking succeeded for free date');
            }
        } catch (err) {
            fail('Booking failed on free date', err);
        }

    } catch (err) {
        console.log('Aborting verification due to previous errors.');
    }
};

async function getVendorProfileId(client) {
    const res = await client.get('/vendors/profile');
    return res.data.data.profile._id;
}

runTest();
