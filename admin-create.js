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

async function enforceAdmin() {
  const email = 'admin@123.com';
  console.log(`Checking if ${email} exists...`);
  
  const { data: listRes } = await supabaseAdmin.auth.admin.listUsers();
  let user = listRes?.users.find(u => u.email === email);

  if (user) {
    console.log("User found in auth. Deleting to start fresh...");
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  }
  
  console.log("Cleaning public.users just in case...");
  await supabaseAdmin.from('users').delete().eq('email', email);

  console.log("Creating pristine admin account...");
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'admin123',
    email_confirm: true,
    user_metadata: { name: 'Master Admin', roll_number: `MASTER-${Date.now()}` }
  });

  if (createErr) {
    console.error("Create failed:", createErr.message);
    return;
  }
  console.log("Created in Auth successfully! ID:", created.user.id);

  console.log("Upgrading to admin...");
  const { error: upsertErr } = await supabaseAdmin.from('users').upsert({
    id: created.user.id,
    name: 'Master Admin',
    roll_number: `MASTER-${Date.now()}`,
    role: 'admin',
    needs_reset: false
  });

  if (upsertErr) console.error("Upsert failed:", upsertErr.message);
  else console.log("Database perfectly synced! Login ready.");
}

enforceAdmin();
