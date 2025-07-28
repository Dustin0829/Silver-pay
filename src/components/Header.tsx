import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, User, LogOut, MessageSquare, Gift, Briefcase, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
                <button 
                  onClick={toggleMobileMenu}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {isMobileMenuOpen && (!isAuthenticated || isLandingPage) && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Navigation Links */}
              <div className="flex-1 p-4 space-y-2">
                <Link 
                  to="/promos" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">Promos</span>
                </Link>
                <Link 
                  to="/jobs" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">Careers</span>
                </Link>
                <Link 
                  to="/contact" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">Contact</span>
                </Link>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 text-center">
                  Silver Card Solutions
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;