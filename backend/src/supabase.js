// lib/supabase-admin.js  (SERVER-ONLY — never import from a "use client" file)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY // secret key — service role, bypasses RLS
);

module.exports = supabase;