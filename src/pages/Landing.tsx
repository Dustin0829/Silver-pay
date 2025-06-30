import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Users, Star, CreditCard, CheckCircle, ArrowRight, TrendingUp, Award, Zap } from 'lucide-react';
import Header from '../components/Header';
import RCBCLogo from '../assets/banks/RCBC.jpg';
import MetrobankLogo from '../assets/banks/metrobank.jpeg';
import EastWestLogo from '../assets/banks/eastwest.webp';
import SecurityBankLogo from '../assets/banks/securitybank.jpg';
import BPILogo from '../assets/banks/bpi.jpg';
import PNBLogo from '../assets/banks/pnb.png';
import RobinsonLogo from '../assets/banks/robinson.jpg';
import MaybankLogo from '../assets/banks/maybank.png';
import AUBLogo from '../assets/banks/AUB.jpg';

const Landing: React.FC = () => {
  const partnerBanks = [
    { name: 'RCBC', logo: RCBCLogo },
    { name: 'Metrobank', logo: MetrobankLogo },
    { name: 'EastWest Bank', logo: EastWestLogo },
    { name: 'Security Bank', logo: SecurityBankLogo },
    { name: 'BPI', logo: BPILogo },
    { name: 'PNB', logo: PNBLogo },
    { name: 'Robinson Bank', logo: RobinsonLogo },
    { name: 'Maybank', logo: MaybankLogo },
    { name: 'AUB', logo: AUBLogo },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="h-4 w-4 mr-2" />
                Trusted by 50,000+ Filipinos
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your Gateway to{' '}
                  <span className="text-blue-600">Premium</span>{' '}
                  Credit Cards
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Apply for credit cards from the Philippines' top banks through our 
                  secure platform. Fast approval, competitive rates, and expert 
                  guidance every step of the way.
                </p>
              </div>

              {/* CTA Button */}
              <Link
                to="/apply"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50,000+</div>
                  <div className="text-sm text-gray-600 mt-1">Applications<br />Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600 mt-1">Approval Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24hrs</div>
                  <div className="text-sm text-gray-600 mt-1">Average Processing<br />Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">9</div>
                  <div className="text-sm text-gray-600 mt-1">Banking Partners</div>
                </div>
              </div>
            </div>

            {/* Right Content - Credit Card Visual */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Credit Card */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-8 text-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 w-85 h-80 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-2xl font-bold">Silver Pay</div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-2xl font-mono tracking-wider -mt-30">
                      •••• •••• •••• 1234
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-blue-200 uppercase tracking-wide">Valid Thru</div>
                        <div className="text-lg font-semibold">12/28</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-blue-200 uppercase tracking-wide">Cardholder</div>
                        <div className="text-lg font-semibold">Juan Dela Cruz</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Card */}
                <div className="absolute top-4 left-4 w-80 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl -z-10 opacity-60"></div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                Fast Approval
              </div>
              <div className="absolute -bottom-8 -left-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                Secure Platform
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full -translate-y-48 translate-x-48 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full translate-y-32 -translate-x-32 opacity-20"></div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive credit card solutions tailored to your needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CreditCard className="h-12 w-12 text-blue-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Credit Card Applications</h3>
              <p className="text-gray-600 mb-6">Apply for premium credit cards from the Philippines' top banks with exclusive benefits and competitive rates.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Multiple bank partnerships
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Competitive interest rates
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Flexible credit limits
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <Clock className="h-12 w-12 text-green-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Fast Processing</h3>
              <p className="text-gray-600 mb-6">Get your application processed quickly with our streamlined system and direct bank connections.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  24-hour processing time
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Real-time status updates
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Instant notifications
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <Users className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Expert Support</h3>
              <p className="text-gray-600 mb-6">Dedicated support team to guide you through every step of the application process.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Personal account managers
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Financial consultation
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Multilingual assistance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

       {/* Partner Banks Section */}
       <section className="py-16 bg-white border-b border-gray-100">
        <div className="w-full px-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Banking Partners</h2>
            <p className="text-lg text-gray-600">We work with the Philippines' leading financial institutions</p>
          </div>
          <div className="relative overflow-hidden w-full">
            <div
              className="flex items-center gap-4 sm:gap-8 md:gap-16 animate-infinite-scroll whitespace-nowrap"
              style={{
                animation: window.innerWidth < 640 ? 'infinite-scroll 15s linear infinite' : 'infinite-scroll 30s linear infinite'
              }}
            >
              {partnerBanks.concat(partnerBanks).map((bank, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={bank.logo}
                    alt={bank.name + ' logo'}
                    className="h-24 w-24 sm:h-40 sm:w-40 md:h-60 md:w-60 object-contain inline-block"
                    style={{ maxHeight: window.innerWidth < 640 ? '6rem' : window.innerWidth < 768 ? '10rem' : '15rem', minWidth: '80px' }}
                  />
                  <div className="mt-2 text-xs sm:text-base md:text-lg font-semibold text-gray-800 text-center w-24 sm:w-40 md:w-60 truncate">{bank.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied customers who trust Silver Pay</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Silver Pay made getting my first credit card incredibly easy! The process was smooth, 
                transparent, and I got approved within 2 days. Their team was very professional and helpful."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">MR</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Maria Rodriguez</p>
                  <p className="text-sm text-gray-500">Marketing Manager</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Outstanding service! They helped me compare different credit cards and find the perfect one 
                for my business needs. The approval was fast and the support team was always available."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">JS</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">John Santos</p>
                  <p className="text-sm text-gray-500">Business Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "I was impressed with how professional and efficient Silver Pay is. They guided me through 
                every step and made sure I understood all the terms. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">AC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Anna Chen</p>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Your Premium Credit Card?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join over 50,000 satisfied customers who have successfully obtained their credit cards through Silver Pay. 
            Start your application today and get approved in 24 hours.
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 Silver Pay. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;