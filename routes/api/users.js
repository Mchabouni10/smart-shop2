//routes/api/users.js

const express = require('express');
const router = express.Router();
const usersCtrl = require('../../controllers/api/users');
const ensureLoggedIn = require('../../config/ensureLoggedIn');

router.post('/', usersCtrl.create);
router.post('/login', usersCtrl.loginLimiter, usersCtrl.login);
router.get('/profile', ensureLoggedIn, usersCtrl.getProfile);
router.post('/refresh-token', usersCtrl.refreshToken);

module.exports = router;