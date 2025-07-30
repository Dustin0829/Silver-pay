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

      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);
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
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating user in auth:', authError);
        return false;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            name: userData.name,
            role: userData.role,
            email: userData.email,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Clean up the auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      return false;
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

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    createUser,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



