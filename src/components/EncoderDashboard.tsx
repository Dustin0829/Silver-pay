import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, List, History, LogOut, Menu, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { useLoading } from '../hooks/useLoading';

const EncoderDashboard: React.FC = () => {
  console.log('Encoder Dashboard rendered!');
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

  // Handle navigation when activeSection changes
  useEffect(() => {
    if (activeSection === 'apply') {
      navigate('/encoder/apply');
    }
  }, [activeSection, navigate]);

  // Fetch real data from Supabase
  useEffect(() => {
    let isMounted = true;
    
    const fetchAllData = async () => {
      setLoading(true);
      
      // Fetch applications (first 1000 for display)
      const { data: kycData, error: kycError } = await supabase.from('kyc_details').select('*').limit(1000);
      
      if (kycError) {
        console.error('Error fetching KYC data:', kycError);
      }
      
      // Fetch total count efficiently
      const { count, error: countError } = await supabase
        .from('kyc_details')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error fetching count:', countError);
      } else if (isMounted) {
        setTotalApplicationsCount(count || 0);
      }
      
      // Fetch users (agents)
      const { data: userData, error: userError } = await supabase.from('users').select('*');
      
      if (userError) {
        console.error('Error fetching users:', userError);
      }
      
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
          bpi: banks.includes('bpi'),
          pnb: banks.includes('pnb'),
          robinsonBank: banks.includes('robinsonbank'),
          maybank: banks.includes('maybank'),
          aub: banks.includes('aub'),
        };
      };
      
      // Filter for applications where the encoder is the current user
      const normalizedKyc = (kycData || [])
        .filter((k: any) => k.encoder === user?.name || k.encoder === user?.email)
        .map((k: any) => {
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
            encoder: k.encoder || user?.name || '',
            submitted_at: k.submitted_at || null,
          };
        });

      if (isMounted) {
        setApplications(normalizedKyc);
        setUsers(userData || []);
        setTotalApplicationsCount(normalizedKyc.length); // Set the count to match filtered applications
      }
      
      setLoading(false);
    };
    
    fetchAllData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('realtime:kyc_details')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kyc_details' },
        () => { fetchAllData(); }
      )
      .subscribe();
      
    return () => { 
      isMounted = false; 
      supabase.removeChannel(channel);
    };
  }, [user]);

  // PDF export functionality removed

  // 1. Sidebar navigation (match AdminDashboard)
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <List className="w-5 h-5 mr-2" /> },
    { key: 'apply', label: 'Apply', icon: <Plus className="w-5 h-5 mr-2" /> },
    { key: 'history', label: 'Application History', icon: <History className="w-5 h-5 mr-2" /> },
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
      <h2 className="text-2xl font-bold mb-2">Encoder Dashboard</h2>
      <p className="text-gray-600 mb-6">Welcome! Here are your encoded application stats.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-blue-500 mr-2" /> <span className="font-semibold">Applications Encoded</span></div>
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
      {/* Quick Actions for Encoder */}
      <div className="bg-white rounded-xl p-6 shadow mb-8 max-w-xl">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'dashboard' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-blue-700 border-transparent hover:bg-blue-100'}`} onClick={() => setActiveSection('dashboard')}><List className="w-5 h-5 mr-2" /> Dashboard</button>
          <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'apply' ? 'bg-green-50 text-green-700 border-green-400' : 'bg-white text-green-700 border-transparent hover:bg-green-100'}`} onClick={() => setActiveSection('apply')}><Plus className="w-5 h-5 mr-2" /> Apply</button>
          <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'history' ? 'bg-purple-50 text-purple-700 border-purple-400' : 'bg-white text-purple-700 border-transparent hover:bg-purple-100'}`} onClick={() => setActiveSection('history')}><History className="w-5 h-5 mr-2" /> Application History</button>
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

  const sortedFilteredApplications = [...filteredApplications].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  const visibleApplications = sortedFilteredApplications.slice(0, visibleCount);

  const renderHistory = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Application History</h2>
      <p className="text-gray-600 mb-6">View and track applications you have encoded</p>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            className="border rounded-lg px-3 py-2 flex-1"
            placeholder="Search by name, bank code, or bank preference..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
          <select 
            className="border rounded-lg px-3 py-2 w-full sm:w-48"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="submitted">Submitted</option>
            <option value="turn-in">Turn-in</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {`${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.trim()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.personal_details?.emailAddress || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'turn-in' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {app.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.agent || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.submitted_at ? format(new Date(app.submitted_at), 'MMM dd, yyyy') : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => { setViewedApp(app); setCurrentModalStep(1); }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Load More Button */}
        {visibleApplications.length < sortedFilteredApplications.length && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Load More Applications
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderModalStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex space-x-2">
        {modalSteps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentModalStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step.number}
            </div>
            {index < modalSteps.length - 1 && (
              <div className={`w-12 h-1 mx-2 ${
                currentModalStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderModalStepContent = (app: any) => {
    switch (currentModalStep) {
      case 1:
        return (
          <div>
            <h4 className="text-lg font-semibold mb-4">Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium">First Name:</span> {app.personal_details?.firstName}</div>
              <div><span className="font-medium">Last Name:</span> {app.personal_details?.lastName}</div>
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
        );
      case 2:
        return (
          <div>
            <h4 className="text-lg font-semibold mb-4">Address & Family</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium">Mother's Maiden Name:</span> {`${app.mother_details?.lastName} ${app.mother_details?.firstName} ${app.mother_details?.middleName} ${app.mother_details?.suffix}`}</div>
              <div><span className="font-medium">Spouse Name:</span> {`${app.spouse_details?.lastName} ${app.spouse_details?.firstName} ${app.spouse_details?.middleName} ${app.spouse_details?.suffix}`}</div>
              <div><span className="font-medium">Present Address:</span> {`${app.permanent_address?.street}, ${app.permanent_address?.barangay}, ${app.permanent_address?.city}, ${app.permanent_address?.zipCode}, ${app.permanent_address?.province}`}</div>
              <div><span className="font-medium">Personal Reference:</span> {`${app.personal_reference?.lastName} ${app.personal_reference?.firstName} ${app.personal_reference?.middleName} ${app.personal_reference?.suffix} (${app.personal_reference?.relationship}) ${app.personal_reference?.mobileNumber}`}</div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h4 className="text-lg font-semibold mb-4">Work Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium">Business/Employer:</span> {app.work_details?.businessEmployerName}</div>
              <div><span className="font-medium">Profession/Occupation:</span> {app.work_details?.professionOccupation}</div>
              <div><span className="font-medium">Nature of Business:</span> {app.work_details?.natureOfBusiness}</div>
              <div><span className="font-medium">Department:</span> {app.work_details?.department}</div>
              <div><span className="font-medium">Contact Number:</span> {app.work_details?.landlineMobile}</div>
              <div><span className="font-medium">Years in Business:</span> {app.work_details?.yearsInBusiness}</div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h4 className="text-lg font-semibold mb-4">Credit Card & Bank Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium">Bank/Institution:</span> {app.credit_card_details?.bankInstitution}</div>
              <div><span className="font-medium">Member Since:</span> {app.credit_card_details?.memberSince}</div>
              <div><span className="font-medium">Card Number:</span> {app.credit_card_details?.cardNumber}</div>
              <div><span className="font-medium">Credit Limit:</span> {app.credit_card_details?.creditLimit}</div>
              <div><span className="font-medium">Expiration Date:</span> {app.credit_card_details?.expirationDate}</div>
              <div><span className="font-medium">Best Time to Contact:</span> {app.credit_card_details?.bestTimeToContact}</div>
            </div>
            <div className="mt-4">
              <span className="font-medium">Bank Preferences:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {app.bank_preferences && Object.entries(app.bank_preferences).map(([bank, selected]) => (
                  <span key={bank} className={`px-2 py-1 rounded text-xs ${selected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                    {bank.toUpperCase()}: {selected ? '✓' : '✗'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h4 className="text-lg font-semibold mb-4">Documents & Review</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-xs ${
                app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                app.status === 'approved' ? 'bg-green-100 text-green-800' :
                app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-600'
              }`}>{app.status || 'Unknown'}</span></div>
              <div><span className="font-medium">Agent:</span> <span className="text-blue-600 font-semibold">{app.agent || 'Not specified'}</span></div>
              <div><span className="font-medium">Encoder:</span> {app.encoder || 'Not specified'}</div>
              <div><span className="font-medium">Submitted At:</span> {app.submitted_at ? format(new Date(app.submitted_at), 'MMM dd, yyyy') : ''}</div>
            </div>
            {app.id_photo_url && (
              <div className="mt-4">
                <span className="font-medium">ID Photo:</span>
                <img src={app.id_photo_url} alt="ID" className="mt-2 w-32 h-20 object-cover rounded" />
              </div>
            )}
            {app.e_signature_url && (
              <div className="mt-4">
                <span className="font-medium">E-Signature:</span>
                <img src={app.e_signature_url} alt="Signature" className="mt-2 w-32 h-20 object-cover rounded" />
              </div>
            )}
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Main layout
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
            <span className="text-sm text-gray-300 text-center">Encoder Portal</span>
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
          {/* Optional: Logout at the bottom */}
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
                <span className="text-sm text-gray-300 text-center">Encoder Portal</span>
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
          <main className="flex-1 overflow-y-auto px-8 py-8">
              {activeSection === 'dashboard' && renderDashboard()}
              {activeSection === 'history' && renderHistory()}
            </main>
              {viewedApp && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
                    <button onClick={() => { setViewedApp(null); setCurrentModalStep(1); }} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
                    <h3 className="text-2xl font-bold mb-6">Application Details</h3>
                    {renderModalStepIndicator()}
                    {renderModalStepContent(viewedApp)}
                    <div className="flex justify-between mt-8 pt-6 border-t gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentModalStep(s => Math.max(1, s - 1))}
                        disabled={currentModalStep === 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Previous
                      </button>
                      {currentModalStep < 5 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentModalStep(s => Math.min(5, s + 1))}
                          className="flex items-center px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-sm"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setViewedApp(null); setCurrentModalStep(1); }}
                          className="flex items-center px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 text-sm"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
        </div>
      </div>
    </>
  );
};

export default EncoderDashboard; 