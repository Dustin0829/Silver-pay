import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user's token from the request
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify the user is authenticated and has proper role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
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
    
    // Fetch all users using service role (bypassing RLS)
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Unexpected error in get-all-users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}