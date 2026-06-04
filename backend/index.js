const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const net = require('net'); // Added for network testing

// Load .env from the exact current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());

// Debug
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI is not defined. Check .env file.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined. Check .env file.');
  process.exit(1);
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/farm-activities', require('./routes/farmActivities'));
app.use('/api/soil-health', require('./routes/soilHealth'));
app.use('/api/support', require('./routes/support'));
app.use('/api/experts', require('./routes/experts'));

// --- START OF NETWORK DIAGNOSTIC LOG ---
const TEST_HOST = 'agritech-shard-00-00.2boyvfa.mongodb.net';
const TEST_PORT = 27017;

console.log(`\n🔍 Running deep network diagnostics to ${TEST_HOST}...`);

const client = new net.Socket();
client.setTimeout(5000);

client.connect(TEST_PORT, TEST_HOST, () => {
    console.log('🟢 NET DIAGNOSTIC: Success! Your raw network CAN reach MongoDB Atlas on port 27017.');
    client.end();
});

client.on('error', (err) => {
    console.error('❌ NET DIAGNOSTIC FAILED!');
    console.error(`👉 System Error Code: ${err.code}`);
    console.error(`👉 System Call: ${err.syscall}`);
    client.destroy();
});

client.on('timeout', () => {
    console.error('❌ NET DIAGNOSTIC FAILED: Connection timed out. Packets are being dropped.');
    client.destroy();
});
// --- END OF NETWORK DIAGNOSTIC LOG ---


// Mongoose Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => console.log(`🚀 Server running on port ${process.env.PORT || 5000}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));