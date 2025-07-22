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

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    }

    const { email } = body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // 1. Find user id by email
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (findError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    if (authError) {
      return res.status(400).json({ error: 'Failed to delete user from Auth', details: authError.message });
    }

    // 3. Delete from users table
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);
    if (dbError) {
      return res.status(400).json({ error: 'Failed to delete user from DB', details: dbError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err?.message || err });
  }
} 