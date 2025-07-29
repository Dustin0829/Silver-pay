import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home, FileText, Briefcase } from 'lucide-react';

const ApplicationSuccess: React.FC = () => {
  const location = useLocation();
  
  // Check if it's a job application success page
  const isJobApplication = location.pathname === '/job-application-success';
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {isJobApplication ? 'Job Application Submitted Successfully!' : 'Application Submitted Successfully!'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {isJobApplication 
            ? 'Thank you for your job application. We have received your information and our HR team will review it shortly. You may be contacted for an interview if your qualifications match our requirements.'
            : 'Thank you for your credit card application. We have received your information and will review it shortly. You will be contacted within 3-5 business days regarding the status of your application.'}
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            <strong>Next Steps:</strong>
            <br />
            {isJobApplication ? (
              <>
                • Our HR team will review your application
                <br />
                • You may be contacted for an interview
                <br />
                • Please ensure you've attached your resume to the email
              </>
            ) : (
              <>
                • Our team will verify your information
                <br />
                • You may be contacted for additional documentation
                <br />
                • Approval notification will be sent via email/SMS
              </>
            )}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="flex items-center justify-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          {isJobApplication ? (
            <Link
              to="/jobs"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              View More Jobs
            </Link>
          ) : (
            <Link
              to="/apply"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              New Application
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;