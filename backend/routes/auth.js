import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbAdapter } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'travexa_sih_secret_key_2026';

// Register Router
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'All registration parameters are required.' });
  }

  // Strong password length check
  if (password.length < 6) {
    return res.status(400).json({ message: 'Security Policy: Password must be at least 6 characters.' });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Security Policy: Invalid email address format.' });
  }

  try {
    const existingUser = await dbAdapter.findOne('users', { username });
    const existingEmail = await dbAdapter.findOne('users', { email });
    if (existingUser || existingEmail) {
      return res.status(400).json({ message: 'Username or Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await dbAdapter.create('users', {
      username,
      email,
      password: hashedPassword,
      role: role.toUpperCase()
    });

    // Sign Token
    const token = jwt.sign({ id: user._id || user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Router
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Look up by username first, then fallback to email address matching
    let user = await dbAdapter.findOne('users', { username });
    if (!user) {
      user = await dbAdapter.findOne('users', { email: username });
    }

    if (!user) {
      return res.status(401).json({ message: 'Incorrect credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect credentials' });
    }

    // Sign Token
    const token = jwt.sign({ id: user._id || user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auth Middleware dependency helper
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Token missing' });
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token invalid or expired' });
    req.user = decoded;
    next();
  });
};

// Role-based Access Control (Section 18)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
    }
    next();
  };
};

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbAdapter.findOne('users', { username: req.user.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ username: user.username, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
