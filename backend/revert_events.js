const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('./models/Event');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const res = await Event.updateMany({ status: 'completed' }, { status: 'planning' });
        console.log(`Reverted ${res.modifiedCount} events to planning.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
