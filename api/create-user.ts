import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse JSON body if needed
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    }

    // Debug log: print the request body
    console.log('DEBUG: Received body:', JSON.stringify(body));

    const { name, email, password, role, bank_codes } = body;

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

    // Debug log: print the insert payload
    console.log('DEBUG: Inserting into users:', JSON.stringify({ id: userData.user.id, name, email, role, bank_codes }));

    // 2. Insert into users table
    const { error: dbError, data: dbData } = await supabase
      .from('users')
      .insert([{ id: userData.user.id, name, email, role, bank_codes }])
      .select();

    // Debug log: print the result of the insert
    console.log('DEBUG: Insert result:', JSON.stringify({ dbError, dbData }));

    if (dbError) {
      // Optionally: delete the Auth user if DB insert fails
      await supabase.auth.admin.deleteUser(userData.user.id);
      return res.status(400).json({ error: dbError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err?.message || err });
  }
}