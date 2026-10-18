require('dotenv').config();
const bcrypt = require('bcrypt');
const supabase = require('../supabase');

async function resetAdmin() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.log('วิธีใช้: node src/scripts/resetAdmin.js <username> <password>');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('admins')
    .update({ password_hash })
    .eq('username', username)
    .select('id, username');

  if (error) {
    console.error('เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.error(`ไม่พบ admin "${username}" ใน Supabase`);
    process.exit(1);
  }
  console.log(`รีเซ็ตรหัสผ่านของ "${username}" สำเร็จ`);
}

resetAdmin();