//controllers/api/users.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // For sending emails

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    error: 'Too many login attempts',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  register: create,
  login,
  getProfile,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  getAllUsers,
  deleteUser,
  loginLimiter
};

async function create(req, res) {
  try {
    console.log('POST /api/users - Creating user:', {
      email: req.body.email,
      name: req.body.name
    });

    const user = await User.create(req.body);
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    console.log('User created successfully:', user._id);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('User creation error:', err.message);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        errors
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}

async function login(req, res) {
  try {
    console.log('POST /api/users/login - Login attempt:', req.body.email);

    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    console.log('Login successful:', user._id);
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}

async function getProfile(req, res) {
  try {
    console.log('GET /api/users/profile - Fetching profile:', req.user._id);
    
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}

async function refreshToken(req, res) {
  try {
    console.log('POST /api/users/refresh-token - Refreshing token');

    if (!req.body.refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(req.body.refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.user._id);
    if (!user || user.refreshToken !== req.body.refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    const accessToken = createAccessToken(user);

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (err) {
    console.error('Token refresh error:', err.message);
    if (err.name === '	JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}

async function requestPasswordReset(req, res) {
  try {
    console.log('POST /api/users/request-password-reset - Requesting password reset:', req.body.email);

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    // Store reset token hash and expiry in user document
    user.resetToken = resetTokenHash;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    // Send email with reset link (configure nodemailer)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', user.email);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (err) {
    console.error('Password reset request error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}

async function resetPassword(req, res) {
  try {
    console.log('POST /api/users/reset-password - Resetting password:', req.body.email);

    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, token, and new password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify reset token
    if (!user.resetToken || !user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    const isTokenValid = await bcrypt.compare(token, user.resetToken);
    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    console.log('Password reset successful:', user._id);
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    console.error('Password reset error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}

async function updateProfile(req, res) {
  // TODO: Implement updateProfile
  res.status(501).json({
    success: false,
    error: 'Not implemented'
  });
}

async function getAllUsers(req, res) {
  // TODO: Implement getAllUsers
  res.status(501).json({
    success: false,
    error: 'Not implemented'
  });
}

async function deleteUser(req, res) {
  // TODO: Implement deleteUser
  res.status(501).json({
    success: false,
    error: 'Not implemented'
  });
}

/* Helper Functions */

function createAccessToken(user) {
  return jwt.sign(
    {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      user: {
        _id: user._id,
        email: user.email
      }
    },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}