import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Company/Logo.png';

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
            <img src={Logo} alt="Silver Pay Company Logo" className="h-28 w-auto" />
          </Link>

          <nav className="flex items-center space-x-6">
            {isLandingPage && !isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className="text-blue-700 hover:text-blue-800 transition-colors"
                  aria-label="Portal Login"
                >
                  <User className="h-6 w-6" />
                </Link>
              </>
            )}

            {isAuthenticated && (
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
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;