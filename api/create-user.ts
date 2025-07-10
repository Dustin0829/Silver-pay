import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Create user in Supabase Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError || !userData?.user) {
    return res.status(400).json({ error: userError?.message || 'Failed to create user in Auth' });
  }

  // 2. Insert into users table
  const { error: dbError } = await supabase
    .from('users')
    .insert([{ id: userData.user.id, name, email, role }]);

  if (dbError) {
    // Optionally: delete the Auth user if DB insert fails
    await supabase.auth.admin.deleteUser(userData.user.id);
    return res.status(400).json({ error: dbError.message });
  }

  return res.status(200).json({ success: true });
} 