import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onShowTerms?: () => void;
  onShowPrivacy?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowTerms, onShowPrivacy }) => {
  const creditCardLinks = [
    'Compare Credit Cards',
    'Easiest Credit Cards to Get',
    'No Annual Fee Credit Cards',
    'Credit Cards for Beginners',
    'Best Credit Cards in 2024',
    'Cashback Credit Cards',
    'Rewards Credit Cards',
    'Travel Credit Cards',
    'UnionBank Credit Cards',
    'Metrobank Credit Cards',
    'HSBC Credit Cards',
    'Security Bank Credit Cards',
    'BPI Credit Cards',
    'EastWest Bank Credit Cards',
  ];

  return (
    <footer className="bg-gray-900 text-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-start gap-6 text-left font-inherit">
        <div className="text-sm md:mb-0 mb-4 md:text-left text-center w-full md:w-auto">&copy; {new Date().getFullYear()} SilverCard. All rights reserved.</div>
        <div className="flex flex-col md:flex-row gap-12 w-full md:w-auto md:items-start md:text-left">
          {/* Main Links and Credit Cards Columns Side by Side */}
          <div className="flex flex-row gap-12 md:gap-12 w-full md:w-auto justify-start">
            {/* Main Links Column */}
            <div className="flex flex-col gap-2 text-sm min-w-[150px] items-start text-left">
              <Link to="/promos" className="hover:text-blue-400 transition-colors px-2 py-1">Promos</Link>
              {onShowTerms ? (
                <button type="button" className="hover:text-blue-400 transition-colors px-2 py-1 bg-transparent border-none outline-none" onClick={onShowTerms}>Terms of Service</button>
              ) : (
                <Link to="/terms-of-service" className="hover:text-blue-400 transition-colors px-2 py-1">Terms of Service</Link>
              )}
              {onShowPrivacy ? (
                <button type="button" className="hover:text-blue-400 transition-colors px-2 py-1 bg-transparent border-none outline-none" onClick={onShowPrivacy}>Privacy Policy</button>
              ) : (
                <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors px-2 py-1">Privacy Policy</Link>
              )}
              <Link to="/jobs" className="hover:text-blue-400 transition-colors px-2 py-1">Careers</Link>
              <a href="/login" className="hover:text-blue-400 transition-colors px-2 py-1">Portals</a>
            </div>
            {/* Credit Cards Section Column */}
            <div className="text-left min-w-[200px]">
              <div className="font-bold text-sm mb-2 text-white">Credit Cards</div>
              <ul className="space-y-1">
                {creditCardLinks.map((label, idx) => (
                  <li key={idx}>
                    <Link to="/apply" className="hover:text-blue-400 transition-colors text-white text-sm block px-1 py-0.5 text-left">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 