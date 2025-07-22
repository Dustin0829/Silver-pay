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
        title: 'Spend Anywhere & Get FREE Red Ribbon Baked Goodies',
        desc: 'Spend with your RCBC JCB Credit Card and get free Red Ribbon treats for qualified purchases.',
        img: 'https://rcbccredit.com/uploads/rr1_20230831104035000-76dc611d6ebaafc66cc0879c71b5db5c.png',
      },
      {
        title: 'Welcome Gift for New RCBC Mastercard Credit Cardholders',
        desc: 'Apply for a new RCBC Mastercard and get a Nike Park eGift or Marshall Earbuds/Speaker as a welcome gift.',
        img: 'https://rcbccredit.com/uploads/RCBC-World-Mastercard_20221109180849000-8d5e957f297893487bd98fa830fa6413.png',
      },
      {
        title: 'Spend Anywhere & Get FREE Greenwich Treats',
        desc: 'Spend with your RCBC Mastercard and get free Greenwich meals for qualified purchases.',
        img: 'https://rcbccredit.com/uploads/MC-GW-1_20230904190527000-fc221309746013ac554571fbd180e1c8.png',
      },
      {
        title: 'Up to ₱8,000 Cashback with RCBC Credit Card',
        desc: 'Register and spend with your RCBC Credit Card to earn up to ₱8,000 cashback.',
        img: 'https://rcbccredit.com/img/card/RCBC-World-Mastercard.png',
      },
      {
        title: 'FREE US$200 Cathay Pacific Voucher Welcome Gift',
        desc: 'Get a free US$200 Cathay Pacific voucher with your new RCBC Visa Platinum Credit Card.',
        img: 'https://rcbccredit.com/img/card/visa-platinum.png',
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

const Promos: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBankIdx, setSelectedBankIdx] = useState(0);
  const selectedBank = banks[selectedBankIdx];

  return (
    <div className="min-h-[60vh] bg-gray-100 flex flex-col">
      <button type="button" onClick={() => navigate(-1)} className="fixed top-4 left-4 z-30 flex items-center p-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 bg-white shadow" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
      <div className="flex-1 flex flex-row w-full max-w-7xl mx-auto py-8 px-2">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 pr-6">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Banks</h2>
            <ul className="space-y-2">
              {banks.map((bank, idx) => (
                <li key={bank.name}>
                  <button
                    onClick={() => setSelectedBankIdx(idx)}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${selectedBankIdx === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-blue-100'}`}
                  >
                    {bank.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden flex flex-col mr-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow"
          >
            {sidebarOpen ? 'Close Banks' : 'Show Banks'}
          </button>
          {sidebarOpen && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-4 z-40 absolute left-2 top-20 w-56">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Banks</h2>
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
          )}
        </div>
        {/* Main Content */}
        <main className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in">Bank Partner Promos</h1>
          <section className="mb-8">
            <div className="flex items-center mb-6 justify-center">
              <img src={selectedBank.logo} alt={selectedBank.name} className="w-14 h-14 rounded-lg object-contain bg-gray-100 mr-4" />
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
                    <a
                      href={selectedBank.promoPage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-medium hover:underline mt-auto"
                    >
                      Read More
                    </a>
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