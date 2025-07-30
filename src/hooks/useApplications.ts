import React, { useContext } from 'react';

// Define the context type
interface ApplicationContextType {
  applications: any[];
  addApplication: (application: any) => void;
  updateApplication: (id: string, updates: any) => void;
  getApplicationById: (id: string) => any | undefined;
}

// Create the context
const ApplicationContext = React.createContext<ApplicationContextType | undefined>(undefined);

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

// Export the context for the provider
export { ApplicationContext }; 