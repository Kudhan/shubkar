const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Message = require('./models/Message');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('SHUBAKAR Backend is Running');
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shubakar';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
  });

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a chat room (Booking ID)
  socket.on('join_room', (bookingId) => {
    socket.join(bookingId);
    console.log(`User ${socket.id} joined room: ${bookingId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    // data: { bookingId, senderId, content }
    const { bookingId, senderId, content } = data;

    // Save to DB
    try {
      const newMessage = await Message.create({
        booking: bookingId,
        sender: senderId,
        content: content
      });

      const populatedMessage = await newMessage.populate('sender', 'name');

      // Emit to room
      io.in(bookingId).emit('receive_message', populatedMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
