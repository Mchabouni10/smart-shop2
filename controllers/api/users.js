//controllers/api/users.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const validator = require('validator');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes'
});

module.exports = {
  create,
  login,
  getProfile,
  refreshToken,
  loginLimiter
};

async function create(req, res) {
  try {
    // Input validation
    const { email, password, name } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({ 
        msg: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' 
      });
    }
    if (!name || !validator.isLength(name, { min: 2, max: 50 })) {
      return res.status(400).json({ msg: 'Name must be between 2 and 50 characters' });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      ...req.body,
      email: validator.normalizeEmail(email)
    });

    // Create tokens
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ accessToken, refreshToken });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    if (!password) {
      return res.status(400).json({ msg: 'Password is required' });
    }

    // Find user
    const user = await User.findOne({ email: validator.normalizeEmail(email) });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Create tokens
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ accessToken, refreshToken });
  } catch (e) {
    res.status(400).json({ msg: 'Login failed', reason: e.message });
  }
}

async function getProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ msg: 'Failed to fetch profile', reason: e.message });
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ msg: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.user._id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = createAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (e) {
    res.status(401).json({ msg: 'Invalid refresh token', reason: e.message });
  }
}

/* Helper Functions */

function createAccessToken(user) {
  return jwt.sign(
    { user: { _id: user._id, email: user.email } },
    process.env.SECRET,
    { expiresIn: '15m' } // Shorter-lived access token
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { user: { _id: user._id, email: user.email } },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  );
}

function isStrongPassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
}