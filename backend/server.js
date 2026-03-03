const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Production Console Clean Up
if (process.env.NODE_ENV === 'production') {
    console.log = function () {};
    console.debug = function () {};
    // Keep console.error for critical crash logs in Render
}

const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const aiRoutes = require('./routes/aiRoutes');
const Message = require('./models/Message');

const app = express();
const httpServer = createServer(app);

// Cross-Origin Resource Sharing (CORS) Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://shubkar.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Middleware - Security & Performance
app.use(helmet());
app.use(compression());

// Strict Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Body size limit

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/service-plans', require('./routes/servicePlanRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));


app.get('/', (req, res) => {
  res.send('SHUBAKAR Backend is Running in ' + (process.env.NODE_ENV || 'development') + ' mode');
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/shubakar';

const connectDB = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
      try {
        await mongoose.connect(MONGO_URI);
        // Important: Re-enabling explicit console for this crucial boot log
        process.stdout.write(`MongoDB Connected successfully to ${MONGO_URI.split('@').pop().split('/')[0]}\n`);
        return true;
      } catch (err) {
        retries -= 1;
        process.stderr.write(`MongoDB Connection Error. Retries left: ${retries}\nError details: ${err.message}\n`);
        if (retries === 0) {
            process.stderr.write("MongoDB failed to connect completely. Exiting Node process.\n");
            process.exit(1);
        }
        await new Promise(res => setTimeout(res, delay));
      }
    }
};

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        process.stdout.write(`Server running on port ${PORT}\n`);
    });
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
