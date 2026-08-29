const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // รูปแบบ: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'ไม่พบ token กรุณา login ก่อน' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'token ไม่ถูกต้องหรือหมดอายุ กรุณา login ใหม่' });
    }
    req.admin = decoded; // แนบข้อมูล admin ไว้ใน request ให้ route ถัดไปใช้ได้
    next();
  });
}

module.exports = authenticateAdmin;
