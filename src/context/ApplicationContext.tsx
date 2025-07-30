import React, { useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { Application } from '../types';
import { ApplicationContext } from '../hooks/useApplications';

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false); // Local loading state

  useEffect(() => {
    console.log('ApplicationContext: Starting to fetch applications');
    setIsLoadingApplications(true); // Use local loading state instead
    const fetchApplications = async () => {
      try {
        console.log('ApplicationContext: Fetching from Supabase...');
        const { data, error } = await supabase.from('kyc_details').select('*');
        if (!error && data) {
          console.log('ApplicationContext: Data fetched successfully:', data.length, 'applications');
          setApplications(data as Application[]);
        } else {
          console.warn('ApplicationContext: No applications data found or error occurred:', error);
          setApplications([]);
        }
      } catch (error) {
        console.error('ApplicationContext: Error fetching applications:', error);
        setApplications([]);
      } finally {
        console.log('ApplicationContext: Setting loading to false');
        setIsLoadingApplications(false); // Use local loading state instead
      }
    };
    fetchApplications();
  }, []); // Remove setLoading from dependencies

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



