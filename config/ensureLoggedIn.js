// config/ensureLoggedIn.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Check for token in multiple locations
  const token = req.get('Authorization')?.replace('Bearer ', '') || 
                req.cookies?.accessToken || 
                req.query.token;

  if (!token) {
    return res.status(401).json({ 
      success: false,
      msg: 'Authentication required',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token using JWT_SECRET from environment
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify token has required claims
    if (!payload.user || !payload.exp) {
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token structure',
        code: 'INVALID_TOKEN'
      });
    }

    // Check if token is about to expire (optional)
    const now = Date.now() / 1000;
    if (payload.exp - now < 300) { // 5 minutes remaining
      req.tokenNeedsRefresh = true;
    }

    // Attach user and token info to request
    req.user = payload.user;
    req.tokenExpiresAt = new Date(payload.exp * 1000);
    
    return next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    
    let errorMsg = 'Invalid token';
    let code = 'INVALID_TOKEN';
    
    if (err.name === 'TokenExpiredError') {
      errorMsg = 'Token expired';
      code = 'TOKEN_EXPIRED';
    } else if (err.name === 'JsonWebTokenError') {
      errorMsg = 'Invalid token format';
    }

    return res.status(401).json({ 
      success: false,
      msg: errorMsg,
      code: code,
      shouldRefresh: err.name === 'TokenExpiredError'
    });
  }
};