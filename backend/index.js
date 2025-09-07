require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);
const io = socketIo(server, {
    cors: {
        origin: '*', //  Allow all origins (change this in production)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
});

app.use(cors());

const userRoutes = require('./routes/r_user');
const productRoutes = require('./routes/r_product');
const orderRoutes = require('./routes/r_order');
const paymentRoutes = require('./routes/r_payment');
const { handleRazorpayWebhook } = require('./routes/r_payment');
const categoryRoutes = require('./routes/r_category');

// Middleware
// Razorpay webhook requires raw body for signature verification. Must be BEFORE json middleware.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Placeholder for routes
app.get('/', (req, res) => {
    res.send('Flash Deal Marketplace Backend is running!');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', categoryRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


