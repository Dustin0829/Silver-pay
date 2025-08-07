import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

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
    
    const { name, email, password, role, bankCodes } = req.body;
    
    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // First, check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();
      
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    
    // Create the auth user using admin functions
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        role
      }
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return res.status(400).json({ error: authError.message });
    }
    
    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create authentication user' });
    }
    
    // Create user profile in the database
    const newUserProfile = {
      user_id: authData.user.id,
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
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: insertError.message });
    }
    
    console.log('User created successfully:', authData.user.id);
    
    return res.status(200).json({ 
      success: true, 
      user: { ...newUserProfile, id: authData.user.id },
      message: 'User created successfully and can log in immediately'
    });
  } catch (error) {
    console.error('Unexpected error in create-user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}