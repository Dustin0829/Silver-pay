import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../components/AdminDashboard';
import ModeratorDashboard from '../components/ModeratorDashboard';
import AgentDashboard from '../components/AgentDashboard';
import EncoderDashboard from '../components/EncoderDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('Dashboard rendered with user role:', user?.role);
  }, [user]);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'moderator') {
    return <ModeratorDashboard />;
  } else if (user?.role === 'agent') {
    return <AgentDashboard />;
  } else if (user?.role === 'encoder') {
    return <EncoderDashboard />;
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