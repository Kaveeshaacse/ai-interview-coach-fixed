// Creates an admin/staff account. There's no public sign-up page for admins
// on purpose — only someone with server access can create one.
//
// Save this file INSIDE interview-coach-ai-main/backend/ and run from there:
//   node create-admin.mjs "Your Name" you@example.com yourpassword admin
// (last arg is role: "admin" or "staff" — defaults to "admin")

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const [,, name, email, password, role = 'admin'] = process.argv;
if (!name || !email || !password) {
  console.error('Usage: node create-admin.mjs "Your Name" you@example.com yourpassword [admin|staff]');
  process.exit(1);
}
if (password.length < 6) {
  console.error('Password must be at least 6 characters.');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: existing } = await sb.from('admin_users').select('id').eq('email', email.toLowerCase().trim()).single();
if (existing) {
  console.log(`An admin account with ${email} already exists — nothing to do.`);
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 10);
const { data, error } = await sb.from('admin_users').insert({
  email: email.toLowerCase().trim(),
  password_hash: passwordHash,
  name: name.trim(),
  role: role === 'staff' ? 'staff' : 'admin',
}).select().single();

if (error) { console.error('Failed to create admin:', error.message); process.exit(1); }
console.log(`Created ${data.role} account for ${data.name} <${data.email}>. You can log in at the staff portal now.`);
