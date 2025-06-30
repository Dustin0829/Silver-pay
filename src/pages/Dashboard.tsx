import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import AgentDashboard from '../components/AgentDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'agent') {
    return <AgentDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;