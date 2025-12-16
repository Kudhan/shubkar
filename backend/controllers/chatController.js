const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const messages = await Message.find({ booking: bookingId })
            .populate('sender', 'name')
            .sort('createdAt');

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: { messages }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
