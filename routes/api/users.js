//routes/api/users.js
const express = require('express');
const router = express.Router();
const usersCtrl = require('../../controllers/api/users');
const { ensureLoggedIn, ensureRole } = require('../../config/authMiddleware');
const rateLimit = require('express-rate-limit');
const validate = require('../../middleware/validation');

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

// Input validation schemas
const { 
  registerSchema, 
  loginSchema,
  refreshTokenSchema
} = require('../../validation/userSchemas');

// Public routes
router.post(
  '/register',
  validate(registerSchema),
  usersCtrl.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  usersCtrl.login
);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  usersCtrl.refreshToken
);

// Protected routes
router.get(
  '/profile',
  ensureLoggedIn,
  usersCtrl.getProfile
);

router.patch(
  '/profile',
  ensureLoggedIn,
  validate(updateProfileSchema),
  usersCtrl.updateProfile
);

// Admin-only routes
router.get(
  '/',
  ensureLoggedIn,
  ensureRole('admin'),
  usersCtrl.getAllUsers
);

router.delete(
  '/:id',
  ensureLoggedIn,
  ensureRole('admin'),
  usersCtrl.deleteUser
);

module.exports = router;