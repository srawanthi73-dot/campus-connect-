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

async function check() {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', 'admin@123.com');
  console.log("public.users with admin@123.com:", data);
  
  const { data: auth, err } = await supabaseAdmin.auth.admin.listUsers();
  const u = auth?.users.find(u => u.email === 'admin@123.com');
  console.log("auth.users with admin@123.com:", u ? "Found" : "Not Found");
  
  if (u && !data?.length) {
    console.log("User exists in auth but NOT in public! Trying to delete from auth so it can be re-created...");
    await supabaseAdmin.auth.admin.deleteUser(u.id);
    console.log("Deleted from auth.");
  }
}
check();
