import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ApplicationProvider } from './context/ApplicationContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './components/ApplicationForm';
import ApplicationSuccess from './pages/ApplicationSuccess';

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="apply" element={<ApplicationForm />} />
              <Route path="application-success" element={<ApplicationSuccess />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;