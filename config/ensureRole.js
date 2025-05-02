//config/ensureRole.js
module.exports = function(requiredRole) {
    return function(req, res, next) {
      // First ensure user is logged in (should come after ensureLoggedIn middleware)
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          msg: 'Authentication required',
          code: 'NO_USER'
        });
      }
  
      // Check if user has the required role
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ 
          success: false,
          msg: `Unauthorized - Requires ${requiredRole} role`,
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRole,
          userRole: req.user.role
        });
      }
  
      // User has required role, proceed
      next();
    };
  };