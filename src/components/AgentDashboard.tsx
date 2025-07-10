import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, Download, List, History, User, LogOut, Menu, X } from 'lucide-react';
import { useApplications } from '../context/ApplicationContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import Logo from '../assets/Company/Logo.png';

const AgentDashboard: React.FC = () => {
  const { applications } = useApplications();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [viewedApp, setViewedApp] = useState<any | null>(null);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debug log
  console.log('AgentDashboard applications:', applications);
  if (applications.length > 0) {
    console.log('First application object:', applications[0]);
  }

  // Filter applications submitted by this agent
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');

  const exportToPDF = () => {
    // This would normally generate a PDF report
    alert('PDF export functionality would be implemented here');
  };

  // Sidebar navigation
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <List className="w-5 h-5 mr-2" /> },
    { key: 'history', label: 'Application History', icon: <History className="w-5 h-5 mr-2" /> },
    { key: 'apply', label: 'Apply', icon: <Plus className="w-5 h-5 mr-2" /> },
  ];

  // Stepper for modal
  const modalSteps = [
    { title: 'Personal Details', number: 1 },
    { title: 'Address & Family', number: 2 },
    { title: 'Work Details', number: 3 },
    { title: 'Credit & Preferences', number: 4 },
  ];

  // Section renderers
  const renderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Agent Dashboard</h2>
      <p className="text-gray-600 mb-6">Welcome! Here are your application stats.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-blue-500 mr-2" /> <span className="font-semibold">Total Applications</span></div>
          <div className="text-2xl font-bold">{applications.length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-yellow-500 mr-2" /> <span className="font-semibold">Pending</span></div>
          <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-green-500 mr-2" /> <span className="font-semibold">Approved</span></div>
          <div className="text-2xl font-bold text-green-600">{approvedApplications.length}</div>
        </div>
      </div>
      {/* Quick Actions for Agent */}
      <div className="bg-white rounded-xl p-6 shadow mb-8 max-w-xl">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'dashboard' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-blue-700 border-transparent hover:bg-blue-100'}`} onClick={() => setActiveSection('dashboard')}><List className="w-5 h-5 mr-2" /> Dashboard</button>
          <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'history' ? 'bg-purple-50 text-purple-700 border-purple-400' : 'bg-white text-purple-700 border-transparent hover:bg-purple-100'}`} onClick={() => setActiveSection('history')}><History className="w-5 h-5 mr-2" /> Application History</button>
          <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'apply' ? 'bg-green-50 text-green-700 border-green-400' : 'bg-white text-green-700 border-transparent hover:bg-green-100'}`} onClick={() => setActiveSection('apply')}><Plus className="w-5 h-5 mr-2" /> Apply</button>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold">Application History</h2>
      </div>
      <div className="bg-white rounded-xl shadow-md w-full overflow-x-auto">
        <table className="w-full text-xs sm:text-sm md:text-base table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-center w-1/6">Client Name</th>
              <th className="px-2 py-3 text-center w-1/5">Email</th>
              <th className="px-2 py-3 text-center w-1/6">Mobile</th>
              <th className="px-2 py-3 text-center w-1/5">Submitted</th>
              <th className="px-2 py-3 text-center w-1/6">Status</th>
              <th className="px-2 py-3 text-center w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No applications found.
                </td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-2 py-4 text-center">
                    {(application.personal_details?.firstName || '') + ' ' + (application.personal_details?.lastName || '')}
                  </td>
                  <td className="px-2 py-4 text-center">{application.personal_details?.emailAddress || ''}</td>
                  <td className="px-2 py-4 text-center">{application.personal_details?.mobileNumber || ''}</td>
                  <td className="px-2 py-4 text-center">{application.submitted_at ? format(new Date(application.submitted_at), 'MMM dd, yyyy HH:mm') : ''}</td>
                  <td className="px-2 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-center font-medium">
                    <button
                      onClick={() => { setViewedApp(application); setCurrentModalStep(1); }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Application"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Read-only stepper modal for application details
  const renderModalStepIndicator = () => (
    <div className="mb-8">
      <div className="flex w-full justify-between items-end gap-2 md:gap-4 flex-wrap px-1 overflow-x-hidden">
        {modalSteps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                  currentModalStep >= step.number
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              <span className={`mt-1 text-xs md:text-base font-medium whitespace-nowrap truncate ${
                currentModalStep >= step.number ? 'text-blue-700' : 'text-gray-500'
              }`} style={{maxWidth: '6rem'}}>
                {step.title}
              </span>
            </div>
            {index < modalSteps.length - 1 && (
              <div className="flex-shrink-0 w-6 md:w-12 h-0.5 bg-gray-200 mx-1 md:mx-2 self-center" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderModalStepContent = (app: any) => {
    switch (currentModalStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Personal Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Last Name:</span> {app.personalDetails?.lastName}</div>
                <div><span className="font-medium">First Name:</span> {app.personalDetails?.firstName}</div>
                <div><span className="font-medium">Middle Name:</span> {app.personalDetails?.middleName}</div>
                <div><span className="font-medium">Suffix:</span> {app.personalDetails?.suffix}</div>
                <div><span className="font-medium">Date of Birth:</span> {app.personalDetails?.dateOfBirth}</div>
                <div><span className="font-medium">Place of Birth:</span> {app.personalDetails?.placeOfBirth}</div>
                <div><span className="font-medium">Gender:</span> {app.personalDetails?.gender}</div>
                <div><span className="font-medium">Civil Status:</span> {app.personalDetails?.civilStatus}</div>
                <div><span className="font-medium">Nationality:</span> {app.personalDetails?.nationality}</div>
                <div><span className="font-medium">Mobile Number:</span> {app.personalDetails?.mobileNumber}</div>
                <div><span className="font-medium">Home Number:</span> {app.personalDetails?.homeNumber}</div>
                <div><span className="font-medium">Email Address:</span> {app.personalDetails?.emailAddress}</div>
                <div><span className="font-medium">SSS/GSIS/UMID:</span> {app.personalDetails?.sssGsisUmid}</div>
                <div><span className="font-medium">TIN:</span> {app.personalDetails?.tin}</div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            {/* Mother's Maiden Name */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Mother's Maiden Name</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Last Name:</span> {app.motherDetails?.lastName}</div>
                <div><span className="font-medium">First Name:</span> {app.motherDetails?.firstName}</div>
                <div><span className="font-medium">Middle Name:</span> {app.motherDetails?.middleName}</div>
                <div><span className="font-medium">Suffix:</span> {app.motherDetails?.suffix}</div>
              </div>
            </div>
            {/* Permanent Address */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Permanent Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Street:</span> {app.permanentAddress?.street}</div>
                <div><span className="font-medium">Barangay:</span> {app.permanentAddress?.barangay}</div>
                <div><span className="font-medium">City:</span> {app.permanentAddress?.city}</div>
                <div><span className="font-medium">Zip Code:</span> {app.permanentAddress?.zipCode}</div>
                <div><span className="font-medium">Years of Stay:</span> {app.permanentAddress?.yearsOfStay}</div>
              </div>
            </div>
            {/* Spouse Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Spouse Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Last Name:</span> {app.spouseDetails?.lastName}</div>
                <div><span className="font-medium">First Name:</span> {app.spouseDetails?.firstName}</div>
                <div><span className="font-medium">Middle Name:</span> {app.spouseDetails?.middleName}</div>
                <div><span className="font-medium">Suffix:</span> {app.spouseDetails?.suffix}</div>
                <div><span className="font-medium">Mobile Number:</span> {app.spouseDetails?.mobileNumber}</div>
              </div>
            </div>
            {/* Personal Reference */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Last Name:</span> {app.personalReference?.lastName}</div>
                <div><span className="font-medium">First Name:</span> {app.personalReference?.firstName}</div>
                <div><span className="font-medium">Middle Name:</span> {app.personalReference?.middleName}</div>
                <div><span className="font-medium">Suffix:</span> {app.personalReference?.suffix}</div>
                <div><span className="font-medium">Mobile Number:</span> {app.personalReference?.mobileNumber}</div>
                <div><span className="font-medium">Relationship:</span> {app.personalReference?.relationship}</div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            {/* Work/Business Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Work/Business Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Business/Employer's Name:</span> {app.workDetails?.businessEmployerName}</div>
                <div><span className="font-medium">Profession/Occupation:</span> {app.workDetails?.professionOccupation}</div>
                <div><span className="font-medium">Nature of Business:</span> {app.workDetails?.natureOfBusiness}</div>
                <div><span className="font-medium">Department:</span> {app.workDetails?.department}</div>
                <div><span className="font-medium">Landline/Mobile:</span> {app.workDetails?.landlineMobile}</div>
                <div><span className="font-medium">Years in Business:</span> {app.workDetails?.yearsInBusiness}</div>
                <div><span className="font-medium">Monthly Income:</span> {app.workDetails?.monthlyIncome}</div>
                <div><span className="font-medium">Annual Income:</span> {app.workDetails?.annualIncome}</div>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Business/Office Address</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">Street:</span> {app.workDetails?.address?.street}</div>
                  <div><span className="font-medium">Barangay:</span> {app.workDetails?.address?.barangay}</div>
                  <div><span className="font-medium">City:</span> {app.workDetails?.address?.city}</div>
                  <div><span className="font-medium">Zip Code:</span> {app.workDetails?.address?.zipCode}</div>
                  <div><span className="font-medium">Unit/Floor:</span> {app.workDetails?.address?.unitFloor}</div>
                  <div><span className="font-medium">Building/Tower:</span> {app.workDetails?.address?.buildingTower}</div>
                  <div><span className="font-medium">Lot No.:</span> {app.workDetails?.address?.lotNo}</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            {/* Credit Card Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Credit Card Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Bank/Institution:</span> {app.creditCardDetails?.bankInstitution}</div>
                <div><span className="font-medium">Card Number:</span> {app.creditCardDetails?.cardNumber}</div>
                <div><span className="font-medium">Credit Limit:</span> {app.creditCardDetails?.creditLimit}</div>
                <div><span className="font-medium">Member Since:</span> {app.creditCardDetails?.memberSince}</div>
                <div><span className="font-medium">Exp. Date:</span> {app.creditCardDetails?.expirationDate}</div>
                <div><span className="font-medium">Deliver Card To:</span> {app.creditCardDetails?.deliverCardTo === 'home' ? 'Present Home Address' : 'Business Address'}</div>
                <div><span className="font-medium">Best Time to Contact:</span> {app.creditCardDetails?.bestTimeToContact}</div>
              </div>
            </div>
            {/* Bank Preferences */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Bank Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {app.bankPreferences && Object.entries(app.bankPreferences).filter(([_, v]) => v).map(([k]) => (
                  <span key={k} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
            {/* Status badge is always visible at top right in modal */}
          </div>
        );
      default:
        return null;
    }
  };

  // Handle Apply navigation
  if (activeSection === 'apply') {
    navigate('/agent/apply');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar Overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 ${sidebarOpen ? 'block sm:hidden' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-gradient-to-b from-[#101624] to-[#1a2236] text-white flex flex-col py-6 px-2 sm:px-6 min-h-fit shadow-xl transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 sm:static sm:w-64 sm:block`}
        style={{ minHeight: '100vh' }}
        aria-label="Sidebar"
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 sm:hidden text-white text-2xl z-50"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X />
        </button>
        <div>
          <div className="mb-10 flex flex-col items-center">
            <div className="bg-white rounded-full p-4 shadow-lg mb-4">
              <img src={Logo} alt="Company Logo" className="h-20 w-auto" />
            </div>
            <div className="text-xl font-extrabold tracking-wide text-blue-200 mb-1">SILVER CARD</div>
            <div className="text-xs text-gray-300 tracking-widest mb-2">SOLUTIONS</div>
            <div className="text-xs text-blue-100 font-semibold">Agent Portal</div>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold text-base group
                  ${activeSection === item.key
                    ? 'bg-blue-900/80 text-white shadow-md'
                    : 'hover:bg-blue-800/40 hover:text-blue-200 text-blue-100'}
                `}
              >
                <span className={`transition-colors ${activeSection === item.key ? 'text-blue-400' : 'group-hover:text-blue-300 text-blue-200'}`}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="my-8 border-t border-blue-900/40" />
        </div>
        {/* Footer removed here */}
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex flex-row items-center justify-between bg-white px-4 sm:px-8 py-4 border-b border-gray-100 relative">
          {/* Hamburger for mobile */}
          <button
            className="sm:hidden mr-2 text-gray-700 hover:text-blue-700 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-7 w-7" />
          </button>
          {/* Centered Title */}
          <div className="flex-1 flex flex-col items-center">
            <div className="text-xl font-bold text-gray-900">SilverCard</div>
            <div className="text-xs text-gray-500">Credit Card Management System</div>
          </div>
          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium ml-2"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        {/* Content */}
        <main className="flex-1 p-2 sm:p-8 overflow-x-visible">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'history' && renderHistory()}
        </main>
        {/* Read-only Application Details Modal */}
        {viewedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => { setViewedApp(null); setCurrentModalStep(1); }} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
              {viewedApp.status && (
                <span
                  className={`absolute top-3 right-12 px-3 py-1 rounded-full text-sm font-medium ${
                    viewedApp.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : viewedApp.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                  style={{ zIndex: 10 }}
                >
                  {viewedApp.status}
                </span>
              )}
              <h3 className="text-2xl font-bold mb-6">Application Details</h3>
              {/* Step content */}
              <div className="space-y-8">
                {currentModalStep === 1 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Last Name:</span> {viewedApp.personal_details?.lastName}</div>
                      <div><span className="font-medium">First Name:</span> {viewedApp.personal_details?.firstName}</div>
                      <div><span className="font-medium">Middle Name:</span> {viewedApp.personal_details?.middleName}</div>
                      <div><span className="font-medium">Suffix:</span> {viewedApp.personal_details?.suffix}</div>
                      <div><span className="font-medium">Date of Birth:</span> {viewedApp.personal_details?.dateOfBirth}</div>
                      <div><span className="font-medium">Place of Birth:</span> {viewedApp.personal_details?.placeOfBirth}</div>
                      <div><span className="font-medium">Gender:</span> {viewedApp.personal_details?.gender}</div>
                      <div><span className="font-medium">Civil Status:</span> {viewedApp.personal_details?.civilStatus}</div>
                      <div><span className="font-medium">Nationality:</span> {viewedApp.personal_details?.nationality}</div>
                      <div><span className="font-medium">Mobile Number:</span> {viewedApp.personal_details?.mobileNumber}</div>
                      <div><span className="font-medium">Home Number:</span> {viewedApp.personal_details?.homeNumber}</div>
                      <div><span className="font-medium">Email Address:</span> {viewedApp.personal_details?.emailAddress}</div>
                      <div><span className="font-medium">SSS/GSIS/UMID:</span> {viewedApp.personal_details?.sssGsisUmid}</div>
                      <div><span className="font-medium">TIN:</span> {viewedApp.personal_details?.tin}</div>
                    </div>
                  </div>
                )}
                {currentModalStep === 2 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-blue-700">Family & Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Mother's Last Name:</span> {viewedApp.mother_details?.lastName}</div>
                      <div><span className="font-medium">Mother's First Name:</span> {viewedApp.mother_details?.firstName}</div>
                      <div><span className="font-medium">Mother's Middle Name:</span> {viewedApp.mother_details?.middleName}</div>
                      <div><span className="font-medium">Mother's Suffix:</span> {viewedApp.mother_details?.suffix}</div>
                      <div><span className="font-medium">Street:</span> {viewedApp.permanent_address?.street}</div>
                      <div><span className="font-medium">Barangay:</span> {viewedApp.permanent_address?.barangay}</div>
                      <div><span className="font-medium">City:</span> {viewedApp.permanent_address?.city}</div>
                      <div><span className="font-medium">Province:</span> {viewedApp.permanent_address?.province}</div>
                      <div><span className="font-medium">Zip Code:</span> {viewedApp.permanent_address?.zipCode}</div>
                      <div><span className="font-medium">Years of Stay:</span> {viewedApp.permanent_address?.yearsOfStay}</div>
                      <div><span className="font-medium">Spouse Last Name:</span> {viewedApp.spouse_details?.lastName}</div>
                      <div><span className="font-medium">Spouse First Name:</span> {viewedApp.spouse_details?.firstName}</div>
                      <div><span className="font-medium">Spouse Middle Name:</span> {viewedApp.spouse_details?.middleName}</div>
                      <div><span className="font-medium">Spouse Suffix:</span> {viewedApp.spouse_details?.suffix}</div>
                      <div><span className="font-medium">Spouse Mobile Number:</span> {viewedApp.spouse_details?.mobileNumber}</div>
                      <div><span className="font-medium">Personal Reference Last Name:</span> {viewedApp.personal_reference?.lastName}</div>
                      <div><span className="font-medium">Personal Reference First Name:</span> {viewedApp.personal_reference?.firstName}</div>
                      <div><span className="font-medium">Personal Reference Middle Name:</span> {viewedApp.personal_reference?.middleName}</div>
                      <div><span className="font-medium">Personal Reference Suffix:</span> {viewedApp.personal_reference?.suffix}</div>
                      <div><span className="font-medium">Personal Reference Mobile Number:</span> {viewedApp.personal_reference?.mobileNumber}</div>
                      <div><span className="font-medium">Personal Reference Relationship:</span> {viewedApp.personal_reference?.relationship}</div>
                    </div>
                  </div>
                )}
                {currentModalStep === 3 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-blue-700">Work/Business Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Business/Employer's Name:</span> {viewedApp.work_details?.businessEmployerName}</div>
                      <div><span className="font-medium">Profession/Occupation:</span> {viewedApp.work_details?.professionOccupation}</div>
                      <div><span className="font-medium">Nature of Business:</span> {viewedApp.work_details?.natureOfBusiness}</div>
                      <div><span className="font-medium">Department:</span> {viewedApp.work_details?.department}</div>
                      <div><span className="font-medium">Landline/Mobile:</span> {viewedApp.work_details?.landlineMobile}</div>
                      <div><span className="font-medium">Years in Business:</span> {viewedApp.work_details?.yearsInBusiness}</div>
                      <div><span className="font-medium">Monthly Income:</span> {viewedApp.work_details?.monthlyIncome}</div>
                      <div><span className="font-medium">Annual Income:</span> {viewedApp.work_details?.annualIncome}</div>
                      <div><span className="font-medium">Street:</span> {viewedApp.work_details?.address?.street}</div>
                      <div><span className="font-medium">Barangay:</span> {viewedApp.work_details?.address?.barangay}</div>
                      <div><span className="font-medium">City:</span> {viewedApp.work_details?.address?.city}</div>
                      <div><span className="font-medium">Zip Code:</span> {viewedApp.work_details?.address?.zipCode}</div>
                      <div><span className="font-medium">Unit/Floor:</span> {viewedApp.work_details?.address?.unitFloor}</div>
                      <div><span className="font-medium">Building/Tower:</span> {viewedApp.work_details?.address?.buildingTower}</div>
                      <div><span className="font-medium">Lot No.:</span> {viewedApp.work_details?.address?.lotNo}</div>
                    </div>
                  </div>
                )}
                {currentModalStep === 4 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-blue-700">Credit Card & Bank Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Bank/Institution:</span> {viewedApp.credit_card_details?.bankInstitution}</div>
                      <div><span className="font-medium">Card Number:</span> {viewedApp.credit_card_details?.cardNumber}</div>
                      <div><span className="font-medium">Credit Limit:</span> {viewedApp.credit_card_details?.creditLimit}</div>
                      <div><span className="font-medium">Member Since:</span> {viewedApp.credit_card_details?.memberSince}</div>
                      <div><span className="font-medium">Exp. Date:</span> {viewedApp.credit_card_details?.expirationDate}</div>
                      <div><span className="font-medium">Deliver Card To:</span> {viewedApp.credit_card_details?.deliverCardTo === 'home' ? 'Present Home Address' : 'Business Address'}</div>
                      <div><span className="font-medium">Best Time to Contact:</span> {viewedApp.credit_card_details?.bestTimeToContact}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {viewedApp.bank_preferences && Object.entries(viewedApp.bank_preferences).filter(([_, v]) => v).map(([k]) => (
                        <span key={k} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {currentModalStep === 5 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-blue-700">File Links & Review</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">ID Photo URL:</span> {viewedApp.id_photo_url ? <a href={viewedApp.id_photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> : 'N/A'}</div>
                      <div><span className="font-medium">E-Signature URL:</span> {viewedApp.e_signature_url ? <a href={viewedApp.e_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> : 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
              {/* Stepper navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentModalStep(s => Math.max(1, s - 1))}
                  disabled={currentModalStep === 1}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (currentModalStep < 5) setCurrentModalStep(s => Math.min(5, s + 1));
                    else { setViewedApp(null); setCurrentModalStep(1); }
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg ${currentModalStep < 5 ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-green-600 text-white hover:bg-green-700'} text-sm`}
                >
                  {currentModalStep < 5 ? 'Next' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;