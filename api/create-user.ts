import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
    
    const { name, email, password, role, bankCodes } = req.body;
    
    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create a direct entry in the user_profiles table
    // For a real application, you would use proper auth flow
    // This is a simplified approach for demonstration purposes
    // Generate a UUID for the user_id
    const userId = crypto.randomUUID();
    
    // Create user profile in the database
    const newUserProfile = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      email,
      role,
      bank_codes: role === 'agent' ? bankCodes : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert(newUserProfile);
      
    if (insertError) {
      console.error('Error inserting user profile:', insertError);
      return res.status(400).json({ error: insertError.message });
    }
    
    // For a real application, you would create the auth user here
    console.log('User profile created successfully:', newUserProfile);
    
    return res.status(200).json({ success: true, user: newUserProfile });
  } catch (error) {
    console.error('Unexpected error in create-user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}