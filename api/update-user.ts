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
    
    const { id, name, role, bankCodes, password } = req.body;
    
    // Validate inputs
    if (!id || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Update user profile in the database
    const updateData: any = {
      name,
      role,
      bank_codes: role === 'agent' ? bankCodes : [],
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', id);
      
    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }
    
    // If password was provided, update it
    if (password) {
      // Get user_id from the profile
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('id', id)
        .single();
        
      if (userError || !userData) {
        return res.status(400).json({ error: 'Failed to find user_id' });
      }
      
      // Update the password
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        userData.user_id,
        { password }
      );
      
      if (passwordError) {
        return res.status(400).json({ error: 'Failed to update password: ' + passwordError.message });
      }
    }
    
    // Get the updated user profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError || !updatedProfile) {
      return res.status(200).json({ success: true, user: { id, ...updateData } });
    }
    
    return res.status(200).json({ success: true, user: updatedProfile });
  } catch (error) {
    console.error('Unexpected error in update-user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}