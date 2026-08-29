require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

async function seedAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.log('วิธีใช้: npm run seed:admin -- <username> <password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
      [username, hash]
    );
    console.log(`สร้าง admin "${username}" สำเร็จ`);
  } catch (err) {
    console.error('เกิดข้อผิดพลาด:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();
