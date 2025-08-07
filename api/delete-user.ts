import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user's token from the request
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify the user is authenticated and has proper role
    const { data: { user }, error: userAuthError } = await supabase.auth.getUser(token);
    
    if (userAuthError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get the user's role from user_profiles
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
      
    if (profileError || !userProfile) {
      return res.status(401).json({ error: 'User profile not found' });
    }
    
    // Check if user is admin or moderator
    if (!['admin', 'moderator'].includes(userProfile.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // 1. Find user profile by email
    const { data: userProfileToDelete, error: findError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', email)
      .single();
      
    if (findError || !userProfileToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userProfileToDelete.user_id);
    if (authError) {
      return res.status(400).json({ error: 'Failed to delete user from Auth', details: authError.message });
    }

    // 3. Delete from user_profiles table
    const { error: dbError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userProfileToDelete.user_id);
      
    if (dbError) {
      return res.status(400).json({ error: 'Failed to delete user from DB', details: dbError.message });
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err?.message || err });
  }
} 