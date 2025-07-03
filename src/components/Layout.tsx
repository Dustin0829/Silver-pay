import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from './Header';

const clientHeaderRoutes = [
  '/',
  '/login',
  '/apply',
  '/application-success',
  '/privacy-policy',
  '/terms-of-service',
  '/contact',
  '/credit-cards',
];

const Layout: React.FC = () => {
  const location = useLocation();
  const showHeader = clientHeaderRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">&copy; 2025 SilverCard. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/credit-cards" className="text-gray-400 hover:text-white text-sm transition-colors">Credit Cards</Link>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;