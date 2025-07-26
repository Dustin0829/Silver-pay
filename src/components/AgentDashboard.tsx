import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, Download, List, History, User, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { useLoading } from '../context/LoadingContext';
// import Logo from '../assets/Company/Logo.png';

const AgentDashboard: React.FC = () => {
  console.log('Input rendered!');
  const [applications, setApplications] = useState<any[]>([]); // merged applications
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [viewedApp, setViewedApp] = useState<any | null>(null);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [users, setUsers] = useState<any[]>([]); // Add users state
  const [totalApplicationsCount, setTotalApplicationsCount] = useState(0);
  const { setLoading } = useLoading();

  // Debug log
  console.log('[DEBUG] applications:', applications);
  if (applications.length > 0) {
    console.log('First application object:', applications[0]);
  }
  console.log('[DEBUG] search value:', nameFilter);

  // Fetch all applications from Supabase (like admin)
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      setLoading(true);
      // Fetch applications (first 1000 for display)
      const { data: kycData, error: kycError } = await supabase.from('kyc_details').select('*').limit(1000);
      // Fetch total count efficiently
      const { count, error: countError } = await supabase
        .from('kyc_details')
        .select('*', { count: 'exact', head: true });
      if (!countError && isMounted) setTotalApplicationsCount(count || 0);
      const { data: userData, error: userError } = await supabase.from('users').select('*');
      
      // Helper function to parse relative name
      const parseRelativeName = (relativeName: string) => {
        if (!relativeName) return { firstName: '', middleName: '', lastName: '', suffix: '' };
        const parts = relativeName.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const nameParts = parts[1].split(' ').filter(p => p);
          return {
            lastName: parts[0] || '',
            firstName: nameParts[0] || '',
            middleName: nameParts.slice(1, -1).join(' ') || '',
            suffix: nameParts[nameParts.length - 1] || '',
          };
        }
        return { firstName: '', middleName: '', lastName: '', suffix: '' };
      };

      // Helper function to parse address
      const parseAddress = (address: string) => {
        if (!address) return { street: '', barangay: '', city: '', zipCode: '', province: '' };
        const parts = address.split(',').map(p => p.trim());
        return {
          street: parts[0] || '',
          barangay: parts[1] || '',
          city: parts[2] || '',
          zipCode: parts[3] || '',
          province: parts[4] || '',
        };
      };

      // Helper function to parse business address
      const parseBusinessAddress = (address: string) => {
        if (!address) return { street: '', barangay: '', city: '', zipCode: '', unitFloor: '', buildingTower: '', lotNo: '' };
        const parts = address.split(',').map(p => p.trim());
        return {
          street: parts[0] || '',
          barangay: parts[1] || '',
          city: parts[2] || '',
          zipCode: parts[3] || '',
          unitFloor: parts[4] || '',
          buildingTower: parts[5] || '',
          lotNo: parts[6] || '',
        };
      };

      // Helper function to parse personal reference
      const parsePersonalReference = (reference: string) => {
        if (!reference) return { firstName: '', middleName: '', lastName: '', suffix: '', mobileNumber: '', relationship: '' };
        const match = reference.match(/^(.+?),\s*(.+?)\s+\((.+?)\)\s+(.+)$/);
        if (match) {
          const nameParts = match[2].split(' ').filter(p => p);
          return {
            lastName: match[1] || '',
            firstName: nameParts[0] || '',
            middleName: nameParts.slice(1, -1).join(' ') || '',
            suffix: nameParts[nameParts.length - 1] || '',
            relationship: match[3] || '',
            mobileNumber: match[4] || '',
          };
        }
        return { firstName: '', middleName: '', lastName: '', suffix: '', mobileNumber: '', relationship: '' };
      };

      // Helper function to parse bank preferences
      const parseBankPreferences = (bankApplied: string) => {
        if (!bankApplied) return {};
        const banks = bankApplied.split(',').map(b => b.trim().toLowerCase());
        return {
          rcbc: banks.includes('rcbc'),
          metrobank: banks.includes('metrobank'),
          eastWestBank: banks.includes('eastwestbank'),
          securityBank: banks.includes('securitybank'),
          bpi: banks.includes('bpi'),
          pnb: banks.includes('pnb'),
          robinsonBank: banks.includes('robinsonbank'),
          maybank: banks.includes('maybank'),
          aub: banks.includes('aub'),
        };
      };

      const normalizedKyc = (kycData || []).map((k: any) => {
        const permanentAddress = parseAddress(k.address);
        const businessAddress = parseBusinessAddress(k.business_address);
        const motherDetails = parseRelativeName(k.relative_name);
        const spouseDetails = parseRelativeName(k.relative2_name);
        const personalReference = parsePersonalReference(k.relative3_name);
        const bankPreferences = parseBankPreferences(k.bank_applied);

        return {
          id: `kyc-${k.id}`,
          personal_details: {
            firstName: k.first_name || '',
            lastName: k.last_name || '',
            middleName: k.middle_name || '',
            suffix: k.suffix || '',
            dateOfBirth: k.date_of_birth || '',
            placeOfBirth: k.place_of_birth || '',
            gender: k.gender || '',
            civilStatus: k.civil_status || '',
            nationality: k.nationality || '',
            mobileNumber: k.mobile_number || '',
            homeNumber: k.home_number || '',
            emailAddress: k.email_address || '',
            sssGsisUmid: k.sss_gsis_umid || '',
            tin: k.tin || '',
          },
          mother_details: motherDetails,
          permanent_address: {
            ...permanentAddress,
            yearsOfStay: k.years_of_stay || '',
          },
          spouse_details: {
            ...spouseDetails,
            mobileNumber: k.spouse_mobile_number || '',
          },
          personal_reference: personalReference,
          work_details: {
            businessEmployerName: k.business || '',
            professionOccupation: k.profession || '',
            natureOfBusiness: k.nature_of_business || '',
            department: k.department || '',
            landlineMobile: k.contact_number || '',
            yearsInBusiness: k.years_in_business || '',
            monthlyIncome: k.monthly_income || '',
            annualIncome: k.annual_income || '',
            address: businessAddress,
          },
          credit_card_details: {
            bankInstitution: k.bank_institution || '',
            cardNumber: k.card_number || '',
            creditLimit: k.credit_limit || '',
            memberSince: k.member_since || '',
            expirationDate: k.expiry_date || '',
            deliverCardTo: k.deliver_card_to || '',
            bestTimeToContact: k.best_time_to_contact || '',
          },
          bank_preferences: bankPreferences,
          id_photo_url: k.id_photo_url || '',
          e_signature_url: k.e_signature_url || '',
          status: k.status || null,
          submitted_by: k.agent || '',
          agent: k.agent || '',
          submitted_at: k.submitted_at || null,
        };
      });
      
      if (isMounted) {
        setApplications(normalizedKyc);
        setUsers(userData || []);
      }
      setLoading(false);
    };
    fetchAllData();
    const channel = supabase
      .channel('realtime:kyc_details')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kyc_details' },
        (payload) => { fetchAllData(); }
      )
      .subscribe();
    return () => { isMounted = false; supabase.removeChannel(channel); };
  }, []);

  const exportToPDF = () => {
    // This would normally generate a PDF report
    alert('PDF export functionality would be implemented here');
  };

  // 1. Sidebar navigation (match AdminDashboard)
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
    { title: 'Documents', number: 5 },
  ];

  // Section renderers
  const renderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Agent Dashboard</h2>
      <p className="text-gray-600 mb-6">Welcome! Here are your application stats.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-blue-500 mr-2" /> <span className="font-semibold">Total Applications</span></div>
          <div className="text-2xl font-bold">{totalApplicationsCount}</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-yellow-500 mr-2" /> <span className="font-semibold">Pending</span></div>
          <div className="text-2xl font-bold text-yellow-600">{applications.filter(app => app.status === 'pending').length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-green-500 mr-2" /> <span className="font-semibold">Approved</span></div>
          <div className="text-2xl font-bold text-green-600">{applications.filter(app => app.status === 'approved').length}</div>
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

  const filteredApplications = applications.filter(app => {
    const search = nameFilter.trim().toLowerCase();
    let matchesSearch = true;
    if (search) {
      // Agent name from both possible fields
      const agentName1 = (app.submitted_by ?? '').toLowerCase();
      const agentName2 = (app.agent ?? '').toLowerCase();
      
      // Find agent in users for bank code search
      const agent = users.find((u: any) =>
        u.name?.toLowerCase() === agentName1 ||
        u.email?.toLowerCase() === agentName1 ||
        u.name?.toLowerCase() === agentName2 ||
        u.email?.toLowerCase() === agentName2
      );
      
      const agentName = agent?.name?.toLowerCase() || '';
      
      // Bank codes from agent - improved search
      let bankCodes = '';
      let bankNames = '';
      if (agent && Array.isArray(agent.bank_codes)) {
        bankCodes = agent.bank_codes.map((entry: any) => (entry.code || '').toLowerCase()).join(' ');
        bankNames = agent.bank_codes.map((entry: any) => (entry.bank || '').toLowerCase()).join(' ');
      }
      
      // Also search in bank preferences from the application itself
      const appBankPreferences = app.bank_preferences ? Object.keys(app.bank_preferences).filter(k => app.bank_preferences[k]).join(' ').toLowerCase() : '';
      
      matchesSearch =
        agentName1.includes(search) ||
        agentName2.includes(search) ||
        agentName.includes(search) ||
        bankCodes.includes(search) ||
        bankNames.includes(search) ||
        appBankPreferences.includes(search);
    }
    // Status filter
    let matchesStatus = true;
    if (statusFilter) {
      matchesStatus = (app.status || '').toLowerCase() === statusFilter.toLowerCase();
    }
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...applications].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  const sortedFilteredApplications = [...filteredApplications].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  const visibleApplications = sortedFilteredApplications.slice(0, visibleCount);

  const renderHistory = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Application History</h2>
      <p className="text-gray-600 mb-6">View and filter application records</p>
      <div className="bg-white rounded-xl p-6 shadow mb-6 w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row gap-4 w-full mb-4 items-start sm:items-end">
          <input
            className="border rounded-lg px-3 py-2 w-full sm:w-1/2 mb-2 sm:mb-0"
            placeholder="Search by applicant name, agent name, bank codes, or bank preferences..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                console.log('[DEBUG][ENTER] search value:', nameFilter);
                console.log('[DEBUG][ENTER] applications:', applications);
              }
            }}
          />
        </div>
        <div className="flex gap-4 w-full mt-2">
          <select className="border rounded-lg px-3 py-2 w-1/2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="turn-in">Turn-in</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      {/* Desktop Table */}
      <table className="w-full text-xs sm:text-sm md:text-base table-fixed hidden sm:table">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase">
            <th className="py-2">Applicant</th>
            <th className="py-2 min-w-[150px] px-4">Date & Time</th>
            <th className="py-2">Status</th>
            <th className="py-2">Submitted By</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleApplications.map((app, i) => (
            <tr key={i} className="border-t">
              <td className="py-3">{app.personal_details?.firstName ?? ''} {app.personal_details?.lastName ?? ''}</td>
              <td className="py-3 px-6 min-w-[170px] whitespace-nowrap text-sm">{app.submitted_at ? format(new Date(app.submitted_at), 'MMM dd, yyyy HH:mm') : ''}</td>
              <td className="py-3 px-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : app.status === 'submitted' ? 'bg-blue-100 text-blue-800' : app.status === 'turn-in' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>{app.status}</span></td>
              <td className="py-3">{app.submitted_by || app.agent || 'direct'}</td>
              <td className="py-3 flex space-x-2">
                <button
                  onClick={() => { setViewedApp(app); setCurrentModalStep(1); }}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="View Application"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile Card Layout */}
      <div className="block sm:hidden">
        {visibleApplications.map((app, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
            <div className="font-semibold text-lg mb-1">{app.personal_details?.firstName ?? ''} {app.personal_details?.lastName ?? ''}</div>
            <div className="text-xs text-gray-500 mb-1">Date: {app.submitted_at ? format(new Date(app.submitted_at), 'MMM dd, yyyy HH:mm') : ''}</div>
            <div className="mb-1 text-sm"><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : app.status === 'submitted' ? 'bg-blue-100 text-blue-800' : app.status === 'turn-in' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>{app.status}</span></div>
            <div className="mb-1 text-sm"><span className="font-medium">Submitted By:</span> {app.submitted_by || app.agent || 'direct'}</div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { setViewedApp(app); setCurrentModalStep(1); }}
                className="text-blue-600 hover:text-blue-900 p-1"
                title="View Application"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filteredApplications.length > visibleCount && (
        <div className="flex justify-center mt-4">
          <button onClick={() => setVisibleCount(c => c + 20)} className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700" title="See More">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
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
                <div><span className="font-medium">Last Name:</span> {app.personal_details?.lastName}</div>
                <div><span className="font-medium">First Name:</span> {app.personal_details?.firstName}</div>
                <div><span className="font-medium">Middle Name:</span> {app.personal_details?.middleName}</div>
                <div><span className="font-medium">Suffix:</span> {app.personal_details?.suffix}</div>
                <div><span className="font-medium">Date of Birth:</span> {app.personal_details?.dateOfBirth}</div>
                <div><span className="font-medium">Place of Birth:</span> {app.personal_details?.placeOfBirth}</div>
                <div><span className="font-medium">Gender:</span> {app.personal_details?.gender}</div>
                <div><span className="font-medium">Civil Status:</span> {app.personal_details?.civilStatus}</div>
                <div><span className="font-medium">Nationality:</span> {app.personal_details?.nationality}</div>
                <div><span className="font-medium">Mobile Number:</span> {app.personal_details?.mobileNumber}</div>
                <div><span className="font-medium">Home Number:</span> {app.personal_details?.homeNumber}</div>
                <div><span className="font-medium">Email Address:</span> {app.personal_details?.emailAddress}</div>
                <div><span className="font-medium">SSS/GSIS/UMID:</span> {app.personal_details?.sssGsisUmid}</div>
                <div><span className="font-medium">TIN:</span> {app.personal_details?.tin}</div>
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
                <div><span className="font-medium">Last Name:</span> {app.mother_details?.lastName}</div>
                <div><span className="font-medium">First Name:</span> {app.mother_details?.firstName}</div>
                <div><span className="font-medium">Middle Name:</span> {app.mother_details?.middleName}</div>
                <div><span className="font-medium">Suffix:</span> {app.mother_details?.suffix}</div>
              </div>
            </div>
            {/* Permanent Address */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Permanent Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Street:</span> {app.permanent_address?.street}</div>
                <div><span className="font-medium">Barangay:</span> {app.permanent_address?.barangay}</div>
                <div><span className="font-medium">City:</span> {app.permanent_address?.city}</div>
                <div><span className="font-medium">Province:</span> {app.permanent_address?.province}</div>
                <div><span className="font-medium">Zip Code:</span> {app.permanent_address?.zipCode}</div>
                <div><span className="font-medium">Years of Stay:</span> {app.permanent_address?.yearsOfStay}</div>
              </div>
            </div>
            {/* Spouse Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Spouse Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Last Name:</span> {app.spouse_details?.lastName}</div>
                <div><span className="font-medium">First Name:</span> {app.spouse_details?.firstName}</div>
                <div><span className="font-medium">Middle Name:</span> {app.spouse_details?.middleName}</div>
                <div><span className="font-medium">Suffix:</span> {app.spouse_details?.suffix}</div>
                <div><span className="font-medium">Mobile Number:</span> {app.spouse_details?.mobileNumber}</div>
              </div>
            </div>
            {/* Personal Reference */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Last Name:</span> {app.personal_reference?.lastName}</div>
                <div><span className="font-medium">First Name:</span> {app.personal_reference?.firstName}</div>
                <div><span className="font-medium">Middle Name:</span> {app.personal_reference?.middleName}</div>
                <div><span className="font-medium">Suffix:</span> {app.personal_reference?.suffix}</div>
                <div><span className="font-medium">Mobile Number:</span> {app.personal_reference?.mobileNumber}</div>
                <div><span className="font-medium">Relationship:</span> {app.personal_reference?.relationship}</div>
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
                <div><span className="font-medium">Business/Employer's Name:</span> {app.work_details?.businessEmployerName}</div>
                <div><span className="font-medium">Profession/Occupation:</span> {app.work_details?.professionOccupation}</div>
                <div><span className="font-medium">Nature of Business:</span> {app.work_details?.natureOfBusiness}</div>
                <div><span className="font-medium">Department:</span> {app.work_details?.department}</div>
                <div><span className="font-medium">Landline/Mobile:</span> {app.work_details?.landlineMobile}</div>
                <div><span className="font-medium">Years in Business:</span> {app.work_details?.yearsInBusiness}</div>
                <div><span className="font-medium">Monthly Income:</span> {app.work_details?.monthlyIncome}</div>
                <div><span className="font-medium">Annual Income:</span> {app.work_details?.annualIncome}</div>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Business/Office Address</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">Street:</span> {app.work_details?.address?.street}</div>
                  <div><span className="font-medium">Barangay:</span> {app.work_details?.address?.barangay}</div>
                  <div><span className="font-medium">City:</span> {app.work_details?.address?.city}</div>
                  <div><span className="font-medium">Zip Code:</span> {app.work_details?.address?.zipCode}</div>
                  <div><span className="font-medium">Unit/Floor:</span> {app.work_details?.address?.unitFloor}</div>
                  <div><span className="font-medium">Building/Tower:</span> {app.work_details?.address?.buildingTower}</div>
                  <div><span className="font-medium">Lot No.:</span> {app.work_details?.address?.lotNo}</div>
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
                <div><span className="font-medium">Bank/Institution:</span> {app.credit_card_details?.bankInstitution}</div>
                <div><span className="font-medium">Card Number:</span> {app.credit_card_details?.cardNumber}</div>
                <div><span className="font-medium">Credit Limit:</span> {app.credit_card_details?.creditLimit}</div>
                <div><span className="font-medium">Member Since:</span> {app.credit_card_details?.memberSince}</div>
                <div><span className="font-medium">Exp. Date:</span> {app.credit_card_details?.expirationDate}</div>
                <div><span className="font-medium">Deliver Card To:</span> {app.credit_card_details?.deliverCardTo === 'home' ? 'Present Home Address' : 'Business Address'}</div>
                <div><span className="font-medium">Best Time to Contact:</span> {app.credit_card_details?.bestTimeToContact}</div>
              </div>
            </div>
            {/* Bank Preferences */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Bank Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {app.bank_preferences && Object.entries(app.bank_preferences).filter(([_, v]) => v).map(([k]) => (
                  <span key={k} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            {/* Uploaded Documents */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Uploaded Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">ID Photo</h5>
                  {app.id_photo_url ? (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <img 
                        src={app.id_photo_url} 
                        alt="ID Photo" 
                        className="w-full h-64 object-contain rounded-lg shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-center text-gray-500 mt-4">
                        <p>Image failed to load</p>
                        <a 
                          href={app.id_photo_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 underline hover:text-blue-800 text-sm"
                        >
                          Open in new tab
                        </a>
                      </div>
                      <div className="mt-3 text-center">
                        <a 
                          href={app.id_photo_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 underline hover:text-blue-800 text-sm"
                        >
                          Open in new tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No ID photo uploaded</p>
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">E-Signature</h5>
                  {app.e_signature_url ? (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <img 
                        src={app.e_signature_url} 
                        alt="E-Signature" 
                        className="w-full h-64 object-contain rounded-lg shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-center text-gray-500 mt-4">
                        <p>Image failed to load</p>
                        <a 
                          href={app.e_signature_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 underline hover:text-blue-800 text-sm"
                        >
                          Open in new tab
                        </a>
                      </div>
                      <div className="mt-3 text-center">
                        <a 
                          href={app.e_signature_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 underline hover:text-blue-800 text-sm"
                        >
                          Open in new tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No e-signature uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Application Metadata */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Application Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Submitted By:</span> {app.submitted_by || app.agent || 'Direct'}</div>
                <div><span className="font-medium">Submitted At:</span> {app.submitted_at ? format(new Date(app.submitted_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    app.status === 'submitted' ? 'bg-blue-100 text-blue-800' : 
                    app.status === 'turn-in' ? 'bg-purple-100 text-purple-800' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {app.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
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

  // 2. Main layout (match AdminDashboard)
  return (
    <>
      <div className="flex min-h-screen">
        {/* Sidebar for desktop */}
        <aside className="hidden sm:flex fixed top-0 left-0 h-screen w-64 bg-[#101624] text-white flex-col py-6 px-2 sm:px-6 shadow-xl z-50">
          {/* Logo and Title Section */}
          <div className="flex flex-col items-center mb-10 px-2">
            <div className="bg-white rounded-full flex items-center justify-center w-24 h-24 mb-4">
              <img src="/company/Logo.png" alt="Logo" className="h-16 w-16 object-contain" />
            </div>
            <span className="text-2xl font-extrabold tracking-wide text-center mb-1" style={{letterSpacing: '0.08em'}}>SILVER CARD</span>
            <span className="text-xs uppercase text-gray-400 tracking-widest text-center mb-1">SOLUTIONS</span>
            <span className="text-sm text-gray-300 text-center">Agent Portal</span>
          </div>
          {/* Navigation */}
          <nav className="flex flex-col gap-3 flex-1 items-center">
            {navItems.map(item => (
              <button
                key={item.key}
                className={`flex items-center justify-center w-56 px-4 py-3 rounded-xl font-bold text-lg transition-all mb-1
                  ${activeSection === item.key
                    ? 'bg-blue-900 text-white shadow font-bold'
                    : 'bg-transparent text-gray-200 hover:bg-blue-800 hover:text-white'}
                `}
                onClick={() => setActiveSection(item.key)}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={logout} className="flex items-center mt-auto px-4 py-3 rounded-lg text-red-400 hover:text-red-600 border-2 border-transparent hover:bg-white/10 justify-center">
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </button>
        </aside>
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)}></div>
            <aside className="relative h-full w-64 bg-[#101624] text-white flex flex-col py-6 px-2 sm:px-6 shadow-xl z-50">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl" onClick={() => setSidebarOpen(false)}>&times;</button>
              <div className="flex flex-col items-center mb-10 px-2 mt-8">
                <div className="bg-white rounded-full flex items-center justify-center w-24 h-24 mb-4">
                  <img src="/company/Logo.png" alt="Logo" className="h-16 w-16 object-contain" />
                </div>
                <span className="text-2xl font-extrabold tracking-wide text-center mb-1" style={{letterSpacing: '0.08em'}}>SILVER CARD</span>
                <span className="text-xs uppercase text-gray-400 tracking-widest text-center mb-1">SOLUTIONS</span>
                <span className="text-sm text-gray-300 text-center">Agent Portal</span>
              </div>
              <nav className="flex flex-col gap-3 flex-1 items-center">
                {navItems.map(item => (
                  <button
                    key={item.key}
                    className={`flex items-center justify-center w-56 px-4 py-3 rounded-xl font-bold text-lg transition-all mb-1
                      ${activeSection === item.key
                        ? 'bg-blue-900 text-white shadow font-bold'
                        : 'bg-transparent text-gray-200 hover:bg-blue-800 hover:text-white'}
                    `}
                    onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <button onClick={logout} className="flex items-center mt-auto px-4 py-3 rounded-lg text-red-400 hover:text-red-600 border-2 border-transparent hover:bg-white/10 justify-center">
                <LogOut className="w-5 h-5 mr-2" /> Sign Out
              </button>
            </aside>
          </div>
        )}
        <div className="ml-0 sm:ml-64 flex-1 flex flex-col min-h-0" style={{height: '100vh'}}>
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
              <div className="text-xl font-bold text-gray-900">Silver Card</div>
              <div className="text-xs text-gray-500">Credit Card Management System</div>
            </div>
            {/* User info only (no avatar, no background, no logout) */}
            <div className="flex items-center gap-2 ml-4">
              {user && (
                <div className="flex flex-col text-right">
                  <span className="font-semibold text-sm text-gray-900">{user.name || 'User'}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              )}
            </div>
          </header>
          {/* Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'history' && renderHistory()}
          </main>
          {/* Application Details Modal (unchanged) */}
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
                {/* Step indicator */}
                {renderModalStepIndicator()}
                {/* Step content */}
                {renderModalStepContent(viewedApp)}
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
    </>
  );
};

export default AgentDashboard;