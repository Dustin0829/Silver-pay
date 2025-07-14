import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <button type="button" onClick={() => navigate(-1)} className="fixed top-4 left-4 z-30 flex items-center p-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 bg-white shadow" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-700 mb-4">This is the Terms of Service page. The full terms of service content will be provided here.</p>
    </div>
  );
};

export default TermsOfService; 