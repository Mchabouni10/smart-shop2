// config/checkToken.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Check for token in Authorization header, cookies, or query string
  let token = req.get('Authorization') || req.cookies?.accessToken || req.query.token;
  
  if (!token) {
    req.user = null;
    req.exp = null;
    return next();
  }

  // Remove Bearer prefix if present
  token = token.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    
    // Add token information to request
    req.user = decoded.user;
    req.exp = new Date(decoded.exp * 1000);
    req.token = token;
    
    // Calculate remaining token lifetime
    const now = new Date();
    req.tokenExpiresIn = Math.floor((req.exp - now) / 1000);
    
    return next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      req.tokenExpired = true;
      req.exp = new Date(err.expiredAt);
    } else if (err.name === 'JsonWebTokenError') {
      req.tokenInvalid = true;
    }
    
    req.user = null;
    return next();
  }
};