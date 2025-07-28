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
  '/contact',
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
    '/contact',
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
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-90vh max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={() => setShowTermsModal(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Terms and Conditions</h2>
            <div className="prose text-base mb-4 max-w-none">
              <p className="text-gray-700 mb-2 font-semibold">Silver Card Solutions Terms and Conditions</p>
              <p className="text-gray-600 mb-4"><strong>Date of Last Revision:</strong> July 2025</p>
              <p className="text-gray-700 mb-4">Silver Card Solutions (“Silver Card,” “we,” “our,” or “us”) provides financial assistance, comparison, and support services through our website and affiliated channels (collectively, the “Services”). These Terms and Conditions apply to anyone who uses our Services (“you” or “your”).</p>
              <p className="text-gray-700 mb-4">By using our Services, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please discontinue use immediately.</p>
              <ol className="list-decimal list-inside space-y-4 text-gray-700">
                <li>
                  <span className="font-semibold">General</span>
                  <p className="ml-4">Your access to and use of the Services is subject to these Terms, our Privacy Policy, and any additional terms that may apply. These may be updated from time to time without prior notice. Continued use of the Services after changes indicates your acceptance of the updated terms.</p>
                  <p className="ml-4">We reserve the right to modify, suspend, or terminate the Services at our sole discretion and without notice.</p>
                </li>
                <li>
                  <span className="font-semibold">Our Service</span>
                  <p className="ml-4">Silver Card Solutions provides an independent platform for comparing and applying for credit cards, loan products, insurance, and other financial offerings from third-party providers. We may also assist you offline (e.g., via phone consultations) at no cost to you.</p>
                  <ul className="list-disc ml-8">
                    <li>We are not a financial institution or insurer.</li>
                    <li>We do not provide financial advice.</li>
                    <li>Decisions regarding product applications are solely made by the third-party providers.</li>
                    <li>Our services are free to users; we may receive fees or commissions from providers for successful leads or conversions.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">About Silver Card Solutions</span>
                  <p className="ml-4">Silver Card Solutions is a comparison platform and marketing service. We work with licensed providers but are not directly involved in underwriting, insuring, or issuing financial products. All financial and insurance services presented on our platform are provided by licensed third parties.</p>
                  <p className="ml-4">We may receive commissions from these providers, and by using our Services, you agree to such arrangements.</p>
                </li>
                <li>
                  <span className="font-semibold">Information on Financial Products</span>
                  <p className="ml-4">Contracts entered into through our platform are between you and the product provider. We encourage you to:</p>
                  <ul className="list-disc ml-8">
                    <li>Read all terms and conditions carefully before purchasing.</li>
                    <li>Seek independent advice if necessary.</li>
                    <li>Understand that nothing on our Services constitutes an offer, guarantee, or binding agreement unless confirmed by the provider.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">Mobile Services</span>
                  <p className="ml-4">You may access the Services via mobile devices. Standard carrier charges may apply. By using mobile services, you consent to receiving notifications and updates via SMS or other mobile messaging platforms.</p>
                </li>
                <li>
                  <span className="font-semibold">Permitted Use</span>
                  <p className="ml-4">You agree to use the Services solely for personal, non-commercial purposes. You must not:</p>
                  <ul className="list-disc ml-8">
                    <li>Use the Services for unlawful, harmful, or fraudulent purposes.</li>
                    <li>Interfere with system security or integrity.</li>
                    <li>Copy, scrape, or redistribute content without our written consent.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">Your Responsibilities</span>
                  <p className="ml-4">You must ensure all information you provide is accurate, current, and complete. You are solely responsible for your conduct and any content you submit. Do not upload or submit anything that:</p>
                  <ul className="list-disc ml-8">
                    <li>Violates laws or third-party rights</li>
                    <li>Is false, misleading, or offensive</li>
                    <li>Contains malware or harmful code</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">Intellectual Property</span>
                  <p className="ml-4">All content on the Services is the intellectual property of Silver Card Solutions or its licensors. You may not copy, distribute, or use any content for commercial purposes without permission.</p>
                </li>
                <li>
                  <span className="font-semibold">License to Use Your Submissions</span>
                  <p className="ml-4">By submitting content, feedback, or suggestions to Silver Card Solutions, you grant us a royalty-free, irrevocable license to use them in any way, excluding personal data which is governed by our Privacy Policy.</p>
                </li>
                <li>
                  <span className="font-semibold">Exclusion of Liability</span>
                  <p className="ml-4">While we strive for accuracy, we do not guarantee that all information is error-free or up to date. You agree that:</p>
                  <ul className="list-disc ml-8">
                    <li>We are not liable for any financial decisions you make based on our content.</li>
                    <li>We do not warrant uninterrupted or error-free Services.</li>
                    <li>We are not liable for losses incurred due to third-party product issues.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">Third-Party Responsibility</span>
                  <p className="ml-4">Our platform may include links to third-party websites or services. We do not control these sites and are not responsible for their content, terms, or actions. Contracts you enter with third parties are entirely your responsibility.</p>
                </li>
                <li>
                  <span className="font-semibold">Jurisdiction</span>
                  <p className="ml-4">These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of Philippine courts.</p>
                </li>
                <li>
                  <span className="font-semibold">Complaints</span>
                  <p className="ml-4">For complaints related to our Services, you may contact our support team or visit our Help Center. We are available Monday to Friday, 9:00 AM to 6:00 PM (excluding holidays).</p>
                  <p className="ml-4">We cannot handle complaints on behalf of third-party providers. You must contact them directly for product or service issues.</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={() => setShowPrivacyModal(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Privacy Policy</h2>
            <div className="prose text-base mb-4 max-w-none">
              <p className="text-gray-700 mb-2 font-semibold">Silver Card Solutions Inc. – Privacy Policy</p>
              <p className="text-gray-600 mb-4">Date of Last Revision: <span className="font-medium">[July 2025]</span></p>
              <p className="text-gray-700 mb-4">Silver Card Solutions Inc. (“Silver Card”, “we”, “us”, or “our”) is committed to protecting your privacy and ensuring that your personal data is handled securely and in compliance with the Data Privacy Act of 2012 and all relevant data protection laws in the Philippines.</p>
              <p className="text-gray-700 mb-4">This Privacy Policy outlines how we collect, use, disclose, and safeguard your Personal Data when you visit our website, mobile applications, or interact with any of our services (collectively, the “Services”). By using our Services, you agree to the terms of this Privacy Policy.</p>
              <ol className="list-decimal list-inside space-y-4 text-gray-700">
                <li>
                  <span className="font-semibold">What is “Personal Data”?</span>
                  <p className="ml-4">"Personal Data" refers to any information that directly or indirectly identifies a living individual. This may include, but is not limited to, your name, contact details, identification documents, financial data, and other sensitive information.</p>
                </li>
                <li>
                  <span className="font-semibold">Information We Collect</span>
                  <ol className="list-[lower-alpha] list-inside ml-4 space-y-2">
                    <li>
                      <span className="font-semibold">Information You Provide Voluntarily</span>
                      <ul className="list-disc list-inside ml-4">
                        <li>Subscribe to newsletters or updates</li>
                        <li>Request product/service quotes</li>
                        <li>Apply for a product or service</li>
                        <li>Contact us via our support channels</li>
                        <li>Redeem a reward or promotional offer</li>
                      </ul>
                      <p className="ml-4 mt-2">Personal Data we may collect:</p>
                      <ul className="list-disc list-inside ml-8">
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Contact number</li>
                        <li>Date of birth</li>
                        <li>Gender, age, and nationality</li>
                        <li>Address and residency status</li>
                        <li>Financial data (income, bank details, etc.)</li>
                        <li>Identification details (e.g., passport, national ID)</li>
                        <li>Employment and educational background</li>
                        <li>Family member or beneficiary information (when applicable)</li>
                        <li>Information about your property or financial goals</li>
                      </ul>
                    </li>
                    <li>
                      <span className="font-semibold">Information Collected Automatically</span>
                      <ul className="list-disc list-inside ml-4">
                        <li>Device and browser specifications</li>
                        <li>IP address and location</li>
                        <li>Usage activity on our Services</li>
                        <li>Time spent on pages and links clicked</li>
                        <li>Referral source (e.g., the site you came from)</li>
                      </ul>
                      <p className="ml-4 mt-2">You may control cookies via your browser settings, but blocking cookies may limit certain functionalities.</p>
                    </li>
                    <li>
                      <span className="font-semibold">Information from Third Parties</span>
                      <ul className="list-disc list-inside ml-4">
                        <li>Verifying your identity</li>
                        <li>Enhancing service personalization</li>
                        <li>Facilitating partner transactions</li>
                      </ul>
                      <p className="ml-4 mt-2">We may receive additional information about you from partners, analytics providers, credit score agencies, and affiliates for these purposes.</p>
                    </li>
                  </ol>
                </li>
                <li>
                  <span className="font-semibold">How We Use Your Information</span>
                  <ul className="list-disc list-inside ml-4">
                    <li>Provide and personalize our Services</li>
                    <li>Communicate with you (e.g., alerts, inquiries)</li>
                    <li>Offer product or service recommendations</li>
                    <li>Process applications on your behalf</li>
                    <li>Enable access to forms, tools, and quote engines</li>
                    <li>Prevent fraud or misuse of our platform</li>
                    <li>Improve our marketing and customer engagement</li>
                    <li>Comply with legal and regulatory obligations</li>
                    <li>Conduct research and data analytics (anonymized when applicable)</li>
                  </ul>
                  <p className="ml-4 mt-2">If you apply for a product, we may share your data with third-party providers and credit scoring agencies (e.g., TransUnion, FinScore) to process your request or determine eligibility.</p>
                </li>
                <li>
                  <span className="font-semibold">Use of Cookies and Tracking Technologies</span>
                  <ul className="list-disc list-inside ml-4">
                    <li>Enhance user experience</li>
                    <li>Track service usage and preferences</li>
                    <li>Deliver personalized content and ads</li>
                  </ul>
                  <p className="ml-4 mt-2">We may also use Google Analytics, remarketing, and display features. You can opt out via <a href="https://www.google.com/settings/ads/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
                </li>
                <li>
                  <span className="font-semibold">Disclosure of Your Information</span>
                  <p className="ml-4">We may share your Personal Data with the following:</p>
                  <ul className="list-disc list-inside ml-8">
                    <li>Authorized Partners (e.g., banks, lenders, insurers)</li>
                    <li>Service Providers (IT, analytics, marketing, legal, etc.)</li>
                    <li>Government or Regulatory Authorities, if required by law</li>
                    <li>Affiliates or business partners for operational purposes</li>
                    <li>In the event of a corporate transaction (e.g., merger or acquisition)</li>
                  </ul>
                  <p className="ml-4 mt-2">All recipients are contractually bound to handle your data with the same level of confidentiality and security as outlined in this policy.</p>
                </li>
                <li>
                  <span className="font-semibold">International Transfers</span>
                  <p className="ml-4">Your data may be transferred outside of the Philippines. In such cases, we ensure that appropriate safeguards are in place to maintain the integrity and security of your Personal Data.</p>
                </li>
                <li>
                  <span className="font-semibold">Direct Marketing</span>
                  <p className="ml-4">With your consent, we may contact you via email, SMS, or phone to inform you about:</p>
                  <ul className="list-disc list-inside ml-8">
                    <li>New services or product features</li>
                    <li>Promotions or special offers</li>
                    <li>Newsletters or surveys</li>
                  </ul>
                  <p className="ml-4 mt-2">You may opt out of marketing communications at any time.</p>
                </li>
                <li>
                  <span className="font-semibold">Data Retention and Accuracy</span>
                  <p className="ml-4">We retain your Personal Data only as long as necessary for the purposes outlined above, and in compliance with applicable laws. You agree to keep your data accurate and up to date, and notify us of any changes.</p>
                </li>
                <li>
                  <span className="font-semibold">Security Measures</span>
                  <p className="ml-4">We adopt a Defense-in-Depth approach to protect your Personal Data from unauthorized access, disclosure, or misuse. While no system can be 100% secure, we use industry-standard encryption (such as SSL/TLS) and best practices to safeguard your data.</p>
                </li>
                <li>
                  <span className="font-semibold">Your Rights</span>
                  <ul className="list-disc list-inside ml-4">
                    <li>Access the Personal Data we hold about you</li>
                    <li>Request correction or deletion of inaccurate or outdated data</li>
                    <li>Object to or restrict processing</li>
                    <li>Withdraw consent (if applicable)</li>
                    <li>Opt out of direct marketing</li>
                  </ul>
                  <p className="ml-4 mt-2">To exercise these rights, please contact us through the details provided below.</p>
                </li>
                <li>
                  <span className="font-semibold">Use of Services by Minors</span>
                  <p className="ml-4">Our Services are not intended for users under 18 years old. We do not knowingly collect Personal Data from minors without verified parental or guardian consent.</p>
                </li>
                <li>
                  <span className="font-semibold">Third-Party Services and Payment Gateways</span>
                  <p className="ml-4">If you proceed with third-party services (e.g., via direct links or embedded forms), your data will be governed by the third-party's own privacy policy. For payments, we utilize Paynamics Technologies Inc. and its PCI-DSS compliant gateway, Paygate, for secure transactions.</p>
                </li>
                <li>
                  <span className="font-semibold">Feedback and Service Improvement</span>
                  <p className="ml-4">We may request feedback to improve our Services. Your responses will be handled per this Privacy Policy unless otherwise stated.</p>
                </li>
                <li>
                  <span className="font-semibold">Changes to this Privacy Policy</span>
                  <p className="ml-4">Silver Card Solutions Inc. reserves the right to update this Privacy Policy to reflect changes in our operations or legal requirements. The “last revised” date will always be indicated. Continued use of our Services constitutes your acceptance of the updated Privacy Policy.</p>
                </li>
                <li>
                  <span className="font-semibold">Contact Us</span>
                  <p className="ml-4">For questions, concerns, or requests regarding your Personal Data, you may reach us at:</p>
                  <ul className="list-none ml-8">
                    <li>📞 <span className="font-semibold">Phone:</span> 285518750</li>
                    <li>🏢 <span className="font-semibold">Address:</span> 2/F Unit 3, PBE Building, 14 Balete Drive, Quezon City, Philippines</li>
                    <li>📩 <span className="font-semibold">Email:</span> silvercard.202504@gmail.com</li>
                    <li>🛠️ <span className="font-semibold">Help Center:</span> support@teamscsolutions.com</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;