//routes/api/users.js
const express = require('express');
const router = express.Router();
const usersCtrl = require('../../controllers/api/users');
const ensureLoggedIn = require('../../config/ensureLoggedIn');
const ensureRole = require('../../config/ensureRole');
const rateLimit = require('express-rate-limit');

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many attempts',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Public routes
router.post('/register', usersCtrl.register);
router.post('/login', authLimiter, usersCtrl.login);
router.post('/refresh-token', usersCtrl.refreshToken);

// Protected routes
router.get('/profile', ensureLoggedIn, usersCtrl.getProfile);
router.patch('/profile', ensureLoggedIn, usersCtrl.updateProfile);

// Admin routes
router.get('/', ensureLoggedIn, ensureRole('admin'), usersCtrl.getAllUsers);
router.delete('/:id', ensureLoggedIn, ensureRole('admin'), usersCtrl.deleteUser);

// Password reset
router.post('/request-password-reset', usersCtrl.requestPasswordReset);
router.post('/reset-password', usersCtrl.resetPassword);

module.exports = router;