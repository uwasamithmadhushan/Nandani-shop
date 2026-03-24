import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

function userResponse(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || '',
    createdAt: user.createdAt,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name = '' } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: hash,
      name: typeof name === 'string' ? name.trim() : '',
    });

    const token = signToken(user._id.toString());
    res.status(201).json({ user: userResponse(user), token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id.toString());
    res.json({ user: userResponse(user), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load profile' });
  }
});

export default router;
