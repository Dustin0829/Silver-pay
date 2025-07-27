import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, User, LogOut, MessageSquare, Gift, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/company/Logo.png" alt="SilverCard Company Logo" className="h-36 w-auto" />
          </Link>

          <nav className="flex items-center space-x-6">
            {/* Navigation Links - Show on landing page and when not authenticated */}
            {(!isAuthenticated || isLandingPage) && (
              <div className="hidden md:flex items-center space-x-6">
                <Link 
                  to="/promos" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Promos</span>
                </Link>
                <Link 
                  to="/jobs" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Careers</span>
                </Link>
                <Link 
                  to="/contact" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Contact</span>
                </Link>
              </div>
            )}

            {/* User Menu - Show when authenticated and not on landing page */}
            {isAuthenticated && !isLandingPage && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{user?.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button - Show on landing page and when not authenticated */}
            {(!isAuthenticated || isLandingPage) && (
              <div className="md:hidden">
                <button className="text-gray-700 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;