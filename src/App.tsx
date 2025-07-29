import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ApplicationProvider } from './context/ApplicationContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './components/ApplicationForm';
import ApplicationSuccess from './pages/ApplicationSuccess';
import CreditCards from './pages/CreditCards';
import Promos from './pages/Promos';
import JobApplication from './pages/JobApplication';
import JobApplicationForm from './pages/JobApplicationForm';
import Contact from './pages/Contact';

const AppContent: React.FC = () => {
  const { loading } = useLoading();
  
  return (
    <>
      {loading && <LoadingSpinner />}
      <AuthProvider>
        <ApplicationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Landing />} />
                <Route path="login" element={<Login />} />
                <Route path="apply" element={<ApplicationForm />} />
                <Route path="application-success" element={<ApplicationSuccess />} />
                <Route path="jobs" element={<JobApplication />} />
                <Route path="jobs/apply/:jobId" element={<JobApplicationForm />} />
                <Route path="job-application-success" element={<ApplicationSuccess />} />
                <Route 
                  path="dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="admin/*" 
                  element={
                    <ProtectedRoute role="admin">
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="agent/apply" 
                  element={
                    <ProtectedRoute role="agent">
                      <ApplicationForm isAgentForm={true} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="agent/*" 
                  element={
                    <ProtectedRoute role="agent">
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="unauthorized" 
                  element={
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
                        <p className="text-gray-600">You don't have permission to access this page.</p>
                      </div>
                    </div>
                  } 
                />
                <Route path="credit-cards" element={<CreditCards />} />
                <Route path="promos" element={<Promos />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </ApplicationProvider>
      </AuthProvider>
    </>
  );
};

function App() {  
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}

export default App;