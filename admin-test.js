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

async function testCreate() {
  const email = `testadmin${Date.now()}@campus.com`;
  console.log(`Trying to create user: ${email}...`);
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { name: 'Test', roll_number: `T-${Date.now()}` }
  });
  
  if (error) {
    console.error("Failed!", error.message);
  } else {
    console.log("Success! trigger works fine. User ID:", data.user.id);
  }
}
testCreate();
