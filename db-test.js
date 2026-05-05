import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', url);
console.log('KEY:', key ? key.substring(0, 15) + '...' : 'undefined');

const supabase = createClient(url, key);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error('Connection failed:', error);
    } else {
      console.log('Connection successful. Data:', data);
    }
  } catch (err) {
    console.error('Error during connection test:', err);
  }
}

testConnection();
