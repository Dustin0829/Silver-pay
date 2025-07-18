import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const promos = [
  {
    title: 'Free Headset',
    desc: 'Get a high-quality headset when you apply and get approved for a credit card this month!',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Free Earphones',
    desc: 'Enjoy free premium earphones for every successful application.',
    img: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Exclusive Welcome Gift',
    desc: 'Receive a surprise welcome gift when you get your new credit card delivered!',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
];

const Promos: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] bg-gray-50 flex flex-col">
      <button type="button" onClick={() => navigate(-1)} className="fixed top-4 left-4 z-30 flex items-center p-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 bg-white shadow" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
      <div className="flex-1 flex flex-col items-center justify-start py-8 px-2 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in">Current Promotions</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
          {promos.map((promo, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-gray-100 group cursor-pointer relative overflow-hidden animate-fade-in w-full"
            >
              <div className="w-28 h-28 mb-4 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                <img src={promo.img} alt={promo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h2 className="text-xl font-bold text-blue-700 mb-2 text-center group-hover:text-blue-900 transition-colors">{promo.title}</h2>
              <p className="text-gray-600 text-center mb-2 group-hover:text-gray-800 transition-colors">{promo.desc}</p>
              <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold group-hover:bg-blue-200 group-hover:text-blue-900 transition-colors">Limited Offer</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-blue-400 transition-opacity rounded-2xl pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Promos; 