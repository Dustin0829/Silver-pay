import React, { useContext } from 'react';

// Define the context type
interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  createUser: (userData: any) => Promise<boolean>;
  updateUserRole: (userId: string, role: any) => Promise<boolean>;
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