import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-gray-200 py-8">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-center">
      <div className="text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} SilverCard. All rights reserved.</div>
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm w-full md:w-auto">
        <Link to="/promos" className="hover:text-blue-400 transition-colors px-2 py-1">Promos</Link>
        <Link to="/apply" className="hover:text-blue-400 transition-colors px-2 py-1">Credit Cards</Link>
        <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors px-2 py-1">Privacy Policy</Link>
        <Link to="/terms-of-service" className="hover:text-blue-400 transition-colors px-2 py-1">Terms of Service</Link>
        <a href="/login" className="hover:text-blue-400 transition-colors px-2 py-1">Portals</a>
      </div>
    </div>
  </footer>
);

export default Footer; 