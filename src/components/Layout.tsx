import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

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
      <Footer />
    </div>
  );
};

export default Layout;