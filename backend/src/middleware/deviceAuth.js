// // backend/src/middleware/deviceAuth.js
// const authenticateDevice = (req, res, next) => {
//   const apiKey = req.headers['x-api-key'];
//   if (!apiKey || apiKey !== process.env.DEVICE_API_KEY) {
//     return res.status(401).json({ message: 'API key ไม่ถูกต้อง' });
//   }
//   next();
// };

// module.exports = authenticateDevice;


// backend/src/middleware/deviceAuth.js
// เวอร์ชัน debug ชั่วคราว — ใส่ console.log ไว้ดูว่าค่าที่เทียบกันคืออะไร
// เอาออกทีหลังเมื่อแก้ปัญหาเสร็จแล้ว

const authenticateDevice = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] ? req.headers['x-api-key'].trim() : null;
  const expectedApiKey = process.env.DEVICE_API_KEY ? process.env.DEVICE_API_KEY.trim() : null;

  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({ message: 'API key ไม่ถูกต้อง' });
  }
  next();
};

module.exports = authenticateDevice;