import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Placeholder data for 9 banks
const banks = [
  {
    name: 'RCBC',
    logo: '/src/assets/banks/RCBC.jpg',
    promoPage: 'https://rcbccredit.com/promos/all/exclusive-for-new-cardholders',
    promos: [
      {
        title: 'Buy One, Get One Bento at Tokyo Tokyo',
        desc: 'Buy one, get one FREE Bento à la carte every Tuesday with your RCBC JCB Credit Card!',
        img: '/src/assets/placeholder/tokyo-tokyo.jpg', // Replace with a relevant image
      },
      {
        title: 'Up to ₱3,000 CASHBACK with RCBC Pay',
        desc: 'Get up to ₱3,000 Cashback for RCBC Pay purchases + EXTRA ₱100 for new RCBC Pay users.',
        img: '/src/assets/placeholder/cashback.jpg',
      },
      {
        title: 'FREE US$200 Cathay Pacific Voucher Welcome Gift',
        desc: 'Get FREE US$200 Cathay Pacific Voucher Code with your new RCBC Visa Platinum Credit Card!',
        img: '/src/assets/placeholder/cathay-pacific.jpg',
      },
      {
        title: 'Up to ₱5,000 ZARA eVoucher Welcome Gift',
        desc: 'Get FREE up to ₱5,000 ZARA eVoucher with your new RCBC Visa Credit Card!',
        img: '/src/assets/placeholder/zara.jpg',
      },
      {
        title: 'Marshall Earphones or Speaker Welcome Gift',
        desc: 'Get a FREE Marshall Earphones or Speaker with your new RCBC Mastercard Credit Card!',
        img: '/src/assets/placeholder/marshall.jpg',
      },
    ],
  },
  {
    name: 'BPI',
    logo: '/src/assets/banks/bpi.jpg',
    promoPage: 'https://www.bpi.com.ph/personal/rewards-and-promotions/promos',
    promos: [
      {
        title: 'Travel the World with BPI',
        desc: 'Get travel discounts and perks with your BPI Credit Card.',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Grocery Cashback',
        desc: 'Earn cashback on your grocery shopping with BPI Cards.',
        img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Dining Delights',
        desc: 'Special discounts at top restaurants for BPI cardholders.',
        img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Shopping Spree',
        desc: 'Enjoy shopping promos at partner malls with BPI.',
        img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Fuel Up and Save',
        desc: 'Get fuel rebates at select stations with BPI Cards.',
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    name: 'AUB',
    logo: '/src/assets/banks/AUB.jpg',
    promoPage: 'https://online.aub.ph/creditcards/promos',
    promos: [
      {
        title: 'AUB Shopping Bonanza',
        desc: 'Shop and win exciting prizes with AUB Credit Cards.',
        img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Dining Rewards',
        desc: 'Earn rewards every time you dine with AUB Cards.',
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Travel with Ease',
        desc: 'Enjoy travel insurance and perks with AUB.',
        img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Gadget Deals',
        desc: 'Get discounts on gadgets at partner stores.',
        img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Wellness Offers',
        desc: 'Special rates at wellness centers for AUB cardholders.',
        img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    name: 'EastWest',
    logo: '/src/assets/banks/eastwest.webp',
    promoPage: 'http://eastwestbanker.com/promos',
    promos: [
      {
        title: 'EastWest Shopping Festival',
        desc: 'Enjoy exclusive shopping deals with EastWest Cards.',
        img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Travel Adventures',
        desc: 'Get travel discounts and insurance with EastWest.',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Dining Extravaganza',
        desc: 'Special dining promos for EastWest cardholders.',
        img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Fuel Rebates',
        desc: 'Save on fuel with EastWest Cards.',
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Grocery Savings',
        desc: 'Get cashback on groceries with EastWest.',
        img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    name: 'Maybank',
    logo: '/src/assets/banks/maybank.png',
    promoPage: 'https://www.maybank.com.ph/en/personal/cards/promotions-contests-events.page',
    promos: [
      {
        title: 'Maybank Travel Treats',
        desc: 'Travel and enjoy exclusive perks with Maybank Cards.',
        img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Dining Rewards',
        desc: 'Earn dining rewards with every swipe.',
        img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Shopping Discounts',
        desc: 'Get discounts at partner stores with Maybank.',
        img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Fuel Up',
        desc: 'Save on fuel with Maybank Cards.',
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Grocery Cashback',
        desc: 'Cashback on groceries for Maybank cardholders.',
        img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    name: 'Metrobank',
    logo: '/src/assets/banks/metrobank.jpeg',
    promoPage: 'https://www.metrobank.com.ph/promos',
    promos: [
      {
        title: 'Metrobank Shopping Spree',
        desc: 'Shop and get exclusive deals with Metrobank Cards.',
        img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Dining Delights',
        desc: 'Special dining discounts for Metrobank cardholders.',
        img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Travel Perks',
        desc: 'Enjoy travel perks and insurance with Metrobank.',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Fuel Rebates',
        desc: 'Get rebates on fuel purchases with Metrobank.',
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Grocery Savings',
        desc: 'Save on groceries with Metrobank Cards.',
        img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    name: 'PNB',
    logo: '/src/assets/banks/pnb.png',
    promoPage: 'https://www.pnb.com.ph/index.php/pnb-credit-card-promos?tpl=revamp',
    promos: [
      {
        title: 'PNB Travel Deals',
        desc: 'Travel and save with PNB Credit Cards.',
        img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Dining Rewards',
        desc: 'Earn rewards when you dine with PNB Cards.',
        img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Shopping Discounts',
        desc: 'Get discounts at partner stores with PNB.',
        img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Fuel Rebates',
        desc: 'Save on fuel with PNB Cards.',
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Grocery Cashback',
        desc: 'Cashback on groceries for PNB cardholders.',
        img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    name: 'Robinsons Bank',
    logo: '/src/assets/banks/robinson.jpg',
    promoPage: 'https://www.robinsonsbank.com.ph/cards/credit-card/credit-card-promos/',
    promos: [
      {
        title: 'Robinsons Shopping Festival',
        desc: 'Shop and win prizes with Robinsons Bank Cards.',
        img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Dining Delights',
        desc: 'Special dining discounts for Robinsons cardholders.',
        img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Travel Perks',
        desc: 'Enjoy travel perks and insurance with Robinsons Bank.',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Fuel Rebates',
        desc: 'Get rebates on fuel purchases with Robinsons Bank.',
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Grocery Savings',
        desc: 'Save on groceries with Robinsons Bank Cards.',
        img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    name: 'Security Bank',
    logo: '/src/assets/banks/securitybank.jpg',
    promoPage: 'https://www.securitybank.com/promos/?awadid=&awkwid=&awadata=21699574786*****20822**x**&gad_source=1&gad_campaignid=21699575680&gbraid=0AAAAADBOLq62Lwa4IT_DzDPwLYRiI6NED&gclid=CjwKCAjw7fzDBhA7EiwAOqJkh8-3Qz9brUpQ1Eosa1uT9FhrP-byRpcRdlNgS53z6fxaxYjZ3eepfRoCFBMQAvD_BwE',
    promos: [
      {
        title: 'Security Bank Shopping Spree',
        desc: 'Shop and get exclusive deals with Security Bank Cards.',
        img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Dining Delights',
        desc: 'Special dining discounts for Security Bank cardholders.',
        img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Travel Perks',
        desc: 'Enjoy travel perks and insurance with Security Bank.',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Fuel Rebates',
        desc: 'Get rebates on fuel purchases with Security Bank.',
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Grocery Savings',
        desc: 'Save on groceries with Security Bank Cards.',
        img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
];

// Add a color mapping for each bank (brand color or closest Tailwind color)
const bankBgColors: Record<string, string> = {
  'RCBC': 'from-[#0072CE] to-[#00AEEF]', // RCBC blue gradient
  'BPI': 'from-[#A6192E] to-[#F5B400]', // BPI maroon to gold
  'AUB': 'from-[#F9B233] to-[#F39200]', // AUB yellow/orange
  'EastWest': 'from-[#7A1FA2] to-[#D4145A]', // EastWest purple to magenta
  'Maybank': 'from-[#FFD100] to-[#FFB300]', // Maybank yellow
  'Metrobank': 'from-[#00529B] to-[#0072CE]', // Metrobank blue
  'PNB': 'from-[#003A6C] to-[#E30613]', // PNB blue to red
  'Robinsons Bank': 'from-[#8DC63F] to-[#006838]', // Robinsons green
  'Security Bank': 'from-[#0072CE] to-[#8DC63F]', // Security Bank blue to green
};

const Promos: React.FC = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const visibleBanks = showAll ? banks : [banks[0]];
  return (
    <div className="min-h-[60vh] bg-gray-50 flex flex-col">
      <button type="button" onClick={() => navigate(-1)} className="fixed top-4 left-4 z-30 flex items-center p-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 bg-white shadow" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
      <div className="flex-1 flex flex-col items-center justify-start py-8 px-2 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in">Bank Partner Promos</h1>
        <div className="w-full max-w-7xl flex flex-col gap-12">
          {visibleBanks.map((bank, bankIdx) => (
            <div
              key={bankIdx}
              className={`rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in bg-gradient-to-br ${bankBgColors[bank.name] || 'from-gray-100 to-gray-50'}`}
            >
              <div className="flex items-center mb-6">
                <img src={bank.logo} alt={bank.name} className="w-14 h-14 rounded-lg object-contain bg-gray-100 mr-4" />
                <h2 className="text-2xl font-bold text-white drop-shadow-md" style={{textShadow: '0 2px 8px rgba(0,0,0,0.25)'}}>{bank.name}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
                {bank.promos.map((promo, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-xl shadow p-4 flex flex-col items-center hover:scale-105 hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer relative overflow-hidden w-full"
                  >
                    <div className="w-28 h-28 mb-3 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                      <img src={promo.img} alt={promo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-base font-semibold text-blue-700 mb-1 text-center group-hover:text-blue-900 transition-colors">{promo.title}</h3>
                    <p className="text-xs text-gray-600 text-center group-hover:text-gray-800 transition-colors">{promo.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <a
                  href={bank.promoPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition-colors"
                >
                  See full details
                </a>
              </div>
            </div>
          ))}
          {!showAll && banks.length > 1 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAll(true)}
                className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition-colors"
              >
                See more
              </button>
            </div>
          )}
          {showAll && banks.length > 1 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAll(false)}
                className="px-8 py-3 bg-gray-300 text-gray-800 rounded-full font-semibold shadow hover:bg-gray-400 transition-colors"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Promos; 