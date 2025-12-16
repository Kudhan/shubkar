const axios = require('axios');
const { exit } = require('process');

const API_URL = 'http://localhost:5000/api';
let AUTH_TOKEN = '';
let USER_ID = '';
let VENDOR_ID = '';
let EVENT_ID = '';
let BOOKING_ID = '';

const log = console.log;
const success = (msg) => log(`✔ ${msg}`);
const fail = (msg, err) => {
    log(`✘ ${msg}`);
    if (err && err.response) {
        console.log(`  Status: ${err.response.status}`);
        // console.log(`  Data: ${JSON.stringify(err.response.data)}`); // less verbosity
    } else if (err) {
        console.log(`  Error: ${err.message}`);
    }
};

const runTests = async () => {
    log('\n🚀 Starting SHUBAKAR API Verification...\n');

    // 1. HEALTH CHECK
    try {
        log('\n1. Testing Connection...');
        // We don't have a dedicated health route, but let's try a public route
        await axios.get(`${API_URL}/vendors/search`);
        success('Server is reachable');
    } catch (error) {
        fail('Server is not running or unreachable', error);
        exit(1);
    }

    // 2. AUTHENTICATION
    log('\n2. Testing Authentication...');
    const testUser = {
        name: 'Test Verify User',
        email: `verify_${Date.now()}@test.com`,
        password: 'password123'
    };

    try {
        // Register
        const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
        if (regRes.status === 201 || regRes.status === 200) {
            success('Register User');
            AUTH_TOKEN = regRes.data.token;
            USER_ID = regRes.data.data.user._id;
        }
    } catch (e) { fail('Register User', e); }

    try {
        // Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email: testUser.email, password: testUser.password });
        if (loginRes.data.token) {
            success('Login User');
            AUTH_TOKEN = loginRes.data.token; // Update token
        }
    } catch (e) { fail('Login User', e); }

    // Setup Axios Auth Header
    const authClient = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });

    // 3. VENDOR SYSTEM
    log('\n3. Testing Vendor System...');
    try {
        // Search Vendors (Public)
        const searchRes = await axios.get(`${API_URL}/vendors/search`);
        success(`Search Vendors (Found ${searchRes.data.data.vendors.length})`);

        if (searchRes.data.data.vendors.length > 0) {
            VENDOR_ID = searchRes.data.data.vendors[0]._id;
        } else {
            console.log('  ⚠ No vendors found to test booking. Skipping booking tests.');
        }
    } catch (e) { fail('Search Vendors', e); }

    // 4. BOOKING SYSTEM
    if (VENDOR_ID && USER_ID) {
        log('\n4. Testing Booking System...');

        const bookingPayload = {
            vendorId: VENDOR_ID,
            eventId: USER_ID, // Hack for field requirement
            serviceType: 'Test Service',
            date: new Date().toISOString(),
            price: 5000,
            notes: 'Automated verification booking'
        };

        try {
            const bookRes = await authClient.post('/bookings', bookingPayload);
            success('Create Booking');
            BOOKING_ID = bookRes.data.data.booking._id;
        } catch (e) {
            fail('Create Booking', e);
        }

        if (BOOKING_ID) {
            try {
                const myBookings = await authClient.get('/bookings');
                success(`Get My Bookings (Found ${myBookings.data.data.bookings.length})`);
            } catch (e) { fail('Get My Bookings', e); }
        }
    }

    // 5. CHAT SYSTEM
    if (BOOKING_ID) {
        log('\n5. Testing Chat System...');
        try {
            const chatRes = await authClient.get(`/chat/${BOOKING_ID}`);
            success('Get Chat History');
        } catch (e) { fail('Get Chat History', e); }
    }

    log('\n✨ Verification Complete!\n');
    exit(0);
};

runTests();
