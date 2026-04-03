const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('./models/Event');

dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const events = await Event.find({});
        console.log('--- EVENTS START ---');
        events.forEach(e => {
            console.log(JSON.stringify({ id: e._id, title: e.title, status: e.status }));
        });
        console.log('--- EVENTS END ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
