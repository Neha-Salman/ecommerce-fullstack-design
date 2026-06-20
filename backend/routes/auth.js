import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

// Helper to check MongoDB connection status
const isConnected = () => mongoose.connection.readyState === 1;

// In-Memory mock users fallback array (seeded with default admin and user)
let mockUsers = [
  {
    id: "mock_admin_123",
    name: "Admin User",
    email: "admin@ecommerce.com",
    // Hashed value of 'admin123'
    password: bcrypt.hashSync("admin123", 10),
    role: "admin"
  },
  {
    id: "mock_user_123",
    name: "John Doe",
    email: "user@ecommerce.com",
    // Hashed value of 'user123'
    password: bcrypt.hashSync("user123", 10),
    role: "user"
  }
];

// Helper to sign JWT token
const signToken = (user) => {
  const payload = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret_123',
    { expiresIn: '24h' }
  );
};

// 1. POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'user';

    if (isConnected()) {
      // MongoDB check
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: assignedRole
      });

      await newUser.save();
      const token = signToken(newUser);

      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } else {
      // In-Memory fallback check
      const existingUser = mockUsers.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = {
        id: "mock_u_" + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: assignedRole
      };

      mockUsers.push(newUser);
      const token = signToken(newUser);

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// 2. POST /api/auth/login - Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (isConnected()) {
      // MongoDB login
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user);
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // In-Memory fallback login
      const user = mockUsers.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user);
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

export { mockUsers };
export default router;
