import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';
import { useLoading } from './LoadingContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
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

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' && session && session.user) {
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
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session) {
      console.error('Auth error:', error?.message);
      setLoading(false);
      return false;
    }
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || !profile) {
      console.error('Profile error:', profileError?.message);
      setLoading(false);
    return false;
    }
    setUser({
      id: profile.id,
      email: profile.email,
      name: profile.display_name || profile.name,
      role: profile.role,
      createdAt: new Date(profile.created_at || data.user.created_at),
    });
    setLoading(false);
    return true;
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
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