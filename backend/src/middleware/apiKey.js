function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.INGEST_API_KEY) {
    return res.status(401).json({ message: 'API key ไม่ถูกต้อง' });
  }

  next();
}

module.exports = verifyApiKey;
