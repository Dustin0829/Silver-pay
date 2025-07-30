import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dywstsoqrnqyihlntndl.supabase.co'; // Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5d3N0c29xcm5xeWlobG50bmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjczODcsImV4cCI6MjA2NzEwMzM4N30.XVMSVIxodNJqYU_Fcql9xmo3DHU1ZhHvI9KhuVcLaFU'; // Replace with your Supabase anon/public key

// You'll need to add your service role key here for admin operations
// const supabaseServiceKey = 'your-service-role-key-here'; // Get this from Supabase Dashboard → Settings → API

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For admin operations (createUser, etc.) - uncomment when you have the service key
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey); 