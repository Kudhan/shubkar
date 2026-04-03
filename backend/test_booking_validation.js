const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('./models/Event');
const bookingController = require('./controllers/bookingController');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Find a completed event
        const event = await Event.findOne({ status: 'completed' });
        if (!event) {
            console.error('No completed event found to test with.');
            process.exit(1);
        }

        console.log(`Testing with completed event: ${event._id} (${event.title})`);

        const req = {
            user: { id: event.customer.toString() },
            body: {
                eventId: event._id.toString(),
                vendorId: '69428670743b179261fc4b38', // Dummy vendor ID
                date: new Date(),
                serviceType: 'Test'
            }
        };

        const res = {
            status: function(code) {
                console.log(`HTTP Status: ${code}`);
                return this;
            },
            json: function(data) {
                console.log('Response:', JSON.stringify(data, null, 2));
            }
        };

        await bookingController.createBooking(req, res);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
