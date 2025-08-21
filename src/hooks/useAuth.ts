import React, { useContext } from 'react';

// Define the context type
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  createUser: (userData: CreateUserData) => Promise<boolean>;
  updateUserRole: (userId: string, role: any) => Promise<boolean>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
}

// Create the context
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for the provider
export { AuthContext }; 