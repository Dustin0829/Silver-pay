import React, { useContext } from 'react';

// Define the context type
interface LoadingContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// Create the context
const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Export the context for the provider
export { LoadingContext }; 