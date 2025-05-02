//controllers/api/users.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const validator = require('validator');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
});

module.exports = {
  create,
  login,
  getProfile,
  refreshToken,
  loginLimiter,
};

async function create(req, res) {
  try {
    console.log('POST /api/users - Received request:', {
      body: { ...req.body, password: '[REDACTED]' },
      ip: req.ip,
      headers: req.headers,
    });

    // Input validation
    const { email, password, name } = req.body;
    console.log('Validating input:', { email, name, password: password ? '[REDACTED]' : undefined });

    if (!email) {
      console.log('Validation failed: Email is missing');
      return res.status(400).json({ msg: 'Email is required' });
    }
    if (!validator.isEmail(email)) {
      console.log('Validation failed: Invalid email format', { email });
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    if (!password) {
      console.log('Validation failed: Password is missing');
      return res.status(400).json({ msg: 'Password is required' });
    }
    if (!isStrongPassword(password)) {
      console.log('Validation failed: Weak password', { passwordLength: password.length });
      return res.status(400).json({
        msg: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
      });
    }
    if (!name) {
      console.log('Validation failed: Name is missing');
      return res.status(400).json({ msg: 'Name is required' });
    }
    if (!validator.isLength(name, { min: 2, max: 50 })) {
      console.log('Validation failed: Invalid name length', { name, length: name.length });
      return res.status(400).json({ msg: 'Name must be between 2 and 50 characters' });
    }

    // Normalize email
    const normalizedEmail = validator.normalizeEmail(email);
    console.log('Normalized email:', { original: email, normalized: normalizedEmail });

    // Check if email exists
    console.log('Checking for existing user with email:', normalizedEmail);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('User already exists:', { userId: existingUser._id, email: normalizedEmail });
      return res.status(400).json({ msg: 'Email already registered' });
    }
    console.log('No existing user found for email:', normalizedEmail);

    // Create user
    console.log('Creating new user:', { name, email: normalizedEmail });
    const user = await User.create({
      name,
      email: normalizedEmail,
      password, // Password will be hashed by userSchema.pre('save')
    });
    console.log('User created successfully:', { userId: user._id, email: user.email });

    // Create tokens
    console.log('Generating tokens for user:', { userId: user._id });
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    console.log('Tokens generated:', {
      accessToken: accessToken ? '[REDACTED]' : undefined,
      refreshToken: refreshToken ? '[REDACTED]' : undefined,
    });

    // Store refresh token
    console.log('Updating user with refresh token:', { userId: user._id });
    user.refreshToken = refreshToken;
    await user.save();
    console.log('Refresh token stored:', { userId: user._id });

    // Send response
    console.log('Sending successful response:', { userId: user._id, email: user.email });
    res.status(200).json({ accessToken, refreshToken });
  } catch (e) {
    console.error('Error in create user:', {
      error: e.message,
      stack: e.stack,
      requestBody: { ...req.body, password: '[REDACTED]' },
    });
    res.status(400).json({ msg: 'Failed to create user', reason: e.message || 'Unknown error' });
  }
}

async function login(req, res) {
  try {
    console.log('POST /api/users/login - Received request:', {
      body: { ...req.body, password: '[REDACTED]' },
      ip: req.ip,
      headers: req.headers,
    });

    // Input validation
    const { email, password } = req.body;
    console.log('Validating input:', { email, password: password ? '[REDACTED]' : undefined });

    if (!email) {
      console.log('Validation failed: Email is missing');
      return res.status(400).json({ msg: 'Email is required' });
    }
    if (!validator.isEmail(email)) {
      console.log('Validation failed: Invalid email format', { email });
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    if (!password) {
      console.log('Validation failed: Password is missing');
      return res.status(400).json({ msg: 'Password is required' });
    }
    console.log('Input validation passed:', { email });

    // Normalize email
    const normalizedEmail = validator.normalizeEmail(email);
    console.log('Normalized email:', { original: email, normalized: normalizedEmail });

    // Find user
    console.log('Searching for user with email:', normalizedEmail);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('User not found:', { email: normalizedEmail });
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
    console.log('User found:', { userId: user._id, email: user.email });

    // Check password
    console.log('Comparing password for user:', { userId: user._id });
    const match = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', { userId: user._id, match });
    if (!match) {
      console.log('Password mismatch for user:', { userId: user._id });
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
    console.log('Password verified for user:', { userId: user._id });

    // Create tokens
    console.log('Generating tokens for user:', { userId: user._id });
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    console.log('Tokens generated:', {
      accessToken: accessToken ? '[REDACTED]' : undefined,
      refreshToken: refreshToken ? '[REDACTED]' : undefined,
    });

    // Store refresh token
    console.log('Updating user with refresh token:', { userId: user._id });
    user.refreshToken = refreshToken;
    await user.save();
    console.log('Refresh token stored:', { userId: user._id });

    // Send response
    console.log('Sending successful response:', { userId: user._id, email: user.email });
    res.status(200).json({ accessToken, refreshToken });
  } catch (e) {
    console.error('Error in login:', {
      error: e.message,
      stack: e.stack,
      requestBody: { ...req.body, password: '[REDACTED]' },
    });
    res.status(400).json({ msg: 'Login failed', reason: e.message || 'Unknown error' });
  }
}

async function getProfile(req, res) {
  try {
    console.log('GET /api/users/profile - Received request:', {
      user: req.user,
      ip: req.ip,
      headers: req.headers,
    });

    if (!req.user) {
      console.log('No authenticated user found');
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    console.log('Fetching profile for user:', { userId: req.user._id });

    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
      console.log('User not found in database:', { userId: req.user._id });
      return res.status(404).json({ msg: 'User not found' });
    }
    console.log('User profile retrieved:', { userId: user._id, email: user.email });

    res.status(200).json(user);
  } catch (e) {
    console.error('Error in getProfile:', {
      error: e.message,
      stack: e.stack,
      userId: req.user?._id,
    });
    res.status(400).json({ msg: 'Failed to fetch profile', reason: e.message || 'Unknown error' });
  }
}

async function refreshToken(req, res) {
  try {
    console.log('POST /api/users/refresh-token - Received request:', {
      body: { ...req.body, refreshToken: '[REDACTED]' },
      ip: req.ip,
      headers: req.headers,
    });

    const { refreshToken } = req.body;
    console.log('Validating refresh token:', { refreshToken: refreshToken ? '[REDACTED]' : undefined });

    if (!refreshToken) {
      console.log('No refresh token provided');
      return res.status(401).json({ msg: 'Refresh token required' });
    }

    // Verify refresh token
    console.log('Verifying refresh token');
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    console.log('Refresh token decoded:', { userId: decoded.user._id, email: decoded.user.email });

    // Find user
    console.log('Searching for user:', { userId: decoded.user._id });
    const user = await User.findById(decoded.user._id);
    if (!user) {
      console.log('User not found:', { userId: decoded.user._id });
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }
    console.log('User found:', { userId: user._id, email: user.email });

    // Validate refresh token
    console.log('Validating stored refresh token:', { userId: user._id });
    if (user.refreshToken !== refreshToken) {
      console.log('Refresh token mismatch:', { userId: user._id });
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }
    console.log('Refresh token validated:', { userId: user._id });

    // Generate new access token
    console.log('Generating new access token for user:', { userId: user._id });
    const accessToken = createAccessToken(user);
    console.log('New access token generated:', { accessToken: accessToken ? '[REDACTED]' : undefined });

    // Send response
    console.log('Sending successful response:', { userId: user._id, email: user.email });
    res.status(200).json({ accessToken });
  } catch (e) {
    console.error('Error in refreshToken:', {
      error: e.message,
      stack: e.stack,
      requestBody: { ...req.body, refreshToken: '[REDACTED]' },
    });
    res.status(401).json({ msg: 'Invalid refresh token', reason: e.message || 'Unknown error' });
  }
}

/* Helper Functions */

function createAccessToken(user) {
  try {
    console.log('Creating access token for user:', { userId: user._id, email: user.email });
    const token = jwt.sign(
      { user: { _id: user._id, email: user.email } },
      process.env.JWT_SECRET,  // Changed from SECRET to JWT_SECRET
      { expiresIn: '15m' }
    );
    console.log('Access token created:', { token: '[REDACTED]' });
    return token;
  } catch (e) {
    console.error('Error creating access token:', {
      error: e.message,
      stack: e.stack,
      userId: user._id,
    });
    throw e;
  }
}

function createRefreshToken(user) {
  try {
    console.log('Creating refresh token for user:', { userId: user._id, email: user.email });
    const token = jwt.sign(
      { user: { _id: user._id, email: user.email } },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Refresh token created:', { token: '[REDACTED]' });
    return token;
  } catch (e) {
    console.error('Error creating refresh token:', {
      error: e.message,
      stack: e.stack,
      userId: user._id,
    });
    throw e;
  }
}

function isStrongPassword(password) {
  if (!password) {
    console.log('Password validation failed: Password is undefined or null');
    return false;
  }
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  console.log('Password validation result:', {
    passwordLength: password.length,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    isValid,
  });
  return isValid;
}