const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('./models/Event');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const res = await Event.updateMany({}, { status: 'completed' });
        console.log(`Updated ${res.modifiedCount} events to completed.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
