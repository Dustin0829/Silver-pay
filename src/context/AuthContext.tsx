import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useLoading } from '../hooks/useLoading';
import { supabase } from '../supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AuthContext } from '../hooks/useAuth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { setLoading } = useLoading();

  // Check for existing session on mount
  useEffect(() => {
    console.log('AuthContext: Starting to check user session');
    const checkUser = async () => {
      try {
        console.log('AuthContext: Getting session from Supabase...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('AuthContext: User session found, fetching profile...');
          await fetchUserProfile(session.user);
        } else {
          console.log('AuthContext: No user session found');
        }
      } catch (error) {
        console.error('AuthContext: Error checking user session:', error);
      }
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          const suppressNextSignIn = typeof window !== 'undefined' && localStorage.getItem('suppressNextSignIn') === 'true';
          if (suppressNextSignIn && event === 'SIGNED_IN' && session?.user) {
            console.warn('AuthContext: Suppressing SIGNED_IN event triggered by user creation.');
            localStorage.removeItem('suppressNextSignIn');
            return; // Ignore this transient sign-in
          }
          if (event === 'SIGNED_IN' && session?.user) {
            await fetchUserProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      );

      // Use maybeSingle() instead of single() to handle cases where there might be multiple rows
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If we get a multiple rows error, try to get the first one
        if (error.code === 'PGRST116' && error.message.includes('multiple')) {
          console.log('Multiple profiles found, getting first one...');
          const { data: profiles, error: multiError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', supabaseUser.id)
            .limit(1);
          
          if (multiError) {
            console.error('Error fetching first profile:', multiError);
            return;
          }
          
          if (profiles && profiles.length > 0) {
            const firstProfile = profiles[0];
            console.log('Using first profile:', firstProfile);
            
            const userData: User = {
              id: supabaseUser.id,
              email: supabaseUser.email!,
              name: firstProfile.name,
              role: firstProfile.role,
              createdAt: new Date(supabaseUser.created_at),
            };
            
            setUser(userData);
          }
        }
        return;
      }

      if (profile) {
        // Log the profile to verify the role
        console.log('Fetched user profile:', profile);
        
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profile.name,
          role: profile.role,
          createdAt: new Date(supabaseUser.created_at),
        };
        
        // Log the processed user data with role
        console.log('User data with role:', userData);
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    console.log('Login attempt for email:', email);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), 10000)
      );

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Login error:', error);
        setLoading(false);
        return false;
      }

      if (data.user) {
        console.log('User authenticated:', data.user.id);
        
        // Set user immediately with basic info, but use 'unknown' as placeholder instead of 'user'
        const basicUserData: User = {
          id: data.user.id,
          email: data.user.email!,
          name: '', // Will be updated when profile loads
          role: 'unknown' as any, // Placeholder, will be updated
          createdAt: new Date(data.user.created_at),
        };
        setUser(basicUserData);
        
        // Immediately fetch the profile instead of doing it in background
        try {
          await fetchUserProfile(data.user);
        } catch (profileError) {
          console.error('Profile fetch failed:', profileError);
        }
        
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch (error) {
      console.error('Unexpected login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Unexpected logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: { 
    email: string; 
    password: string; 
    name: string; 
    role: 'admin' | 'moderator' | 'agent' | 'encoder' 
  }): Promise<boolean> => {
    try {
      // First, check if user already exists in profiles
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userData.email)
        .single();

      if (existingProfile) {
        throw new Error('A user with this email already exists.');
      }

      // Create user profile first (without user_id)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          name: userData.name,
          role: userData.role,
          email: userData.email,
          // user_id will be null initially
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile.');
      }

      // Now try to create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        console.error('Error creating user in auth:', authError);
        
        // Handle rate limiting specifically
        if (authError.message.includes('For security purposes, you can only request this after')) {
          const timeMatch = authError.message.match(/(\d+) seconds/);
          const seconds = timeMatch ? timeMatch[1] : '60';
          throw new Error(`Rate limit exceeded. Please wait ${seconds} seconds before trying again.`);
        }
        
        // Handle other common errors
        if (authError.message.includes('User already registered')) {
          // If auth user already exists, try to link it
          throw new Error('User account created successfully! The user will receive an email to activate their account. They can log in after confirming their email.');
        }
        
        throw new Error(authError.message || 'Failed to create user account.');
      }

      if (authData.user) {
        // Update the profile with the user_id
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ user_id: authData.user.id })
          .eq('id', profileData.id);

        if (updateError) {
          console.error('Error linking user profile:', updateError);
          // Don't fail here, the profile exists and auth user was created
        }

        console.log('User created successfully:', authData.user.id);
        // Show success message with email confirmation info
        console.log('User account created! The user will receive an email to confirm their account before they can log in.');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      throw error; // Re-throw to show specific error message
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'agent' | 'encoder'): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      // Update local user state if it's the current user
      if (user && user.id === userId) {
        setUser({ ...user, role });
      }

      return true;
    } catch (error) {
      console.error('Unexpected error updating user role:', error);
      return false;
    }
  };

  const updateUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
    try {
      // Get the current session to verify the user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found');
        return false;
      }

      // Call the deployed Supabase Edge Function to update the password
      const supabaseUrl = 'https://dywstsoqrnqyihlntndl.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/update-user-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          new_password: newPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating password:', result.error);
        return false;
      }

      console.log('Password updated successfully:', result);
      return true;
    } catch (error) {
      console.error('Unexpected error updating user password:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: 'agent', // Default role for new sign-ups
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return false;
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            name: name,
            role: 'agent',
            email: email,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return false;
        }

        console.log('User signed up successfully:', data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    createUser,
    updateUserRole,
    updateUserPassword,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



