// config/checkToken.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  let token = req.get('Authorization') || req.query.token;
  if (token) {
    token = token.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      req.user = decoded.user;
      req.exp = new Date(decoded.exp * 1000);
      return next();
    } catch (err) {
      req.user = null;
      req.exp = null;
      return next();
    }
  }
  req.user = null;
  req.exp = null;
  return next();
};