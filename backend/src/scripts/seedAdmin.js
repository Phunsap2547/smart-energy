
// backend/src/scripts/seedAdmin.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const supabase = require('../supabase');

async function seedAdmin() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.log('วิธีใช้: npm run seed:admin -- <username> <password>');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { error } = await supabase
    .from('admins')
    .insert([{ username, password_hash }]);

  if (error) {
    console.error('เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  }
  console.log(`สร้าง admin "${username}" สำเร็จ`);
}

seedAdmin();