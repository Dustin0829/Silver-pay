import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Supabase admin API missing env vars SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const { email, password, name, role, bank_codes } = req.body || {};
      if (!email || !password || !name || !role) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Create auth user without affecting client session
      const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role },
      });
      if (createErr) {
        res.status(400).json({ error: createErr.message });
        return;
      }

      const authUser = created.user;
      // Upsert profile by email
      const { data: profile, error: profileErr } = await adminClient
        .from('user_profiles')
        .upsert({
          user_id: authUser?.id || null,
          email,
          name,
          role,
          bank_codes: Array.isArray(bank_codes) ? bank_codes : [],
        }, { onConflict: 'email' })
        .select()
        .single();
      if (profileErr) {
        res.status(200).json({ user: authUser, profile: null, warning: profileErr.message });
        return;
      }

      res.status(200).json({ user: authUser, profile });
      return;
    }

    if (req.method === 'DELETE') {
      const { email, user_id } = (req.body || {}) as { email?: string; user_id?: string };
      if (!email && !user_id) {
        res.status(400).json({ error: 'email or user_id required' });
        return;
      }

      let resolvedUserId = user_id as string | undefined;
      if (!resolvedUserId && email) {
        const { data, error } = await adminClient
          .from('user_profiles')
          .select('user_id')
          .eq('email', email)
          .maybeSingle();
        if (error) {
          res.status(400).json({ error: error.message });
          return;
        }
        resolvedUserId = data?.user_id ?? undefined;
      }

      if (resolvedUserId) {
        await adminClient.auth.admin.deleteUser(resolvedUserId);
      }

      if (email) {
        await adminClient.from('user_profiles').delete().eq('email', email);
      } else if (resolvedUserId) {
        await adminClient.from('user_profiles').delete().eq('user_id', resolvedUserId);
      }

      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'PATCH') {
      const { user_id, name, role } = req.body || {};
      if (!user_id && !name && !role) {
        res.status(400).json({ error: 'Nothing to update' });
        return;
      }

      if (name || role) {
        await adminClient.from('user_profiles').update({ name, role }).eq('user_id', user_id);
      }
      if (name || role) {
        await adminClient.auth.admin.updateUserById(user_id, { user_metadata: { name, role } });
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}


