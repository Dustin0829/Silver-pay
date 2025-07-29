import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, X } from 'lucide-react';

const banks = [
  {
    name: 'RCBC',
    logo: '/banks/RCBC.jpg',
    promoPage: 'https://rcbccredit.com/promos/all/exclusive-for-new-cardholders',
    promos: [
      {
        title: 'Spend Anywhere & Get FREE Red Ribbon Baked Goodies',
        desc: 'Spend with your RCBC JCB Credit Card and get free Red Ribbon treats for qualified purchases.',
        img: '/promos/rcbc/red-ribbon-rcbc.jpg',
      },
      {
        title: 'Welcome Gift for New RCBC Mastercard Credit Cardholders',
        desc: 'Apply for a new RCBC Mastercard and get a Nike Park eGift or Marshall Earbuds/Speaker as a welcome gift.',
        img: '/promos/rcbc/rcbc-gift.jpg',
      },
      {
        title: 'Spend Anywhere & Get FREE Greenwich Treats',
        desc: 'Spend with your RCBC Mastercard and get free Greenwich meals for qualified purchases.',
        img: '/promos/rcbc/greenwich-rcbc.jpg',
      },
      {
        title: 'Up to ₱8,000 Cashback with RCBC Credit Card',
        desc: 'Register and spend with your RCBC Credit Card to earn up to ₱8,000 cashback.',
        img: '/promos/rcbc/rcbc-cashback.jpg',
      },
      {
        title: 'FREE US$200 Cathay Pacific Voucher Welcome Gift',
        desc: 'Get a free US$200 Cathay Pacific voucher with your new RCBC Visa Platinum Credit Card.',
        img: '/promos/rcbc/cathway-rcbc.jpg',
      },
    ],
  },
  {
    name: 'BPI',
    logo: '/banks/bpi.jpg',
    promoPage: 'https://www.bpi.com.ph/personal/rewards-and-promotions/promos',
    promos: [
      {
        title: 'Switch Up, Level Up Promo',
        desc: 'Enjoy up to PHP 30,000 eGCs when you apply for two (2) BPI Credit Cards.',
        img: '/promos/bpi/bpi-30000.jpg',
      },
      {
        title: 'Kindred PH Promo',
        desc: 'Get up to 40% off with your BPI Credit, Debit, or Prepaid Card.',
        img: '/promos/bpi/bpi-kindred.webp',
      },
      {
        title: 'The Manila Hotel Promo',
        desc: 'Enjoy 15% off on best available rates with your BPI Credit, Debit, or Prepaid Card.',
        img: '/promos/bpi/bpi-manila-hotel.png',
      },
      {
        title: 'Cucina by Marco Polo Ortigas Promo',
        desc: 'Enjoy up to 50% off with your BPI Credit, Debit, or Prepaid Card.',
        img: '/promos/bpi/bpi-cucina.jpg',
      },
      {
        title: 'Philippine Airlines: 3 months Real 0% SIP',
        desc: 'Enjoy 3 months Real 0% SIP with your BPI Credit Card.',
        img: '/promos/bpi/bpi-airlines.jpg',
      },
    ],
  },
  {
    name: 'AUB',
    logo: '/banks/AUB.jpg',
    promoPage: 'https://www.aub.com.ph/creditcards/promos',
    promos: [
      {
        title: 'No Annual Fee Forever',
        desc: 'Get AUB Easy Mastercard or Classic Mastercard and enjoy no annual fees for life.',
        img: '/promos/aub/aub-no-annual.jpg',
      },
      {
        title: '35% Discount on Wyndham Hotels & Resorts',
        desc: 'Enjoy 35% off your accommodation at Wyndham Hotels and Resorts with your AUB Mastercard.',
        img: '/promos/aub/aub-wyndham.jpg',
      },
      {
        title: '10% Discount on Cakes and Desserts at CakeRush',
        desc: 'Buy your cake or desserts at CakeRush using your AUB Mastercard and enjoy a 10% discount.',
        img: '/promos/aub/aub-cakerush.png',
      },
      {
        title: '10% Discount on Car Rentals Worldwide at Hertz',
        desc: 'Enjoy a 10% discount on your car rental with Hertz for a minimum of one day when you use your AUB Mastercard.',
        img: '/promos/aub/aub-hertz.webp',
      },
      {
        title: '10% Discount on Regular Items at Pacsafe',
        desc: 'Enjoy 10% off on all regular items at Pacsafe with your AUB Mastercard.',
        img: '/promos/aub/aub-pacsafe.jpg',
      },
    ],
  },
  {
    name: 'EastWest',
    logo: '/banks/eastwest.webp',
    promoPage: 'https://www.eastwestbanker.com/promos',
    promos: [
      {
        title: 'Php5,000 Welcome Cash Credit',
        desc: 'Get Php5,000 bonus cash credit upon reaching your first Php10,000 retail spend within two (2) months from card activation date.',
        img: '/promos/eastwest/eastwest-5000.jpg',
      },
      {
        title: 'Up to 8.88% Cash Rewards',
        desc: 'Get up to 8.88% Cash Rewards on straight charges at department stores, restaurants, airlines, hotels, travel services, and more.',
        img: '/promos/eastwest/eastwest-888.png',
      },
      {
        title: '0.75% Installment at Xavier University',
        desc: 'Get as low as 0.75% interest on installments on school fees for up to 12 months.',
        img: '/promos/eastwest/eastwest-univ.webp',
      },
      {
        title: 'FREE Backpack at Rudy Project',
        desc: 'Get a FREE backpack at Rudy Project for a min. spend of Php 20,000, plus enjoy 0% installment offers with your EastWest credit card.',
        img: '/promos/eastwest/rudyproject.jpg',
      },
      {
        title: 'Up to 50% OFF at Admiral Club Manila Bay',
        desc: 'Enjoy up to 50% OFF at Admiral Club Manila Bay with your EastWest credit card.',
        img: '/promos/eastwest/admiral-hotel.webp',
      },
    ],
  },
  {
    name: 'Maybank',
    logo: '/banks/maybank.png',
    promoPage: 'https://cashback.maybank.com.ph/',
    promos: [
      {
        title: 'Pre-order the Galaxy Z Fold7 | Z Flip7',
        desc: 'Use GALAXYZ7AFF code for special savings.',
        img: '/promos/maybank/maybank-fold.jpg',
      },
      {
        title: 'PLDT Fibr Netflix Promo',
        desc: 'Subscribe to any PLDT Fibr Plan and get Netflix!',
        img: '/promos/maybank/pldt-maybank.jpg',
      },
      {
        title: 'Move It Gift Cards',
        desc: 'Move It promo codes in the form of unique promo codes in denominations of either P20, P25, or P50!',
        img: '/promos/maybank/moveit.png',
      },
      {
        title: 'Travel Made Easy – Save Up to 70%!',
        desc: 'Enjoy massive savings on your essential travel needs – from airport transfers to tours and hotels.',
        img: '/promos/maybank/70-maybank.jpg',
      },
      {
        title: 'Lazada Gift Cards',
        desc: 'LAZADA offers effortless shopping with the best deals for everything and anything making shopping a convenient and exciting experience.',
        img: '/promos/maybank/lazada-maybank.jpg',
      },
    ],
  },
  {
    name: 'Metrobank',
    logo: '/banks/metrobank.jpeg',
    promoPage: 'https://www.metrobank.com.ph/promos',
    promos: [
      {
        title: 'Big Travel Bonus',
        desc: 'Get exclusive travel deals and discounts with your Metrobank credit card.',
        img: '/promos/metrobank/bigtravel-bonus.webp',
      },
      {
        title: 'P100 eGC for New Cardholders',
        desc: 'Receive a P100 eGC when you activate your new Metrobank credit card.',
        img: '/promos/metrobank/100egc-metrobank.jpg',
      },
      {
        title: 'Australia Adventure',
        desc: 'Enjoy special offers for your next trip to Australia with Metrobank.',
        img: '/promos/metrobank/australia-metrobank.png',
      },
      {
        title: 'Dining Delights',
        desc: 'Savor exclusive dining deals at partner restaurants with your Metrobank card.',
        img: '/promos/metrobank/dining.webp',
      },
      {
        title: 'Shopping Spree',
        desc: 'Get rewarded for your shopping with Metrobank’s exclusive promos.',
        img: '/promos/metrobank/shoppingspree.jpg',
      },
    ],
  },
  {
    name: 'PNB',
    logo: '/banks/pnb.png',
    promoPage: 'https://www.pnb.com.ph/index.php/pnb-credit-card-promos?tpl=revamp',
    promos: [
      {
        title: 'PNB Credit Card Digital Acquisition Cash Rebate Promo',
        desc: 'Apply online for a PNB Mastercard and enjoy P5,000 Cash Rebate.',
        img: 'https://pnb-website.s3-ap-southeast-1.amazonaws.com/uploads/202005-MC-World-Elite.png',
      },
      {
        title: 'PNB-PAL Mabuhay Miles World Mastercard',
        desc: 'The card that lets you travel the world faster.',
        img: 'https://pnb-website.s3-ap-southeast-1.amazonaws.com/uploads/202005-M3-World.png',
      },
      {
        title: 'PNB-PAL Mabuhay Miles Platinum Mastercard',
        desc: 'The card that lets you travel the world faster.',
        img: 'https://pnb-website.s3-ap-southeast-1.amazonaws.com/uploads/202005-M3-Platinum.png',
      },
      {
        title: 'PNB Essentials Mastercard',
        desc: 'The card that gives you flexible reward options.',
        img: 'https://pnb-website.s3-ap-southeast-1.amazonaws.com/uploads/202005-MC-Essentials.png',
      },
      {
        title: 'PNB Platinum Mastercard',
        desc: 'The card that gives you flexible reward options.',
        img: 'https://pnb-website.s3-ap-southeast-1.amazonaws.com/uploads/202005-MC-Platinum.png',
      },
    ],
  },
  {
    name: 'Robinsons Bank',
    logo: '/banks/robinson.jpg',
    promoPage: 'https://www.robinsonsbank.com.ph/promos/',
    promos: [
      {
        title: 'Double the Savings (DOS) Promo',
        desc: 'Enjoy double the savings on select purchases with your Robinsons Bank credit card.',
        img: '/promos/robinsonsbank/DOS.jpg',
      },
      {
        title: 'Contactless Convenience',
        desc: 'Tap and pay easily with Robinsons Bank contactless cards at partner merchants.',
        img: '/promos/robinsonsbank/contactless.jpg',
      },
      {
        title: 'Cashback Card Rewards',
        desc: 'Earn cashback on your everyday spending with the Robinsons Bank Cashback Card.',
        img: '/promos/robinsonsbank/cashback-card.png',
      },
      {
        title: 'Special Promo Offers',
        desc: 'Check out the latest exclusive deals and discounts for Robinsons Bank cardholders.',
        img: '/promos/robinsonsbank/promo.webp',
      },
      {
        title: 'Easy Installment Plans',
        desc: 'Enjoy flexible installment options for your big purchases with Robinsons Bank.',
        img: '/promos/robinsonsbank/installment.jpg',
      },
    ],
  },
];

const Promos: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBankIdx, setSelectedBankIdx] = useState(0);
  const selectedBank = banks[selectedBankIdx];

  return (
    <div className="min-h-[60vh] bg-gray-100 flex flex-col">
      <button type="button" onClick={() => navigate(-1)} className="fixed top-4 left-4 z-30 flex items-center p-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 bg-white shadow" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
      <div className="flex-1 flex flex-row w-full max-w-7xl mx-auto px-10 h-auto md:h-screen items-start">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 pr-8 py-20 h-full">
          <div className="bg-white/80 border border-gray-200 rounded-2xl shadow-lg p-6 h-full flex flex-col backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 tracking-wide">Banks</h2>
            <ul className="space-y-2 flex-1">
              {banks.map((bank, idx) => (
                <li key={bank.name}>
                  <button
                    onClick={() => setSelectedBankIdx(idx)}
                    className={`w-full text-left px-4 py-2 rounded-xl font-semibold transition-all duration-150 text-base
                      ${selectedBankIdx === idx
                        ? 'bg-blue-100 text-blue-800 shadow border border-blue-300'
                        : 'bg-gray-100/70 text-gray-800 hover:bg-blue-50 hover:text-blue-700 border border-transparent'}
                    `}
                    style={{boxShadow: selectedBankIdx === idx ? '0 2px 8px 0 rgba(30, 64, 175, 0.08)' : undefined}}
                  >
                    {bank.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden">
          {/* Hamburger icon at top right */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 right-4 z-40 bg-blue-600 text-white rounded-full p-3 shadow flex items-center justify-center"
            aria-label="Open Banks Sidebar"
          >
            <Menu className="h-7 w-7" />
          </button>
          {/* Sidebar Drawer */}
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setSidebarOpen(false)} />
              {/* Drawer */}
              <div className="fixed top-0 right-0 h-full w-64 bg-white rounded-l-xl shadow-xl z-50 flex flex-col p-4 animate-slide-in">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 text-gray-700 hover:text-red-600 bg-gray-100 rounded-full p-2"
                  aria-label="Close Banks Sidebar"
                >
                  <X className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-bold text-gray-800 mb-4 mt-12">Banks</h2>
                <ul className="space-y-2">
                  {banks.map((bank, idx) => (
                    <li key={bank.name}>
                      <button
                        onClick={() => { setSelectedBankIdx(idx); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${selectedBankIdx === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-blue-100'}`}
                      >
                        {bank.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <style>{`
                @keyframes slide-in {
                  0% { transform: translateX(100%); opacity: 0; }
                  100% { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                  animation: slide-in 0.3s cubic-bezier(0.4,0,0.2,1) both;
                }
              `}</style>
            </>
          )}
        </div>
        {/* Main Content */}
        <main className="flex-1">
          <section className="mb-8">
            <div className="flex items-center mt-10 mb-6 justify-center">
              <img src={selectedBank.logo} alt={selectedBank.name} className="w-20 h-20 rounded-lg object-contain bg-gray-100 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">{selectedBank.name}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {selectedBank.promos.map((promo, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md flex flex-col overflow-hidden border border-gray-200 h-full"
                >
                  <div className="w-full h-48 overflow-hidden flex items-center justify-center bg-gray-50">
                    <img src={promo.img} alt={promo.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{promo.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex-1">{promo.desc}</p>
                    <div className="flex justify-between items-end mt-4">
                      <a
                        href={selectedBank.promoPage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Read More
                      </a>
                      <button
                        type="button"
                        onClick={() => navigate('/apply')}
                        className="ml-2 px-4 py-2 bg-blue-700 text-white rounded-full shadow hover:bg-blue-800 transition-colors font-semibold"
                        aria-label="Apply"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Promos; 