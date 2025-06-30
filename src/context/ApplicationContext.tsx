import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application } from '../types';

interface ApplicationContextType {
  applications: Application[];
  addApplication: (application: Omit<Application, 'id' | 'submittedAt'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  getApplicationById: (id: string) => Application | undefined;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);

  const addApplication = (applicationData: Omit<Application, 'id' | 'submittedAt'>) => {
    const newApplication: Application = {
      ...applicationData,
      id: Date.now().toString(),
      submittedAt: new Date(),
    };
    setApplications(prev => [...prev, newApplication]);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, ...updates } : app))
    );
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const value = {
    applications,
    addApplication,
    updateApplication,
    getApplicationById,
  };

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};