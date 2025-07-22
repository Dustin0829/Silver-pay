import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const clientFooterRoutes = [
  '/',
  '/application-success',
  '/privacy-policy',
  '/terms-of-service',
  '/credit-cards',
  '/promos',
  '/jobs',
];

const Layout: React.FC = () => {
  const location = useLocation();
  const showFooter = clientFooterRoutes.includes(location.pathname);
  const showHeader = [
    '/',
    '/login',
    '/apply',
    '/application-success',
    '/privacy-policy',
    '/terms-of-service',
    '/credit-cards',
    '/promos',
    '/jobs',
  ].includes(location.pathname);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer
        onShowTerms={() => setShowTermsModal(true)}
        onShowPrivacy={() => setShowPrivacyModal(true)}
      />}
      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-90vh max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={() => setShowTermsModal(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Terms and Conditions</h2>
            <div className="prose text-base mb-4 max-w-none">
              <p><strong>Silver Card Solutions Terms and Conditions</strong></p>
              <p><strong>Date of Last Revision:</strong> July 2025</p>
              <p>Silver Card Solutions (“Silver Card,” “we,” “our,” or “us”) provides financial assistance, comparison, and support services through our website and affiliated channels (collectively, the “Services”). These Terms and Conditions apply to anyone who uses our Services (“you” or “your”).</p>
              <p>By using our Services, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please discontinue use immediately.</p>
              <h3 className="font-bold mt-6">1. General</h3>
              <p>Your access to and use of the Services is subject to these Terms, our Privacy Policy, and any additional terms that may apply. These may be updated from time to time without prior notice. Continued use of the Services after changes indicates your acceptance of the updated terms.</p>
              <p>We reserve the right to modify, suspend, or terminate the Services at our sole discretion and without notice.</p>
              <h3 className="font-bold mt-6">2. Our Service</h3>
              <p>Silver Card Solutions provides an independent platform for comparing and applying for credit cards, loan products, insurance, and other financial offerings from third-party providers. We may also assist you offline (e.g., via phone consultations) at no cost to you.</p>
              <ul className="list-disc ml-6">
                <li>We are not a financial institution or insurer.</li>
                <li>We do not provide financial advice.</li>
                <li>Decisions regarding product applications are solely made by the third-party providers.</li>
                <li>Our services are free to users; we may receive fees or commissions from providers for successful leads or conversions.</li>
              </ul>
              <h3 className="font-bold mt-6">3. About Silver Card Solutions</h3>
              <p>Silver Card Solutions is a comparison platform and marketing service. We work with licensed providers but are not directly involved in underwriting, insuring, or issuing financial products. All financial and insurance services presented on our platform are provided by licensed third parties.</p>
              <p>We may receive commissions from these providers, and by using our Services, you agree to such arrangements.</p>
              <h3 className="font-bold mt-6">4. Information on Financial Products</h3>
              <p>Contracts entered into through our platform are between you and the product provider. We encourage you to:</p>
              <ul className="list-disc ml-6">
                <li>Read all terms and conditions carefully before purchasing.</li>
                <li>Seek independent advice if necessary.</li>
                <li>Understand that nothing on our Services constitutes an offer, guarantee, or binding agreement unless confirmed by the provider.</li>
              </ul>
              <h3 className="font-bold mt-6">5. Mobile Services</h3>
              <p>You may access the Services via mobile devices. Standard carrier charges may apply. By using mobile services, you consent to receiving notifications and updates via SMS or other mobile messaging platforms.</p>
              <h3 className="font-bold mt-6">6. Permitted Use</h3>
              <p>You agree to use the Services solely for personal, non-commercial purposes. You must not:</p>
              <ul className="list-disc ml-6">
                <li>Use the Services for unlawful, harmful, or fraudulent purposes.</li>
                <li>Interfere with system security or integrity.</li>
                <li>Copy, scrape, or redistribute content without our written consent.</li>
              </ul>
              <h3 className="font-bold mt-6">7. Your Responsibilities</h3>
              <p>You must ensure all information you provide is accurate, current, and complete. You are solely responsible for your conduct and any content you submit. Do not upload or submit anything that:</p>
              <ul className="list-disc ml-6">
                <li>Violates laws or third-party rights</li>
                <li>Is false, misleading, or offensive</li>
                <li>Contains malware or harmful code</li>
              </ul>
              <h3 className="font-bold mt-6">8. Intellectual Property</h3>
              <p>All content on the Services is the intellectual property of Silver Card Solutions or its licensors. You may not copy, distribute, or use any content for commercial purposes without permission.</p>
              <h3 className="font-bold mt-6">9. License to Use Your Submissions</h3>
              <p>By submitting content, feedback, or suggestions to Silver Card Solutions, you grant us a royalty-free, irrevocable license to use them in any way, excluding personal data which is governed by our Privacy Policy.</p>
              <h3 className="font-bold mt-6">10. Exclusion of Liability</h3>
              <p>While we strive for accuracy, we do not guarantee that all information is error-free or up to date. You agree that:</p>
              <ul className="list-disc ml-6">
                <li>We are not liable for any financial decisions you make based on our content.</li>
                <li>We do not warrant uninterrupted or error-free Services.</li>
                <li>We are not liable for losses incurred due to third-party product issues.</li>
              </ul>
              <h3 className="font-bold mt-6">11. Third-Party Responsibility</h3>
              <p>Our platform may include links to third-party websites or services. We do not control these sites and are not responsible for their content, terms, or actions. Contracts you enter with third parties are entirely your responsibility.</p>
              <h3 className="font-bold mt-6">12. Jurisdiction</h3>
              <p>These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of Philippine courts.</p>
              <h3 className="font-bold mt-6">13. Complaints</h3>
              <p>For complaints related to our Services, you may contact our support team or visit our Help Center. We are available Monday to Friday, 9:00 AM to 6:00 PM (excluding holidays).</p>
              <p>We cannot handle complaints on behalf of third-party providers. You must contact them directly for product or service issues.</p>
            </div>
          </div>
        </div>
      )}
      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={() => setShowPrivacyModal(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Privacy Policy</h2>
            <div className="prose text-base mb-4 max-w-none">
              [Privacy Policy content goes here.]
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;