import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing session and fetch user profile
  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        // Fetch user profile from 'users' table using id
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!profileError && profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.display_name || profile.name,
            role: profile.role,
            createdAt: new Date(profile.created_at || session.user.created_at),
          });
        }
      }
      setLoading(false);
    };
    getSessionAndProfile();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' && session && session.user) {
        // Fetch user profile on sign in
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error: profileError }) => {
            if (!profileError && profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                name: profile.display_name || profile.name,
                role: profile.role,
                createdAt: new Date(profile.created_at || session.user.created_at),
              });
            }
          });
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session) {
      console.error('Auth error:', error?.message);
      return false;
    }
    // Fetch user profile from 'users' table using id
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || !profile) {
      console.error('Profile error:', profileError?.message);
    return false;
    }
    // Map to app User type
    setUser({
      id: profile.id, // Use id from table
      email: profile.email,
      name: profile.display_name || profile.name, // Handle potential column name variation
      role: profile.role,
      createdAt: new Date(profile.created_at || data.user.created_at),
    });
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};