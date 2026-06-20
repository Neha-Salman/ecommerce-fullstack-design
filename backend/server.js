import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import productRouter, { sampleProducts } from './routes/products.js';
import authRouter from './routes/auth.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS with allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174"
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins
}));

const allowedOrigin = allowedOrigins.join(', ');

app.use(express.json());

// Mount routes
app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);

// Backend Status Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: "ok",
    backend: "Express.js",
    database: mongoose.connection.readyState === 1 ? "Connected (MongoDB)" : "Fallback (In-Memory Array)",
    port: PORT,
    clientUrl: allowedOrigin
  });
});

// Default landing route for GET /
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ecommerce API Backend</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 40px;
            background: #EFF2F4;
            color: #1C1C1C;
            text-align: center;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .container {
            max-width: 500px;
            width: 100%;
            background: white;
            padding: 40px 30px;
            border-radius: 8px;
            border: 1px solid #DEE2E7;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          h1 {
            color: #0D6EFD;
            margin-top: 0;
            font-size: 24px;
          }
          p {
            color: #505050;
            line-height: 1.6;
          }
          a {
            color: #0D6EFD;
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            text-decoration: underline;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 14px;
            background: #E2F0D9;
            color: #385723;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 15px 0;
            border: 1px solid #C5E0B4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Ecommerce API Server</h1>
          <p>The Express.js backend server is running successfully in dual-mode (In-Memory Array fallback / MongoDB integration).</p>
          <div class="status-badge">🟢 Status: Active</div>
          <p style="margin-top: 20px; font-size: 14px;">
            To view system details, check the <a href="/api/status">/api/status</a> health endpoint.
          </p>
        </div>
      </body>
    </html>
  `);
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
console.log(`Connecting to MongoDB at: ${mongoUri}...`);

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB successfully!');
    
    // 1. Seed initial products if database is empty
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('Seeding database with 15 initial products...');
        await Product.insertMany(sampleProducts);
        console.log('Database seeded successfully!');
      } else {
        console.log(`Database already contains ${count} products.`);
      }
    } catch (err) {
      console.error('Error verifying/seeding products database:', err.message);
    }

    // 2. Seed default admin if no admin exists in database
    try {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        console.log('Seeding database with default admin user (admin@ecommerce.com)...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const defaultAdmin = new User({
          name: 'Admin User',
          email: 'admin@ecommerce.com',
          password: adminPassword,
          role: 'admin'
        });
        await defaultAdmin.save();
        console.log('Default admin seeded successfully!');
      } else {
        console.log('Admin account already exists in database.');
      }
    } catch (err) {
      console.error('Error verifying/seeding admin user database:', err.message);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.warn('\n======================================================');
    console.warn('WARNING: Local MongoDB service is not running or accessible!');
    console.warn('Express server will run in dual-mode (In-Memory Array fallback).');
    console.warn('All auth endpoints and product mutating endpoints remain active.');
    console.warn('======================================================\n');
  });

// Start Express server
app.listen(PORT, () => {
  console.log(`[Backend] Express.js server running on http://localhost:${PORT}`);
});
