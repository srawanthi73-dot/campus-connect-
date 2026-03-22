import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/['"]/g, '');
});

const supabaseAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixAdmin() {
  const adminEmail = 'admin@123.com';
  console.log("Fetching all users...");
  const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) { console.error("List users err:", listErr); return; }
  
  let user = users.users.find(u => u.email === adminEmail);

  if (!user) {
    console.log("Admin doesn't exist in Auth. Creating with random roll number...");
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: 'admin123',
      email_confirm: true,
      user_metadata: { name: 'Super Admin', roll_number: `ADM-${Date.now()}` }
    });
    if (createError) {
      console.error("Create error:", createError.message);
      return;
    }
    user = created.user;
  } else {
    console.log("Admin exists in Auth! Updating password...");
    await supabaseAdmin.auth.admin.updateUserById(user.id, { password: 'admin123' });
  }

  console.log("Ensuring public.users has this admin...");
  const { error: upsertError } = await supabaseAdmin.from('users').upsert({
    id: user.id,
    email: adminEmail,
    name: 'Super Admin',
    roll_number: `ADM-${user.id.substring(0,6)}`,
    role: 'admin',
    needs_reset: false
  });
  
  if (upsertError) {
    console.error("Upsert error:", upsertError.message);
  } else {
    console.log("Target Admin user setup successfully! You can login with admin@123 and admin123");
  }
}

fixAdmin();
