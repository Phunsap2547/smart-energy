
const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'ไม่พบ token กรุณา login ก่อน' });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'token ไม่ถูกต้องหรือหมดอายุ กรุณา login ใหม่' });
  }
}

module.exports = authenticateAdmin;