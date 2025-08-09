import React, { useState, useEffect } from 'react';
import { FileText, Check, X, Eye, Edit, LogOut, User, Clock, CheckCircle, List, History, Trash2, Download, Menu, Send, ArrowDownCircle, ThumbsUp, ThumbsDown, BarChart3, Users, FileUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import Toast from './Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { useLoading } from '../hooks/useLoading';
import BankStatusModal from './BankStatusModal';
import ConfirmationModal from './ConfirmationModal';
import { normalizeStatus, StandardStatus } from '../utils/statusMapping';
import { fetchBankTableData, transformBankData, handleCSVUpload } from '../utils/bankDataUtils';

// Bank configuration
const BANKS = [
  { value: 'rcbc', label: 'RCBC', logo: '/banks/RCBC.jpg' },
  { value: 'metrobank', label: 'Metrobank', logo: '/banks/metrobank.jpeg' },
  { value: 'eastwest', label: 'EastWest Bank', logo: '/banks/eastwest.webp' },
  { value: 'bpi', label: 'BPI', logo: '/banks/bpi.jpg' },
  { value: 'pnb', label: 'PNB', logo: '/banks/pnb.png' },
  { value: 'robinsons', label: 'Robinson Bank', logo: '/banks/robinson.jpg' },
  { value: 'maybank', label: 'Maybank', logo: '/banks/maybank.png' },
  { value: 'aub', label: 'AUB', logo: '/banks/AUB.jpg' },
];

// Helper to flatten nested application data
function flattenApplicationData(data: any) {
  return {
    ...data,
    ...(data.personal_details || {}),
    ...(data.mother_details || {}),
    ...(data.permanent_address || {}),
    ...(data.spouse_details || {}),
    ...(data.personal_reference || {}),
    ...(data.work_details || {}),
    ...(data.credit_card_details || {}),
  };
}

// Helper to map flat data to nested application structure
function mapFlatToNestedApp(data: any) {
  // Helper to split relative_name into parts
  function parseRelativeName(name: string) {
    if (!name) return { lastName: '', firstName: '', middleName: '', suffix: '' };
    let lastName = '', firstName = '', middleName = '', suffix = '';
    let parts = name.split(',');
    if (parts.length === 2) {
      lastName = parts[0].trim();
      const rest = parts[1].trim().split(' ');
      firstName = rest[0] || '';
      middleName = rest.slice(1).join(' ') || '';
    } else {
      const tokens = name.trim().split(' ');
      lastName = tokens[0] || '';
      firstName = tokens[1] || '';
      middleName = tokens.slice(2).join(' ') || '';
    }
    return { lastName, firstName, middleName, suffix };
  }

  // Helper to parse personal reference from relative3_name
  function parsePersonalReference(name: string) {
    if (!name) return { lastName: '', firstName: '', middleName: '', suffix: '', mobileNumber: '', relationship: '' };
    
    // Extract mobile number and relationship from the end
    const mobileMatch = name.match(/\(([^)]+)\)\s*(\d+)$/);
    let mobileNumber = '';
    let relationship = '';
    let cleanName = name;
    
    if (mobileMatch) {
      relationship = mobileMatch[1];
      mobileNumber = mobileMatch[2];
      cleanName = name.replace(/\([^)]+\)\s*\d+$/, '').trim();
    }
    
    // Parse the name part
    const nameParts = parseRelativeName(cleanName);
    
    return {
      ...nameParts,
      mobileNumber,
      relationship
    };
  }

  // Map bank preferences from bank_applied field
  const bankApplied = data.bank_applied || '';
  const selectedBanks = bankApplied.split(',').map((bank: string) => bank.trim().toLowerCase());
  
  const bankPreferences = {
    rcbc: selectedBanks.includes('rcbc'),
    metrobank: selectedBanks.includes('metrobank'),
    eastwest: selectedBanks.includes('eastwestbank') || selectedBanks.includes('eastwest'),
    bpi: selectedBanks.includes('bpi'),
    pnb: selectedBanks.includes('pnb'),
    robinsons: selectedBanks.includes('robinsonbank') || selectedBanks.includes('robinson'),
    maybank: selectedBanks.includes('maybank'),
    aub: selectedBanks.includes('aub'),
  };

  return {
    ...data,
    id: data.id,
    personal_details: {
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      middleName: data.middle_name || '',
      suffix: data.suffix || '',
      dateOfBirth: data.date_of_birth || '',
      placeOfBirth: data.place_of_birth || '',
      gender: data.gender || '',
      civilStatus: data.civil_status || '',
      nationality: data.nationality || '',
      mobileNumber: data.mobile_number || '',
      homeNumber: data.home_number || '',
      emailAddress: data.email_address || '',
      sssGsisUmid: data.sss_gsis_umid || '',
      tin: data.tin || '',
    },
    mother_details: data.mother_details || parseRelativeName(data.relative_name || ''),
    permanent_address: data.permanent_address || {
      street: data.street || '',
      barangay: data.barangay || '',
      city: data.city || '',
      zipCode: data.zip_code || '',
      yearsOfStay: data.years_of_stay || '',
    },
    spouse_details: data.spouse_details || {
      ...parseRelativeName(data.spouse_name || ''),
      mobileNumber: data.spouse_mobile_number || '',
    },
    personal_reference: data.personal_reference || parsePersonalReference(data.relative3_name || ''),
    work_details: data.work_details || {
      businessEmployerName: data.business || '',
      professionOccupation: data.profession || '',
      natureOfBusiness: data.nature_of_business || '',
      department: data.department || '',
      landlineMobile: data.contact_number || '',
      yearsInBusiness: data.years_in_business || '',
      monthlyIncome: data.monthly_income || '',
      annualIncome: data.annual_income || '',
      // Additional fields for PDF preview
      employerName: data.business || '',
      position: data.profession || '',
      workAddress: data.business_address || data.business_street || '',
      contactNumber: data.contact_number || '',
      yearsEmployed: data.years_in_business || '',
      address: {
        street: data.business_street || data.business_address || '',
        barangay: data.business_barangay || '',
        city: data.business_city || '',
        zipCode: data.business_zip_code || '',
        unitFloor: data.unit_floor || '',
        buildingTower: data.building_tower || '',
        lotNo: data.lot_no || '',
      },
    },
    credit_card_details: data.credit_card_details || {
      bankInstitution: data.bank_institution || '',
      cardNumber: data.card_number || '',
      creditLimit: data.credit_limit || '',
      memberSince: data.member_since || '',
      expirationDate: data.expiry_date || data.expiration_date || '',
      deliverCardTo: data.deliver_card_to || 'home',
      bestTimeToContact: data.best_time_to_contact || '',
    },
    bank_preferences: data.bank_preferences || bankPreferences,
    status: data.status || '',
    submitted_at: data.created_at || data.submitted_at || new Date(),
    submittedBy: data.agent || '',
    agent: data.agent || '',
    id_photo_url: data.id_photo_url || '',
    e_signature_url: data.e_signature_url || '',
    location: data.location || '',
    remarks: data.remarks || '',
  };
}

const initialToastState = { show: false, message: '', type: undefined as 'success' | 'error' | undefined };

const ModeratorDashboard: React.FC = () => {
  const { logout, user, createUser } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [viewedApp, setViewedApp] = useState<any | null>(null);
  const [toast, setToast] = useState<typeof initialToastState>(initialToastState);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(1);

  const [nameFilter, setNameFilter] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [maybankApplications, setMaybankApplications] = useState<any[]>([]);
  const [bpiApplications, setBpiApplications] = useState<any[]>([]);
  const [rcbcApplications, setRcbcApplications] = useState<any[]>([]);
  const [metrobankApplications, setMetrobankApplications] = useState<any[]>([]);
  const [eastwestApplications, setEastwestApplications] = useState<any[]>([]);
  const [pnbApplications, setPnbApplications] = useState<any[]>([]);
  const [aubApplications, setAubApplications] = useState<any[]>([]);
  const [robinsonsApplications, setRobinsonsApplications] = useState<any[]>([]);
  const [importingCSV, setImportingCSV] = useState(false);
  const [importingBank, setImportingBank] = useState<string | null>(null);
  const [viewBankApp, setViewBankApp] = useState<any | null>(null);
  const [loadingBankApp, setLoadingBankApp] = useState(false);
  const [totalApplicationsCount, setTotalApplicationsCount] = useState(0);
  const [applicationsSearchFilter, setApplicationsSearchFilter] = useState('');
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 15;
  const { setLoading } = useLoading();

  // Function to fetch bank applications - moved outside useEffect for accessibility
  const fetchBankApplications = async () => {
    try {
      console.log('ModeratorDashboard: Fetching bank-specific applications from their tables...');
      const bankTables = [
        { name: 'maybank', setter: setMaybankApplications },
        { name: 'bpi', setter: setBpiApplications },
        { name: 'rcbc', setter: setRcbcApplications },
        { name: 'metrobank', setter: setMetrobankApplications },
        { name: 'eastwest', setter: setEastwestApplications },
        { name: 'pnb', setter: setPnbApplications },
        { name: 'aub', setter: setAubApplications },
        { name: 'robinsons', setter: setRobinsonsApplications },
      ];
      
      const results = await Promise.allSettled(
        bankTables.map(async ({ name, setter }) => {
          try {
            console.log(`ModeratorDashboard: Fetching ${name} data...`);
            const { data, error } = await fetchBankTableData(name);
            
            if (error) {
              console.error(`Error fetching ${name} data:`, error);
              setter([]); // Set empty array on error
              return { name, success: false, error };
            }
            
            // Always update the state, even if there are no records
            if (data) {
              const transformedData = transformBankData(data, name);
              setter(transformedData);
              console.log(`ModeratorDashboard: Successfully fetched ${name} applications:`, transformedData.length);
              return { name, success: true, count: transformedData.length };
            } else {
              setter([]);
              console.log(`ModeratorDashboard: No data found for ${name}`);
              return { name, success: true, count: 0 };
            }
          } catch (err) {
            console.error(`Unexpected error fetching ${name}:`, err);
            setter([]); // Set empty array on error
            return { name, success: false, error: err };
          }
        })
      );
      
      // Log summary of results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success)).length;
      console.log(`ModeratorDashboard: Bank data fetch completed. Successful: ${successful}, Failed: ${failed}`);
      
    } catch (err) {
      console.error('Unexpected error in fetchBankApplications:', err);
    }
  };

  // Additional states for application management
  const [loadingApp, setLoadingApp] = useState(false);
  const [fetchedApp, setFetchedApp] = useState<any | null>(null);
  const [loadingEditApp, setLoadingEditApp] = useState(false);
  const [editApp, setEditApp] = useState<any | null>(null);
  const [currentEditStep, setCurrentEditStep] = useState(1);
  const [exportPreviewApp, setExportPreviewApp] = useState<any | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);

  // User management states
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'agent', bankCodes: [{ bank: '', code: '' }] });
  const [editUserIdx, setEditUserIdx] = useState<number | null>(null);
  const [editUser, setEditUser] = useState({ name: '', email: '', password: '', role: 'agent', bankCodes: [{ bank: '', code: '' }] });
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Bank Status Modal state
  const [bankStatusModalOpen, setBankStatusModalOpen] = useState(false);
  const [selectedApplicationForStatus, setSelectedApplicationForStatus] = useState<any | null>(null);
  const [applicationsBankStatus, setApplicationsBankStatus] = useState<Record<string, Record<string, string>>>({});
  
  // Confirmation Modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger' as 'danger' | 'warning' | 'info'
  });
  
  // User management functions
  const handleAddUser = async () => {
    try {
      // Prevent multiple submissions
      if (isCreatingUser) return;
      
      // Validate inputs
      if (!newUser.name.trim()) {
        setToast({ show: true, message: 'Name is required', type: 'error' });
        return;
      }
      if (!newUser.email.trim() || !newUser.email.includes('@')) {
        setToast({ show: true, message: 'Valid email is required', type: 'error' });
        return;
      }
      if (!newUser.password.trim() || newUser.password.length < 6) {
        setToast({ show: true, message: 'Password must be at least 6 characters', type: 'error' });
        return;
      }
      
      // For agent role, validate bank codes
      if (newUser.role === 'agent') {
        const invalidBankCode = newUser.bankCodes.some(bc => !bc.bank || !bc.code);
        if (invalidBankCode) {
          setToast({ show: true, message: 'All bank codes must have both bank and code values', type: 'error' });
          return;
        }
      }
      
      setIsCreatingUser(true);
      
      console.log('Creating user directly with Supabase:', {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      });
      
      try {
        // DIRECT APPROACH: Create user profile first
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            bank_codes: newUser.role === 'agent' ? newUser.bankCodes : [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          if (profileError.message.includes('duplicate')) {
            setToast({ show: true, message: 'A user with this email already exists', type: 'error' });
          } else {
            setToast({ show: true, message: 'Failed to create user profile: ' + profileError.message, type: 'error' });
          }
          return;
        }
        
        // Now create the auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newUser.email,
          password: newUser.password,
          options: {
            data: {
              name: newUser.name,
              role: newUser.role,
            }
          }
        });
        
        if (authError) {
          console.error('Error creating auth user:', authError);
          
          // Clean up the profile we already created
          await supabase
            .from('user_profiles')
            .delete()
            .eq('id', profileData.id);
            
          if (authError.message.includes('User already registered')) {
            setToast({ 
              show: true, 
              message: 'This email is already registered. User must confirm their email before logging in.', 
              type: 'error' 
            });
          } else if (authError.message.includes('For security purposes')) {
            setToast({ 
              show: true, 
              message: 'Rate limit exceeded. Please wait a minute before trying again.', 
              type: 'error' 
            });
          } else {
            setToast({ show: true, message: 'Failed to create user: ' + authError.message, type: 'error' });
          }
          return;
        }
        
        if (authData.user) {
          // Update the profile with the user_id
          await supabase
            .from('user_profiles')
            .update({ user_id: authData.user.id })
            .eq('id', profileData.id);
            
          setToast({ 
            show: true, 
            message: 'User created successfully! They will need to confirm their email before logging in.', 
            type: 'success' 
          });
          setShowAddUser(false);
          setNewUser({ name: '', email: '', password: '', role: 'agent', bankCodes: [{ bank: '', code: '' }] });
          
          // Refresh the users list - will be defined later
          setTimeout(() => {
            if (typeof fetchAllData === 'function') {
              fetchAllData();
            }
          }, 500);
        } else {
          setToast({ 
            show: true, 
            message: 'Failed to create user account. Please try again.', 
            type: 'error' 
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create user. Please try again.';
        setToast({ show: true, message: errorMessage, type: 'error' });
      }
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      setToast({ show: true, message: 'Failed to create user: ' + (error instanceof Error ? error.message : 'Unknown error'), type: 'error' });
    } finally {
      setIsCreatingUser(false);
    }
  };
  
  const handleUpdateUser = async (userIdx: number) => {
    try {
      const user = users[userIdx];
      
      // Validate inputs
      if (!editUser.name.trim()) {
        setToast({ show: true, message: 'Name is required', type: 'error' });
        return;
      }
      
      // For agent role, validate bank codes
      if (editUser.role === 'agent') {
        const invalidBankCode = editUser.bankCodes.some(bc => !bc.bank || !bc.code);
        if (invalidBankCode) {
          setToast({ show: true, message: 'All bank codes must have both bank and code values', type: 'error' });
          return;
        }
      }
      
      // Update user directly in Supabase
      try {
        // Prepare update data - don't include user_id in the update
        const updateData = {
          name: editUser.name,
          role: editUser.role,
          bank_codes: editUser.role === 'agent' ? editUser.bankCodes : [],
          updated_at: new Date().toISOString()
        };
        
        console.log('Updating user profile:', { id: user.id, ...updateData });
        
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', user.id)
          .select();
          
        if (error) {
          console.error('Error updating user profile:', error);
          setToast({ show: true, message: 'Failed to update user: ' + error.message, type: 'error' });
          return;
        }
        
        console.log('User profile updated successfully:', data);
        
        // Update local state
        const updatedUser = { ...user, ...updateData };
        setUsers(users.map((u, idx) => idx === userIdx ? updatedUser : u));
        
        // Reset form and close modal
        setEditUserIdx(null);
        
        setToast({ show: true, message: 'User updated successfully!', type: 'success' });
      } catch (err) {
        console.error('Error in user update:', err);
        setToast({ show: true, message: 'Failed to update user: ' + (err instanceof Error ? err.message : String(err)), type: 'error' });
      }
    } catch (error) {
      console.error('Unexpected error updating user:', error);
      setToast({ show: true, message: 'Failed to update user: ' + (error instanceof Error ? error.message : 'Unknown error'), type: 'error' });
    }
  };

  // Sidebar navigation
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <List className="w-5 h-5 mr-2" /> },
    { key: 'applications', label: 'Client Applications', icon: <FileText className="w-5 h-5 mr-2" /> },
    { key: 'statusReport', label: 'Status Report', icon: <BarChart3 className="w-5 h-5 mr-2" /> },
    { key: 'history', label: 'Application History', icon: <History className="w-5 h-5 mr-2" /> },
    { key: 'users', label: 'User Management', icon: <Users className="w-5 h-5 mr-2" /> },
  ];

  // Fetch data from Supabase
  useEffect(() => {
    let isMounted = true;
    
    const fetchAllData = async () => {
      setLoading(true);
      try {
        console.log('ModeratorDashboard: Starting to fetch all data...');
        
        // Fetch all KYC data with pagination
        const { data: kycData, error: kycError } = await supabase
          .from('kyc_details')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (kycError) {
          console.error('Error fetching KYC data:', kycError);
          setToast({ show: true, message: 'Failed to fetch applications: ' + kycError.message, type: 'error' });
          return;
        }
        
        console.log('ModeratorDashboard: Fetched', kycData?.length || 0, 'KYC records');
        
        // Fetch total count
        const { count, error: countError } = await supabase
          .from('kyc_details')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('Error fetching count:', countError);
        } else if (isMounted) {
          setTotalApplicationsCount(count || 0);
        }
        
        // Normalize KYC data
        const normalizedKyc = (kycData || []).map((k: any) => ({
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
          mother_details: k.mother_details || {},
          permanent_address: k.permanent_address || {},
          spouse_details: k.spouse_details || {},
          personal_reference: k.personal_reference || {},
          work_details: k.work_details || {},
          credit_card_details: k.credit_card_details || {},
          bank_preferences: k.bank_preferences || {},
          id_photo_url: k.id_photo_url || '',
          e_signature_url: k.e_signature_url || '',
          status: k.status || '',
          submitted_by: k.agent || '',
          agent: k.agent || '',
          submitted_at: k.created_at || k.submitted_at || null,
          created_at: k.created_at,
          updated_at: k.updated_at,
        }));
        
        if (isMounted) {
          setApplications(normalizedKyc);
        }

        // Fetch all users from user_profiles table
        console.log('ModeratorDashboard: Fetching users...');
        
        // Directly fetch all users from Supabase since RLS is disabled
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (userError) {
          console.error('Failed to fetch users:', userError.message);
          setToast({ show: true, message: 'Failed to fetch users: ' + userError.message, type: 'error' });
        } else {
          console.log('ModeratorDashboard: Fetched', userData?.length || 0, 'users');
          console.log('ModeratorDashboard: User data:', userData);
          
          if (isMounted) {
            setUsers(userData || []);
          }
        }

        // Fetch bank status data
        console.log('ModeratorDashboard: Fetching bank status data...');
        const { data: bankStatusData, error: bankStatusError } = await supabase
          .from('bank_status')
          .select('*')
          .order('updated_at', { ascending: false });
          
        if (bankStatusError) {
          console.error('Failed to fetch bank status data:', bankStatusError.message);
          setToast({ show: true, message: 'Failed to fetch bank status data: ' + bankStatusError.message, type: 'error' });
        } else {
          console.log('ModeratorDashboard: Fetched', bankStatusData?.length || 0, 'bank status records');
          
          if (isMounted && bankStatusData) {
            // Transform bank status data into the expected format
            const bankStatusMap: Record<string, Record<string, string>> = {};
            bankStatusData.forEach((status: any) => {
              if (!bankStatusMap[status.application_id]) {
                bankStatusMap[status.application_id] = {};
              }
              bankStatusMap[status.application_id][status.bank_name] = status.status;
            });
            setApplicationsBankStatus(bankStatusMap);
          }
        }
        
      } catch (error) {
        console.error('Unexpected error in fetchAllData:', error);
        setToast({ show: true, message: 'Unexpected error while fetching data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    fetchBankApplications();
    
    // Real-time subscription for KYC updates
    const kycChannel = supabase
      .channel('realtime:kyc_details')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kyc_details' },
        (payload) => {
          console.log('KYC data changed:', payload);
          fetchAllData();
        }
      )
      .subscribe();
      
    // Real-time subscription for user updates
    const userChannel = supabase
      .channel('realtime:user_profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        (payload) => {
          console.log('User data changed:', payload);
          fetchAllData();
        }
      )
      .subscribe();
    
    // Real-time subscriptions for bank-specific tables
    const maybankChannel = supabase
      .channel('realtime:maybank')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maybank' },
        () => {
          console.log('Maybank application data changed');
          fetchBankApplications();
        }
      )
      .subscribe();
      
    // Add similar subscriptions for other bank tables
    const bpiChannel = supabase
      .channel('realtime:bpi')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bpi' },
        () => {
          console.log('BPI application data changed');
          fetchBankApplications();
        }
      )
      .subscribe();
      
    const eastwestChannel = supabase
      .channel('realtime:eastwest')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eastwest' },
        () => {
          console.log('EastWest application data changed');
          fetchBankApplications();
        }
      )
      .subscribe();
      
    const rcbcChannel = supabase
      .channel('realtime:rcbc')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rcbc' },
        () => {
          console.log('RCBC application data changed');
          fetchBankApplications();
        }
      )
      .subscribe();
      
    const pnbChannel = supabase
      .channel('realtime:pnb')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pnb' },
        () => {
          console.log('PNB application data changed');
          fetchBankApplications();
        }
      )
      .subscribe();
      
    const aubChannel = supabase
      .channel('realtime:aub')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'aub' },
        () => {
          console.log('AUB application data changed');
          fetchBankApplications();
        }
      )
      .subscribe();
      
    const metrobankChannel = supabase
      .channel('realtime:metrobank')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'metrobank' },
        () => {
          console.log('Metrobank application data changed');
          fetchBankApplications();
        }
      )
      .subscribe();
      
    const robinsonsChannel = supabase
      .channel('realtime:robinsons')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'robinsons' },
        () => {
          console.log('Robinson Bank application data changed');
          fetchBankApplications();
        }
      )
      .subscribe();

    // Real-time subscription for bank status updates
    const bankStatusChannel = supabase
      .channel('realtime:bank_status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bank_status' },
        () => {
          console.log('Bank status data changed');
          fetchAllData(); // Refetch all data to get updated bank status
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(kycChannel);
      supabase.removeChannel(userChannel);
      supabase.removeChannel(maybankChannel);
      supabase.removeChannel(bpiChannel);
      supabase.removeChannel(eastwestChannel);
      supabase.removeChannel(rcbcChannel);
      supabase.removeChannel(pnbChannel);
      supabase.removeChannel(aubChannel);
      supabase.removeChannel(metrobankChannel);
      supabase.removeChannel(robinsonsChannel);
      supabase.removeChannel(bankStatusChannel);
    };
  }, [setLoading]);

  // Dashboard stats
  const applicationsWithStatus = applications.filter(a => a.status && a.status.trim() !== '');
  const totalApplications = totalApplicationsCount;
  const pendingReviews = applicationsWithStatus.filter(a => (a.status || '').toLowerCase() === 'pending').length;
  const approved = applicationsWithStatus.filter(a => (a.status || '').toLowerCase() === 'approved').length;
  const rejected = applicationsWithStatus.filter(a => (a.status || '').toLowerCase() === 'rejected').length;
  const submitted = applicationsWithStatus.filter(a => (a.status || '').toLowerCase() === 'submitted').length;
  const turnIn = applicationsWithStatus.filter(a => (a.status || '').toLowerCase() === 'turn-in').length;
  const totalUsers = users.length;

  // Application management functions
  const handleViewApp = async (app: any) => {
    setLoadingApp(true);
    setViewedApp(app);
    let table = 'application_form';
    if (app.id && typeof app.id === 'string' && app.id.startsWith('kyc-')) {
      table = 'kyc_details';
    }
    const id = app.id.startsWith('kyc-') ? app.id.replace('kyc-', '') : app.id;
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (!error && data) {
      setFetchedApp(flattenApplicationData(data));
    } else {
      setFetchedApp(null);
    }
    setLoadingApp(false);
  };

  const handleEditApp = async (app: any) => {
    setLoadingEditApp(true);
    let table = 'application_form';
    if (app.id && typeof app.id === 'string' && app.id.startsWith('kyc-')) {
      table = 'kyc_details';
    }
    const id = app.id.startsWith('kyc-') ? app.id.replace('kyc-', '') : app.id;
    
    console.log('[DEBUG] Edit App - Fetching app:', { app, table, id });
    
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    console.log('[DEBUG] Supabase fetch result:', { data, error });
    
    if (!error && data) {
      // Use the mapFlatToNestedApp function to transform the data
      const transformedData = mapFlatToNestedApp(data);
      console.log('[DEBUG] Transformed data for editing:', transformedData);
      setEditApp(transformedData);
      setCurrentEditStep(1);
    } else {
      console.error('[DEBUG] Failed to fetch application data for editing:', error);
      setEditApp(null);
      setToast({ show: true, message: 'Failed to load application for editing', type: 'error' });
    }
    
    setLoadingEditApp(false);
  };

  // New function to update KYC application
  const handleUpdateKycApp = async (appId: string, updatedData: any) => {
    try {
      console.log('Updating KYC application:', appId, updatedData);
      
      // Convert bank preferences to bank_applied format
      const bankApplied = updatedData.bank_preferences 
        ? Object.keys(updatedData.bank_preferences)
            .filter(key => updatedData.bank_preferences[key])
            .join(', ')
        : '';
      
      // Prepare the data for Supabase update based on actual table schema
      const updateData = {
        first_name: updatedData.personal_details?.firstName || '',
        last_name: updatedData.personal_details?.lastName || '',
        middle_name: updatedData.personal_details?.middleName || '',
        suffix: updatedData.personal_details?.suffix || '',
        date_of_birth: updatedData.personal_details?.dateOfBirth || '',
        place_of_birth: updatedData.personal_details?.placeOfBirth || '',
        gender: updatedData.personal_details?.gender || '',
        civil_status: updatedData.personal_details?.civilStatus || '',
        nationality: updatedData.personal_details?.nationality || '',
        mobile_number: updatedData.personal_details?.mobileNumber || '',
        home_number: updatedData.personal_details?.homeNumber || '',
        email_address: updatedData.personal_details?.emailAddress || '',
        "sss/gsis/umid": updatedData.personal_details?.sssGsisUmid || '',
        tin: updatedData.personal_details?.tin || '',
        // Map mother's details to relative_name
        relative_name: updatedData.mother_details ? 
          `${updatedData.mother_details.lastName || ''}, ${updatedData.mother_details.firstName || ''} ${updatedData.mother_details.middleName || ''}`.trim() : '',
        // Map permanent address
        address: updatedData.permanent_address?.street || '',
        years_of_stay: updatedData.permanent_address?.yearsOfStay || 0,
        // Map spouse details to relative2_name
        relative2_name: updatedData.spouse_details ? 
          `${updatedData.spouse_details.lastName || ''}, ${updatedData.spouse_details.firstName || ''} ${updatedData.spouse_details.middleName || ''}`.trim() : '',
        // Map work details
        business: updatedData.work_details?.businessEmployerName || '',
        profession: updatedData.work_details?.professionOccupation || '',
        nature_of_business: updatedData.work_details?.natureOfBusiness || '',
        department: updatedData.work_details?.department || '',
        contact_number: updatedData.work_details?.landlineMobile || '',
        years_in_business: updatedData.work_details?.yearsInBusinessEmployment || 0,
        monthly_income: updatedData.work_details?.monthlyIncome || 0,
        annual_income: updatedData.work_details?.annualIncome || 0,
        // Map personal reference to relative3_name
        relative3_name: updatedData.personal_reference ? 
          `${updatedData.personal_reference.lastName || ''}, ${updatedData.personal_reference.firstName || ''} ${updatedData.personal_reference.middleName || ''}`.trim() : '',
        // Credit card details
        bank_institution: updatedData.credit_card_details?.bankInstitution || '',
        card_number: updatedData.credit_card_details?.cardNumber || '',
        credit_limit: updatedData.credit_card_details?.creditLimit || 0,
        member_since: updatedData.credit_card_details?.memberSince || '',
        expiry_date: updatedData.credit_card_details?.expDate || '',
        deliver_card_to: updatedData.credit_card_details?.deliverCardTo || '',
        best_time_to_contact: updatedData.credit_card_details?.bestTimeToContact || '',
        bank_applied: bankApplied,
        status: updatedData.status || '',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('kyc_details')
        .update(updateData)
        .eq('id', appId);

      if (error) {
        console.error('Error updating KYC application:', error);
        setToast({ show: true, message: 'Failed to update application: ' + error.message, type: 'error' });
        return false;
      }

      setToast({ show: true, message: 'Application updated successfully!', type: 'success' });
      
      // Refresh the applications list
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (!kycError && kycData) {
        const normalizedKyc = kycData.map((k: any) => ({
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
          mother_details: k.mother_details || {},
          permanent_address: k.permanent_address || {},
          spouse_details: k.spouse_details || {},
          personal_reference: k.personal_reference || {},
          work_details: k.work_details || {},
          credit_card_details: k.credit_card_details || {},
          bank_preferences: k.bank_preferences || {},
          id_photo_url: k.id_photo_url || '',
          e_signature_url: k.e_signature_url || '',
          status: k.status || '',
          submitted_by: k.agent || '',
          agent: k.agent || '',
          submitted_at: k.created_at || k.submitted_at || null,
          created_at: k.created_at,
          updated_at: k.updated_at,
        }));
        setApplications(normalizedKyc);
      }

      return true;
    } catch (error) {
      console.error('Unexpected error updating KYC application:', error);
      setToast({ show: true, message: 'Unexpected error while updating application', type: 'error' });
      return false;
    }
  };

  // Function to update application status
  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const id = appId.startsWith('kyc-') ? appId.replace('kyc-', '') : appId;
      
      const { error } = await supabase
        .from('kyc_details')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        setToast({ show: true, message: 'Failed to update status: ' + error.message, type: 'error' });
        return false;
      }

      setToast({ show: true, message: `Status updated to ${newStatus}`, type: 'success' });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));

      return true;
    } catch (error) {
      console.error('Unexpected error updating status:', error);
      setToast({ show: true, message: 'Unexpected error while updating status', type: 'error' });
      return false;
    }
  };

  const handleSingleExportPreview = async (app: any) => {
    setExportingPDF(true);
    let table = 'application_form';
    let appId = app.id;
    if (typeof app.id === 'string' && app.id.startsWith('kyc-')) {
      table = 'kyc_details';
      appId = app.id.replace('kyc-', '');
    }
    
    console.log('[DEBUG] Export Preview - Fetching app:', { app, table, appId });
    
    const { data, error } = await supabase.from(table).select('*').eq('id', appId).single();
    console.log('[DEBUG] Supabase fetch result:', { data, error });
    
    if (!error && data) {
      // Use the mapFlatToNestedApp function to transform the data
      const transformedData = mapFlatToNestedApp(data);
      console.log('[DEBUG] Transformed data for export preview:', transformedData);
      setExportPreviewApp(transformedData);
    } else {
      console.error('[DEBUG] Failed to fetch application data:', error);
      setExportPreviewApp(null);
      setToast({ show: true, message: 'Failed to fetch application for export preview', type: 'error' });
    }
    
    setExportingPDF(false);
  };

  const handleExportSinglePDF = async () => {
    if (!exportPreviewApp) return;
    setExportingPDF(true);
    const previewElement = document.getElementById('single-app-pdf-preview');
    if (!previewElement) return;
    const pdfWidth = previewElement.offsetWidth;
    const pdfHeight = previewElement.offsetHeight;
    const canvas = await html2canvas(previewElement, {
      scale: 2,
      width: pdfWidth,
      height: pdfHeight,
      backgroundColor: '#fff',
      useCORS: true
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [pdfWidth, pdfHeight]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Application_${exportPreviewApp.id}.pdf`);
    setExportingPDF(false);
  };

  const exportHistoryToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Application History', 20, 20);
    // Horizontal line after title
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(12);
    // Change: Agent's Name is now the first column
    const tableColumn = ['Agent', 'Applicant', 'Date & Time', 'Bank Codes'];
    const tableRows = filteredApplications.map(app => [
      // Agent's Name (from users list or fallback)
      (() => {
        if (!app.submitted_by || app.submitted_by === 'direct') return 'direct';
        const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
        return agent?.name || app.submitted_by;
      })(),
      `${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`,
      app.submitted_at ? new Date(app.submitted_at).toLocaleString() : '',
      (() => {
        if (!app.submitted_by || app.submitted_by === 'direct') return '-';
        const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
        if (agent && Array.isArray(agent.bank_codes) && agent.bank_codes.length > 0) {
          return agent.bank_codes.map((entry: any) => `${entry.bank}: ${entry.code}`).join(', ');
        }
        return '-';
      })()
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [240, 240, 240], textColor: 0 },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
    });
    doc.save('application_history.pdf');
  };

  // Export preview modal handlers
  const handleExportPreview = () => setShowExportPreview(true);
  const handleClosePreview = () => setShowExportPreview(false);
  // Handler to import CSV file
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportingCSV(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      console.log('CSV Headers:', headers);
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        return row;
      });

      console.log('Parsed CSV data:', data);

      // Determine which table to insert into based on selected bank
      let tableName = '';
      if (selectedBank === 'maybank') {
        tableName = 'maybank_applications';
      } else {
        setToast({ show: true, message: 'CSV import is currently only supported for Maybank applications', type: 'error' });
        return;
      }

      // Insert data into the appropriate table
      const { error } = await supabase
        .from(tableName)
        .insert(data);

      if (error) {
        console.error('Error inserting CSV data:', error);
        setToast({ show: true, message: 'Failed to import CSV: ' + error.message, type: 'error' });
      } else {
        setToast({ show: true, message: `Successfully imported ${data.length} records from CSV`, type: 'success' });
        // Refresh the data
        if (selectedBank === 'maybank') {
          // Re-fetch Maybank applications
          const { data: newData, error: fetchError } = await supabase
            .from('maybank_applications')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (!fetchError && newData) {
            const normalizedMaybankApps = newData.map((app: any) => ({
              id: `maybank-${app.id}`,
              personal_details: {
                firstName: app.first_name || '',
                lastName: app.last_name || '',
                middleName: app.middle_name || '',
                emailAddress: '',
                mobileNumber: '',
              },
              status: app.status || '',
              agent: app.agent_cd || '',
              encoder: '',
              submitted_at: app.encoding_date || app.created_at || null,
              isMaybankApplication: true,
              originalData: app,
              bank_preferences: { maybank: true },
              applicationNo: app.application_no,
              cardType: app.card_type,
              declineReason: app.decline_reason,
              applnType: app.appln_type,
              sourceCd: app.source_cd,
              agencyBrName: app.agency_br_name,
              month: app.month,
              remarks: app.remarks,
              oCodes: app.o_codes,
            }));
            setMaybankApplications(normalizedMaybankApps);
          }
        }
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      setToast({ show: true, message: 'Error processing CSV file', type: 'error' });
    } finally {
      setImportingCSV(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // CSV Import handler for bank tables
  const handleBankCSVImport = async (event: React.ChangeEvent<HTMLInputElement>, bankName: string) => {
    try {
      setImportingBank(bankName);
      setLoading(true);
      await handleCSVUpload(
        event,
        bankName,
        (count) => {
          const bankLabel = BANKS.find(b => b.value === bankName)?.label || bankName;
          setToast({ 
            show: true, 
            message: `Successfully imported ${count} records to ${bankLabel}`, 
            type: 'success' 
          });
          // Refresh the data after import
          // Trigger a re-fetch by updating a state variable
          setSelectedBank(selectedBank);
          // Refresh bank applications data
          fetchBankApplications();
        },
        (error) => {
          const bankLabel = BANKS.find(b => b.value === bankName)?.label || bankName;
          setToast({ 
            show: true, 
            message: `Error importing CSV to ${bankLabel}: ${error.message || error}`, 
            type: 'error' 
          });
        }
      );
    } catch (error) {
      const bankLabel = BANKS.find(b => b.value === bankName)?.label || bankName;
      setToast({ 
        show: true, 
        message: `Error importing CSV to ${bankLabel}: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setImportingBank(null);
    }
  };

  const handleExportPDF = () => {
    exportHistoryToPDF();
    setShowExportPreview(false);
  };

  // Handler to view bank application details
  const handleViewBankApplication = async (app: any) => {
    setLoadingBankApp(true);
    setViewBankApp(app);
    
    try {
      // If it's a bank application with originalData, we already have all the data we need
      if (app.originalData) {
        // No need to fetch additional data - we already have it in originalData
        console.log('Bank application data already available:', app.originalData);
      } else {
        // For regular KYC applications, fetch the full data from kyc_details table
        const id = app.id.startsWith('kyc-') ? app.id.replace('kyc-', '') : app.id;
        const { data, error } = await supabase
          .from('kyc_details')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching KYC application details:', error);
          setToast({ show: true, message: 'Failed to fetch application details', type: 'error' });
        } else if (data) {
          const flattenedData = flattenApplicationData(data);
          setViewBankApp({ ...app, fullData: flattenedData });
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching bank application:', error);
      setToast({ show: true, message: 'Unexpected error while fetching application details', type: 'error' });
    } finally {
      setLoadingBankApp(false);
    }
  };

  // Filtering logic (copied from AdminDashboard)
  const filteredApplications = applications.filter(app => {
    const search = nameFilter.trim().toLowerCase();
    let matchesSearch = true;
    if (search) {
      // Applicant name
      const applicantName = `${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.toLowerCase();
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
      // Bank codes from agent
      let bankCodes = '';
      if (agent && Array.isArray(agent.bank_codes)) {
        bankCodes = agent.bank_codes.map((entry: any) => (entry.code || '').toLowerCase()).join(' ');
      }
      matchesSearch =
        applicantName.includes(search) ||
        agentName1.includes(search) ||
        agentName2.includes(search) ||
        agentName.includes(search) ||
        bankCodes.includes(search);
    }
    return matchesSearch;
  });

  // Sort applications by date
  const sortedApplications = [...applications].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  // Filter applications based on search for applications section
  const filteredApplicationsForSearch = sortedApplications.filter(app => {
    const search = applicationsSearchFilter.trim().toLowerCase();
    if (!search) return true;
    
    // Applicant name
    const applicantName = `${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.toLowerCase();
    
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
    
    return applicantName.includes(search) ||
           agentName1.includes(search) ||
           agentName2.includes(search) ||
           agentName.includes(search) ||
           bankCodes.includes(search) ||
           bankNames.includes(search) ||
           appBankPreferences.includes(search);
  });

  // For filtered lists:
  const sortedFilteredApplications = [...filteredApplications].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  // Update paginated lists:
  const paginatedApplications = filteredApplicationsForSearch.slice(0, applicationsPage * PAGE_SIZE);
  const paginatedHistory = sortedFilteredApplications.slice(0, historyPage * PAGE_SIZE);

  // Reset pagination when switching sections or filters
  useEffect(() => { setApplicationsPage(1); }, [activeSection, applicationsSearchFilter]);
  useEffect(() => { setHistoryPage(1); }, [activeSection, nameFilter]);



  // Bank Status Modal handlers
  const handleOpenBankStatusModal = (application: any) => {
    setSelectedApplicationForStatus(application);
    setBankStatusModalOpen(true);
  };

  const handleCloseBankStatusModal = () => {
    setBankStatusModalOpen(false);
    setSelectedApplicationForStatus(null);
  };

  const handleDeleteBankStatus = async (applicationId: string, bankName: string) => {
    try {
      // Delete the specific bank status from database
      const { error } = await supabase
        .from('bank_status')
        .delete()
        .eq('application_id', applicationId)
        .eq('bank_name', bankName);

      if (error) {
        console.error('Error deleting bank status:', error);
        setToast({ 
          show: true, 
          message: 'Failed to delete bank status: ' + error.message, 
          type: 'error' 
        });
        return;
      }

      // Update local state
      setApplicationsBankStatus(prev => {
        const newStatus = { ...prev };
        if (newStatus[applicationId]) {
          delete newStatus[applicationId][bankName];
          // If no more statuses for this application, remove the entire entry
          if (Object.keys(newStatus[applicationId]).length === 0) {
            delete newStatus[applicationId];
          }
        }
        return newStatus;
      });
      
      setToast({ 
        show: true, 
        message: 'Bank status deleted successfully', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error deleting bank status:', error);
      setToast({ 
        show: true, 
        message: 'Failed to delete bank status: ' + (error instanceof Error ? error.message : 'Unknown error'), 
        type: 'error' 
      });
    }
  };

  const handleUpdateBankStatus = async (applicationId: string, bankStatus: Record<string, string>) => {
    try {
      // Save bank status to database
      const bankStatusEntries = Object.entries(bankStatus).map(([bankName, status]) => ({
        application_id: applicationId,
        bank_name: bankName,
        status: status,
        updated_by: user?.email || 'unknown'
      }));

      // Delete existing status entries for this application
      const { error: deleteError } = await supabase
        .from('bank_status')
        .delete()
        .eq('application_id', applicationId);

      if (deleteError) {
        console.error('Error deleting existing bank status:', deleteError);
        setToast({ 
          show: true, 
          message: 'Failed to update bank status: ' + deleteError.message, 
          type: 'error' 
        });
        return;
      }

      // Insert new status entries
      if (bankStatusEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('bank_status')
          .insert(bankStatusEntries);

        if (insertError) {
          console.error('Error inserting bank status:', insertError);
          setToast({ 
            show: true, 
            message: 'Failed to update bank status: ' + insertError.message, 
            type: 'error' 
          });
          return;
        }
      }

      // Update local state
      setApplicationsBankStatus(prev => ({
        ...prev,
        [applicationId]: bankStatus
      }));
      
      setToast({ 
        show: true, 
        message: 'Bank status updated successfully', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error updating bank status:', error);
      setToast({ 
        show: true, 
        message: 'Failed to update bank status: ' + (error instanceof Error ? error.message : 'Unknown error'), 
        type: 'error' 
      });
    }
  };

  const handleDeleteBankApplication = async (app: any, bankName: string) => {
    try {
      setLoading(true);
      
      // Determine the table name based on the bank
      const tableName = bankName;
      
      // Get the ID from the application's original data
      const recordId = app.originalData?.id;
      
      if (!recordId) {
        setToast({
          show: true,
          message: 'Could not identify the application to delete',
          type: 'error'
        });
        return;
      }
      
      // Delete from the bank table using id as primary key
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', recordId);
      
      if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        setToast({
          show: true,
          message: `Failed to delete application from ${bankName}: ${error.message}`,
          type: 'error'
        });
        return;
      }
      
      // Success - show success message
      setToast({
        show: true,
        message: `Application deleted successfully from ${bankName}`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Unexpected error deleting bank application:', error);
      setToast({
        show: true,
        message: 'Unexpected error while deleting application',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
    
    // Refresh the data after the operation is complete (outside try-catch)
    try {
      await fetchBankApplications();
    } catch (refreshError) {
      console.error('Error refreshing data after delete:', refreshError);
      // Don't show error toast for refresh failure, just log it
    }
  };

  // Status Report functions
  const getBankApplications = (bankValue: string) => {
    const bankApplicationsMap: Record<string, any[]> = {
      maybank: maybankApplications,
      bpi: bpiApplications,
      rcbc: rcbcApplications,
      metrobank: metrobankApplications,
      eastwest: eastwestApplications,
      pnb: pnbApplications,
      aub: aubApplications,
      robinsons: robinsonsApplications,
    };
    // Only return data from bank-specific tables, not from general applications
    return bankApplicationsMap[bankValue] || [];
  };

  const getBankStats = (bankValue: string) => {
    const bankApplicationsMap: Record<string, any[]> = {
      maybank: maybankApplications,
      bpi: bpiApplications,
      rcbc: rcbcApplications,
      metrobank: metrobankApplications,
      eastwest: eastwestApplications,
      pnb: pnbApplications,
      aub: aubApplications,
      robinsons: robinsonsApplications,
    };
    // Only use data from bank-specific tables
    const bankApps = bankApplicationsMap[bankValue] || [];
    const pending = bankApps.filter(app => app.status === 'pending').length;
    const approved = bankApps.filter(app => app.status === 'approved').length;
    const rejected = bankApps.filter(app => app.status === 'rejected').length;
    const cancelled = bankApps.filter(app => app.status === 'cancelled').length;
    const incomplete = bankApps.filter(app => app.status === 'incomplete').length;
    const inProcess = bankApps.filter(app => app.status === 'in_process').length;
    const existing = bankApps.filter(app => app.status === 'existing').length;
    
    return {
      total: bankApps.length,
      pending,
      approved,
      rejected,
      cancelled,
      incomplete,
      inProcess,
      existing,
      unknown: 0,
      submitted: 0,
      turnIn: 0
    };
  };

  // Function to refresh status report data
  const refreshStatusReport = async () => {
    try {
      console.log('Refreshing status report data...');
      await fetchBankApplications();
      setToast({ show: true, message: 'Status report refreshed successfully', type: 'success' });
    } catch (error) {
      console.error('Error refreshing status report:', error);
      setToast({ show: true, message: 'Failed to refresh status report', type: 'error' });
    }
  };
  
  // Add these functions for edit application modal
  const renderEditStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex space-x-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentEditStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-8 h-1 mx-2 ${currentEditStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditStepContent = (app: any, setApp: (a: any) => void) => {
    switch (currentEditStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Personal Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="font-medium">First Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.firstName ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, firstName: e.target.value } })} /></div>
                <div><label className="font-medium">Middle Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.middleName ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, middleName: e.target.value } })} /></div>
                <div><label className="font-medium">Last Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.lastName ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, lastName: e.target.value } })} /></div>
                <div><label className="font-medium">Suffix:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.suffix ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, suffix: e.target.value } })} /></div>
                <div><label className="font-medium">Gender:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.gender ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, gender: e.target.value } })} /></div>
                <div><label className="font-medium">Date of Birth:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.dateOfBirth ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, dateOfBirth: e.target.value } })} /></div>
                <div><label className="font-medium">Place of Birth:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.placeOfBirth ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, placeOfBirth: e.target.value } })} /></div>
                <div><label className="font-medium">Civil Status:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.civilStatus ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, civilStatus: e.target.value } })} /></div>
                <div><label className="font-medium">Nationality:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.nationality ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, nationality: e.target.value } })} /></div>
                <div><label className="font-medium">Mobile Number:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.mobileNumber ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, mobileNumber: e.target.value } })} /></div>
                <div><label className="font-medium">Home Number:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.homeNumber ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, homeNumber: e.target.value } })} /></div>
                <div><label className="font-medium">Email Address:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.emailAddress ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, emailAddress: e.target.value } })} /></div>
                <div><label className="font-medium">SSS/GSIS/UMID:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.sssGsisUmid ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, sssGsisUmid: e.target.value } })} /></div>
                <div><label className="font-medium">TIN:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_details?.tin ?? ''} onChange={e => setApp({ ...app, personal_details: { ...app.personal_details, tin: e.target.value } })} /></div>
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
                <div><label className="font-medium">Last Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.mother_details?.lastName ?? ''} onChange={e => setApp({ ...app, mother_details: { ...app.mother_details, lastName: e.target.value } })} /></div>
                <div><label className="font-medium">First Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.mother_details?.firstName ?? ''} onChange={e => setApp({ ...app, mother_details: { ...app.mother_details, firstName: e.target.value } })} /></div>
                <div><label className="font-medium">Middle Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.mother_details?.middleName ?? ''} onChange={e => setApp({ ...app, mother_details: { ...app.mother_details, middleName: e.target.value } })} /></div>
                <div><label className="font-medium">Suffix:</label> <input className="border rounded px-2 py-1 w-full" value={app.mother_details?.suffix ?? ''} onChange={e => setApp({ ...app, mother_details: { ...app.mother_details, suffix: e.target.value } })} /></div>
              </div>
            </div>
            {/* Permanent Address */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Permanent Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="font-medium">Street:</label> <input className="border rounded px-2 py-1 w-full" value={app.permanent_address?.street ?? ''} onChange={e => setApp({ ...app, permanent_address: { ...app.permanent_address, street: e.target.value } })} /></div>
                <div><label className="font-medium">Barangay:</label> <input className="border rounded px-2 py-1 w-full" value={app.permanent_address?.barangay ?? ''} onChange={e => setApp({ ...app, permanent_address: { ...app.permanent_address, barangay: e.target.value } })} /></div>
                <div><label className="font-medium">City:</label> <input className="border rounded px-2 py-1 w-full" value={app.permanent_address?.city ?? ''} onChange={e => setApp({ ...app, permanent_address: { ...app.permanent_address, city: e.target.value } })} /></div>
                <div><label className="font-medium">Zip Code:</label> <input className="border rounded px-2 py-1 w-full" value={app.permanent_address?.zipCode ?? ''} onChange={e => setApp({ ...app, permanent_address: { ...app.permanent_address, zipCode: e.target.value } })} /></div>
                <div><label className="font-medium">Years of Stay:</label> <input className="border rounded px-2 py-1 w-full" value={app.permanent_address?.yearsOfStay ?? ''} onChange={e => setApp({ ...app, permanent_address: { ...app.permanent_address, yearsOfStay: e.target.value } })} /></div>
              </div>
            </div>
            {/* Spouse Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Spouse Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="font-medium">Last Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.spouse_details?.lastName ?? ''} onChange={e => setApp({ ...app, spouse_details: { ...app.spouse_details, lastName: e.target.value } })} /></div>
                <div><label className="font-medium">First Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.spouse_details?.firstName ?? ''} onChange={e => setApp({ ...app, spouse_details: { ...app.spouse_details, firstName: e.target.value } })} /></div>
                <div><label className="font-medium">Middle Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.spouse_details?.middleName ?? ''} onChange={e => setApp({ ...app, spouse_details: { ...app.spouse_details, middleName: e.target.value } })} /></div>
                <div><label className="font-medium">Suffix:</label> <input className="border rounded px-2 py-1 w-full" value={app.spouse_details?.suffix ?? ''} onChange={e => setApp({ ...app, spouse_details: { ...app.spouse_details, suffix: e.target.value } })} /></div>
                <div><label className="font-medium">Mobile Number:</label> <input className="border rounded px-2 py-1 w-full" value={app.spouse_details?.mobileNumber ?? ''} onChange={e => setApp({ ...app, spouse_details: { ...app.spouse_details, mobileNumber: e.target.value } })} /></div>
              </div>
            </div>
            {/* Personal Reference */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="font-medium">Last Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_reference?.lastName ?? ''} onChange={e => setApp({ ...app, personal_reference: { ...app.personal_reference, lastName: e.target.value } })} /></div>
                <div><label className="font-medium">First Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_reference?.firstName ?? ''} onChange={e => setApp({ ...app, personal_reference: { ...app.personal_reference, firstName: e.target.value } })} /></div>
                <div><label className="font-medium">Middle Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_reference?.middleName ?? ''} onChange={e => setApp({ ...app, personal_reference: { ...app.personal_reference, middleName: e.target.value } })} /></div>
                <div><label className="font-medium">Suffix:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_reference?.suffix ?? ''} onChange={e => setApp({ ...app, personal_reference: { ...app.personal_reference, suffix: e.target.value } })} /></div>
                <div><label className="font-medium">Mobile Number:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_reference?.mobileNumber ?? ''} onChange={e => setApp({ ...app, personal_reference: { ...app.personal_reference, mobileNumber: e.target.value } })} /></div>
                <div><label className="font-medium">Relationship:</label> <input className="border rounded px-2 py-1 w-full" value={app.personal_reference?.relationship ?? ''} onChange={e => setApp({ ...app, personal_reference: { ...app.personal_reference, relationship: e.target.value } })} /></div>
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
                <div><label className="font-medium">Business/Employer's Name:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.businessEmployerName ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, businessEmployerName: e.target.value } })} /></div>
                <div><label className="font-medium">Profession/Occupation:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.professionOccupation ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, professionOccupation: e.target.value } })} /></div>
                <div><label className="font-medium">Nature of Business:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.natureOfBusiness ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, natureOfBusiness: e.target.value } })} /></div>
                <div><label className="font-medium">Department:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.department ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, department: e.target.value } })} /></div>
                <div><label className="font-medium">Landline/Mobile:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.landlineMobile ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, landlineMobile: e.target.value } })} /></div>
                <div><label className="font-medium">Years in Business:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.yearsInBusiness ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, yearsInBusiness: e.target.value } })} /></div>
                <div><label className="font-medium">Monthly Income:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.monthlyIncome ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, monthlyIncome: e.target.value } })} /></div>
                <div><label className="font-medium">Annual Income:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.annualIncome ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, annualIncome: e.target.value } })} /></div>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Business/Office Address</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="font-medium">Street:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.address?.street ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, address: { ...app.work_details?.address, street: e.target.value } } })} /></div>
                  <div><label className="font-medium">Barangay:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.address?.barangay ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, address: { ...app.work_details?.address, barangay: e.target.value } } })} /></div>
                  <div><label className="font-medium">City:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.address?.city ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, address: { ...app.work_details?.address, city: e.target.value } } })} /></div>
                  <div><label className="font-medium">Zip Code:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.address?.zipCode ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, address: { ...app.work_details?.address, zipCode: e.target.value } } })} /></div>
                  <div><label className="font-medium">Unit/Floor:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.address?.unitFloor ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, address: { ...app.work_details?.address, unitFloor: e.target.value } } })} /></div>
                  <div><label className="font-medium">Building/Tower:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.address?.buildingTower ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, address: { ...app.work_details?.address, buildingTower: e.target.value } } })} /></div>
                  <div><label className="font-medium">Lot No.:</label> <input className="border rounded px-2 py-1 w-full" value={app.work_details?.address?.lotNo ?? ''} onChange={e => setApp({ ...app, work_details: { ...app.work_details, address: { ...app.work_details?.address, lotNo: e.target.value } } })} /></div>
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
                <div><label className="font-medium">Bank/Institution:</label> <input className="border rounded px-2 py-1 w-full" value={app.credit_card_details?.bankInstitution ?? ''} onChange={e => setApp({ ...app, credit_card_details: { ...app.credit_card_details, bankInstitution: e.target.value } })} /></div>
                <div><label className="font-medium">Card Number:</label> <input className="border rounded px-2 py-1 w-full" value={app.credit_card_details?.cardNumber ?? ''} onChange={e => setApp({ ...app, credit_card_details: { ...app.credit_card_details, cardNumber: e.target.value } })} /></div>
                <div><label className="font-medium">Credit Limit:</label> <input className="border rounded px-2 py-1 w-full" value={app.credit_card_details?.creditLimit ?? ''} onChange={e => setApp({ ...app, credit_card_details: { ...app.credit_card_details, creditLimit: e.target.value } })} /></div>
                <div><label className="font-medium">Member Since:</label> <input className="border rounded px-2 py-1 w-full" value={app.credit_card_details?.memberSince ?? ''} onChange={e => setApp({ ...app, credit_card_details: { ...app.credit_card_details, memberSince: e.target.value } })} /></div>
                <div><label className="font-medium">Exp. Date:</label> <input className="border rounded px-2 py-1 w-full" value={app.credit_card_details?.expirationDate ?? ''} onChange={e => setApp({ ...app, credit_card_details: { ...app.credit_card_details, expirationDate: e.target.value } })} /></div>
                <div><label className="font-medium">Deliver Card To:</label><select className="border rounded px-2 py-1 w-full" value={app.credit_card_details?.deliverCardTo ?? ''} onChange={e => setApp({ ...app, credit_card_details: { ...app.credit_card_details, deliverCardTo: e.target.value as 'home' | 'business' } })}>
                  <option value="home">Present Home Address</option>
                  <option value="business">Business Address</option>
                </select></div>
                <div><label className="font-medium">Best Time to Contact:</label> <input className="border rounded px-2 py-1 w-full" value={app.credit_card_details?.bestTimeToContact ?? ''} onChange={e => setApp({ ...app, credit_card_details: { ...app.credit_card_details, bestTimeToContact: e.target.value } })} /></div>
              </div>
            </div>
            {/* Bank Preferences */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Bank Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BANKS.map(bank => (
                    <label key={bank.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!(app.bank_preferences && app.bank_preferences[bank.value])}
                        onChange={(e) => setApp({
                          ...app,
                          bank_preferences: {
                            ...(app.bank_preferences || {}),
                            [bank.value]: e.target.checked
                          }
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{bank.label}</span>
                    </label>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Section renderers
  const renderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Moderator Dashboard</h2>
      <p className="text-gray-600 mb-6">Welcome back! Here's what's happening today.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-blue-500 mr-2" /> <span className="font-semibold">Total Applications</span></div>
          <div className="text-2xl font-bold">{totalApplications}</div>
          <div className="text-green-600 text-xs mt-1">↑+12% from last month</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><Users className="w-6 h-6 text-purple-500 mr-2" /> <span className="font-semibold">Total Users</span></div>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <div className="text-green-600 text-xs mt-1">↑+2 from last month</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold mb-4">Recent Applications</h3>
          {applications && applications.length > 0 ? (
            <ul>
              {applications
                .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
                .slice(0, 5)
                .map((app) => (
                  <li key={app.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <span className="font-medium">{`${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.trim()}</span>
                      <span className="ml-2 text-xs text-gray-500">{app.submitted_at ? format(new Date(app.submitted_at), 'MMM dd, yyyy') : ''}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2
                      ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>{app.status ?? ''}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-sm">No recent applications.</div>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'dashboard' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-blue-700 border-transparent hover:bg-blue-100'}`} onClick={() => setActiveSection('dashboard')}><List className="w-5 h-5 mr-2" /> Dashboard</button>
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'applications' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-blue-700 border-transparent hover:bg-blue-100'}`} onClick={() => setActiveSection('applications')}><FileText className="w-5 h-5 mr-2" /> Client Applications</button>
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'statusReport' ? 'bg-green-50 text-green-700 border-green-400' : 'bg-white text-green-700 border-transparent hover:bg-green-100'}`} onClick={() => setActiveSection('statusReport')}><BarChart3 className="w-5 h-5 mr-2" /> Status Report</button>
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'users' ? 'bg-purple-50 text-purple-700 border-purple-400' : 'bg-white text-purple-700 border-transparent hover:bg-purple-100'}`} onClick={() => setActiveSection('users')}><Users className="w-5 h-5 mr-2" /> User Management</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatusReport = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Status Report</h2>
          <p className="text-gray-600">Track application status by bank</p>
        </div>
        <button
          onClick={refreshStatusReport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {!selectedBank ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {BANKS.map((bank) => {
            const stats = getBankStats(bank.value);
            return (
              <button
                key={bank.value}
                onClick={() => setSelectedBank(bank.value)}
                className="bg-white rounded-xl p-4 sm:p-6 shadow hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3">
                    <img 
                      src={bank.logo} 
                      alt={`${bank.label} logo`} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to colored circle if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div 
                      className={`hidden w-12 h-12 rounded-full bg-gray-200 items-center justify-center`}
                      style={{ display: 'none' }}
                    >
                      <span className="font-bold text-lg text-gray-600">{bank.label.charAt(0)}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{bank.label}</h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-semibold text-yellow-600">{stats.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-semibold text-green-600">{stats.approved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected:</span>
                      <span className="font-semibold text-red-600">{stats.rejected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled:</span>
                      <span className="font-semibold text-gray-600">{stats.cancelled || 0}</span>
                    </div>
                    {stats.incomplete > 0 && (
                      <div className="flex justify-between">
                        <span>Incomplete:</span>
                        <span className="font-semibold text-orange-600">{stats.incomplete}</span>
                      </div>
                    )}
                    {stats.inProcess > 0 && (
                      <div className="flex justify-between">
                        <span>In Process:</span>
                        <span className="font-semibold text-blue-600">{stats.inProcess}</span>
                      </div>
                    )}
                    {stats.existing > 0 && (
                      <div className="flex justify-between">
                        <span>Existing:</span>
                        <span className="font-semibold text-purple-600">{stats.existing}</span>
                      </div>
                    )}
                    {(stats.unknown > 0) && (
                      <div className="flex justify-between">
                        <span>Other:</span>
                        <span className="font-semibold text-blue-600">{stats.unknown}</span>
                      </div>
                    )}
                    {stats.submitted > 0 && (
                      <div className="flex justify-between">
                        <span>Submitted:</span>
                        <span className="font-semibold text-blue-600">{stats.submitted}</span>
                      </div>
                    )}
                    {stats.turnIn > 0 && (
                      <div className="flex justify-between">
                        <span>Turn-In:</span>
                        <span className="font-semibold text-purple-600">{stats.turnIn}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedBank('')}
                className="mr-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm sm:text-base"
              >
                ← Back to Banks
              </button>
              <h3 className="text-lg sm:text-xl font-semibold">
                {BANKS.find(b => b.value === selectedBank)?.label} Applications
              </h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  className="border rounded-lg px-3 py-2 flex-1 text-sm sm:text-base"
                  placeholder="Search by applicant name..."
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                />
                <label className={`cursor-pointer ${importingBank === selectedBank ? 'pointer-events-none' : ''}`}>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleBankCSVImport(e, selectedBank)}
                    disabled={importingBank === selectedBank}
                  />
                  <div className={`flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    importingBank === selectedBank 
                      ? 'text-gray-500 bg-gray-100 cursor-not-allowed' 
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                  }`}>
                    {importingBank === selectedBank ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="hidden sm:inline">Importing CSV...</span>
                        <span className="sm:hidden">Importing...</span>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        <span className="hidden sm:inline">Import CSV</span>
                        <span className="sm:hidden">Import</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getBankApplications(selectedBank)
                    .filter(app => {
                      const search = nameFilter.toLowerCase();
                      const name = `${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.toLowerCase();
                      const email = (app.personal_details?.emailAddress ?? '').toLowerCase();
                      
                      const matchesSearch = !search || 
                        name.includes(search) || 
                        email.includes(search);
                      return matchesSearch;
                    })
                    .map((app) => (
                      <tr key={app.id || app.applicationNo || app.application_no} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {`${app.personal_details?.firstName || app.first_name || ''} ${app.personal_details?.lastName || app.last_name || ''}`.trim()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.personal_details?.emailAddress || app.email_address || app.email || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            (() => {
                              const status = app.status || 'pending';
                              if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
                              if (status === 'approved') return 'bg-green-100 text-green-800';
                              if (status === 'rejected') return 'bg-red-100 text-red-800';
                              if (status === 'cancelled') return 'bg-gray-100 text-gray-800';
                              if (status === 'incomplete') return 'bg-orange-100 text-orange-800';
                              if (status === 'in_process') return 'bg-blue-100 text-blue-800';
                              if (status === 'existing') return 'bg-purple-100 text-purple-800';
                              return 'bg-gray-100 text-gray-600';
                            })()
                          }`}>
                            {app.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.submitted_at || app.encoding_date || app.appln_date ? format(new Date(app.submitted_at || app.encoding_date || app.appln_date), 'MMM dd, yyyy') : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.submitted_by || app.agent || app.agent_cd || 'Direct'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 p-1 rounded"
                              onClick={() => handleViewBankApplication(app)}
                              title="View Application Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {/* Delete button for bank applications */}
                            {(() => {
                              // Only show delete button for applications with direct status from bank tables
                              if (app.isMaybankApplication || app.originalData) {
                                return (
                                  <button 
                                    className="text-red-600 hover:text-red-800 p-1 rounded"
                                    onClick={() => {
                                      setConfirmationModal({
                                        isOpen: true,
                                        title: 'Delete Application',
                                        message: `Are you sure you want to delete the application for ${app.personal_details?.firstName || app.first_name} ${app.personal_details?.lastName || app.last_name}? This action cannot be undone.`,
                                        onConfirm: () => handleDeleteBankApplication(app, selectedBank),
                                        type: 'danger'
                                      });
                                    }}
                                    title="Delete Application"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                );
                              }
                              return null;
                            })()}
                            {(() => {
                              // For applications with direct status from bank tables
                              if (app.isMaybankApplication || app.originalData) {
                                return null; // These are managed directly in the bank table
                              }
                              
                              // For applications with bank_status entries
                              const appBankStatus = applicationsBankStatus[app.id] || {};
                              const hasStatus = appBankStatus[selectedBank];
                              return hasStatus ? (
                                <button 
                                  className="text-red-600 hover:text-red-800 p-1 rounded"
                                  onClick={() => {
                                    setConfirmationModal({
                                      isOpen: true,
                                      title: 'Delete Bank Status',
                                      message: `Are you sure you want to delete the ${selectedBank.toUpperCase()} status for ${app.personal_details?.firstName || app.first_name} ${app.personal_details?.lastName || app.last_name}? This action cannot be undone.`,
                                      onConfirm: () => handleDeleteBankStatus(app.id, selectedBank),
                                      type: 'danger'
                                    });
                                  }}
                                  title="Delete Bank Status"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : null;
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Tablet Table */}
            <div className="hidden md:block lg:hidden overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getBankApplications(selectedBank)
                    .filter(app => {
                      const search = nameFilter.toLowerCase();
                      const name = `${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.toLowerCase();
                      const email = (app.personal_details?.emailAddress ?? '').toLowerCase();
                      
                      const matchesSearch = !search || 
                        name.includes(search) || 
                        email.includes(search);
                      return matchesSearch;
                    })
                    .map((app) => (
                      <tr key={app.id || app.applicationNo || app.application_no} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900 text-sm">
                            {`${app.personal_details?.firstName || app.first_name || ''} ${app.personal_details?.lastName || app.last_name || ''}`.trim()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {app.personal_details?.emailAddress || app.email_address || app.email || ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            Agent: {app.submitted_by || app.agent || app.agent_cd || 'Direct'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            (() => {
                              if (app.isMaybankApplication || app.originalData) {
                                const status = app.status || 'pending';
                                if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
                                if (status === 'accepted' || status === 'approved') return 'bg-green-100 text-green-800';
                                if (status === 'rejected') return 'bg-red-100 text-red-800';
                                if (status === 'submitted') return 'bg-blue-100 text-blue-800';
                                if (status === 'turn-in') return 'bg-purple-100 text-purple-800';
                                return 'bg-gray-100 text-gray-600';
                              } else {
                                const appBankStatus = applicationsBankStatus[app.id] || {};
                                const bankStatus = appBankStatus[selectedBank];
                                if (bankStatus === 'pending') return 'bg-yellow-100 text-yellow-800';
                                if (bankStatus === 'accepted') return 'bg-green-100 text-green-800';
                                if (bankStatus === 'rejected') return 'bg-red-100 text-red-800';
                                return 'bg-gray-100 text-gray-600';
                              }
                            })()
                          }`}>
                            {(() => {
                              if (app.isMaybankApplication || app.originalData) {
                                return app.status || 'pending';
                              } else {
                                const appBankStatus = applicationsBankStatus[app.id] || {};
                                return appBankStatus[selectedBank] || '-';
                              }
                            })()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {app.submitted_at || app.encoding_date || app.appln_date ? format(new Date(app.submitted_at || app.encoding_date || app.appln_date), 'MMM dd, yyyy') : ''}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 p-1 rounded"
                              onClick={() => handleViewBankApplication(app)}
                              title="View Application Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(() => {
                              if (app.isMaybankApplication || app.originalData) {
                                return (
                                  <button 
                                    className="text-red-600 hover:text-red-800 p-1 rounded"
                                    onClick={() => {
                                      setConfirmationModal({
                                        isOpen: true,
                                        title: 'Delete Application',
                                        message: `Are you sure you want to delete the application for ${app.personal_details?.firstName || app.first_name} ${app.personal_details?.lastName || app.last_name}? This action cannot be undone.`,
                                        onConfirm: () => handleDeleteBankApplication(app, selectedBank),
                                        type: 'danger'
                                      });
                                    }}
                                    title="Delete Application"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                );
                              }
                              return null;
                            })()}
                            {(() => {
                              if (app.isMaybankApplication || app.originalData) {
                                return null;
                              }
                              const appBankStatus = applicationsBankStatus[app.id] || {};
                              const hasStatus = appBankStatus[selectedBank];
                              return hasStatus ? (
                                <button 
                                  className="text-red-600 hover:text-red-800 p-1 rounded"
                                  onClick={() => {
                                    setConfirmationModal({
                                      isOpen: true,
                                      title: 'Delete Bank Status',
                                      message: `Are you sure you want to delete the ${selectedBank.toUpperCase()} status for ${app.personal_details?.firstName || app.first_name} ${app.personal_details?.lastName || app.last_name}? This action cannot be undone.`,
                                      onConfirm: () => handleDeleteBankStatus(app.id, selectedBank),
                                      type: 'danger'
                                    });
                                  }}
                                  title="Delete Bank Status"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : null;
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="block md:hidden">
              {getBankApplications(selectedBank)
                .filter(app => {
                  const search = nameFilter.toLowerCase();
                  const name = `${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.toLowerCase();
                  const email = (app.personal_details?.emailAddress ?? '').toLowerCase();
                  
                  const matchesSearch = !search || 
                    name.includes(search) || 
                    email.includes(search);
                  return matchesSearch;
                })
                .map((app) => (
                  <div key={app.id || app.applicationNo || app.application_no} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {`${app.personal_details?.firstName || app.first_name || ''} ${app.personal_details?.lastName || app.last_name || ''}`.trim()}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {app.personal_details?.emailAddress || app.email_address || app.email || ''}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                        (() => {
                          if (app.isMaybankApplication || app.originalData) {
                            const status = app.status || 'pending';
                            if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
                            if (status === 'accepted' || status === 'approved') return 'bg-green-100 text-green-800';
                            if (status === 'rejected') return 'bg-red-100 text-red-800';
                            if (status === 'submitted') return 'bg-blue-100 text-blue-800';
                            if (status === 'turn-in') return 'bg-purple-100 text-purple-800';
                            return 'bg-gray-100 text-gray-600';
                          } else {
                            const appBankStatus = applicationsBankStatus[app.id] || {};
                            const bankStatus = appBankStatus[selectedBank];
                            if (bankStatus === 'pending') return 'bg-yellow-100 text-yellow-800';
                            if (bankStatus === 'accepted') return 'bg-green-100 text-green-800';
                            if (bankStatus === 'rejected') return 'bg-red-100 text-red-800';
                            return 'bg-gray-100 text-gray-600';
                          }
                        })()
                      }`}>
                        {(() => {
                          if (app.isMaybankApplication || app.originalData) {
                            return app.status || 'pending';
                          } else {
                            const appBankStatus = applicationsBankStatus[app.id] || {};
                            return appBankStatus[selectedBank] || '-';
                          }
                        })()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <div>{app.submitted_at || app.encoding_date || app.appln_date ? format(new Date(app.submitted_at || app.encoding_date || app.appln_date), 'MMM dd, yyyy') : ''}</div>
                      </div>
                      <div>
                        <span className="font-medium">Agent:</span>
                        <div>{app.submitted_by || app.agent || app.agent_cd || 'Direct'}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                        onClick={() => handleViewBankApplication(app)}
                        title="View Application Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(() => {
                        if (app.isMaybankApplication || app.originalData) {
                          return (
                            <button 
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                              onClick={() => {
                                setConfirmationModal({
                                  isOpen: true,
                                  title: 'Delete Application',
                                  message: `Are you sure you want to delete the application for ${app.personal_details?.firstName || app.first_name} ${app.personal_details?.lastName || app.last_name}? This action cannot be undone.`,
                                  onConfirm: () => handleDeleteBankApplication(app, selectedBank),
                                  type: 'danger'
                                });
                              }}
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          );
                        }
                        return null;
                      })()}
                      {(() => {
                        if (app.isMaybankApplication || app.originalData) {
                          return null;
                        }
                        const appBankStatus = applicationsBankStatus[app.id] || {};
                        const hasStatus = appBankStatus[selectedBank];
                        return hasStatus ? (
                          <button 
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                            onClick={() => {
                              setConfirmationModal({
                                isOpen: true,
                                title: 'Delete Bank Status',
                                message: `Are you sure you want to delete the ${selectedBank.toUpperCase()} status for ${app.personal_details?.firstName || app.first_name} ${app.personal_details?.lastName || app.last_name}? This action cannot be undone.`,
                                onConfirm: () => handleDeleteBankStatus(app.id, selectedBank),
                                type: 'danger'
                              });
                            }}
                            title="Delete Bank Status"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null;
                      })()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

    const renderApplications = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Client Applications</h2>
      <p className="text-gray-600 mb-6">Review and manage all client applications</p>
      <div className="bg-white rounded-xl p-6 shadow mb-6 w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row gap-4 w-full mb-4 items-start sm:items-end">
          <input
            className="border rounded-lg px-3 py-2 w-full sm:w-1/2 mb-2 sm:mb-0"
            placeholder="Search by applicant name, agent name, bank codes, or bank preferences..."
            value={applicationsSearchFilter}
            onChange={e => setApplicationsSearchFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md w-full overflow-x-hidden">
        <div className="w-full">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-xs text-gray-500 uppercase align-middle">
                <th className="py-2 align-middle w-1/5">Applicant</th>
                <th className="py-2 align-middle w-1/5">Email</th>
                <th className="py-2 min-w-[150px] px-4">Submitted</th>
                <th className="py-2 align-middle w-1/8">Submitted By</th>
                <th className="py-2 align-middle w-1/6">Bank Codes</th>
                <th className="py-2 align-middle w-1/8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApplications.map((app, i) => {
                // Find agent user if not direct
                let agentBankCodes = null;
                if (app.submitted_by && app.submitted_by !== 'direct') {
                  const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
                  if (agent && Array.isArray(agent.bank_codes) && agent.bank_codes.length > 0) {
                    agentBankCodes = agent.bank_codes;
                  }
                }
                return (
                  <tr key={app.id} className="border-t hover:bg-gray-50 transition">
                    <td className="py-3 px-6 align-middle font-semibold whitespace-nowrap max-w-[180px] truncate">
                      {`${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.trim()}
                    </td>
                    <td className="py-3 px-2 align-middle whitespace-nowrap text-sm text-gray-600 max-w-[180px] truncate">{app.personal_details?.emailAddress || app.email || ''}</td>
                    <td className="py-3 px-6 min-w-[170px] whitespace-nowrap text-sm">{app.submitted_at ? new Date(app.submitted_at).toLocaleString() : ''}</td>
                    <td className="py-3 px-2 align-middle whitespace-nowrap max-w-[80px] truncate">{!app.submitted_by || app.submitted_by === 'direct' ? 'direct' : app.submitted_by}</td>
                    <td className="py-3 px-6 align-middle whitespace-nowrap max-w-[140px] truncate">
                      {agentBankCodes ? (
                        <ul className="space-y-1">
                          {agentBankCodes.map((entry: any, idx: any) => (
                            <li key={idx} className="text-xs bg-blue-50 rounded px-2 py-1 inline-block mr-1 mb-1">
                              {BANKS.find(b => b.value === entry.bank)?.label || entry.bank}: <span className="font-mono">{entry.code}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        onClick={() => handleOpenBankStatusModal(app)}
                      >
                        Bank Status
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            {paginatedApplications.map((app, i) => {
              let agentBankCodes = null;
              if (app.submitted_by && app.submitted_by !== 'direct') {
                const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
                if (agent && Array.isArray(agent.bank_codes) && agent.bank_codes.length > 0) {
                  agentBankCodes = agent.bank_codes;
                }
              }
              return (
                <div key={app.id} className="p-4 mb-4">
                  <div className="mb-2 font-semibold text-lg">{`${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.trim()}</div>
                  <div className="mb-1 text-sm"><span className="font-medium">Email:</span> {app.personal_details?.emailAddress || app.email || ''}</div>
                  <div className="mb-1 text-sm"><span className="font-medium">Submitted:</span> {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : ''}</div>
                  <div className="mb-1 text-sm"><span className="font-medium">By:</span> {!app.submitted_by || app.submitted_by === 'direct' ? 'direct' : app.submitted_by}</div>
                  <div className="mb-1 text-sm"><span className="font-medium">Bank Codes:</span> {agentBankCodes ? (
                    <ul className="space-y-1">
                      {agentBankCodes.map((entry: any, idx: any) => (
                        <li key={idx} className="text-xs bg-blue-50 rounded px-2 py-1 inline-block mr-1 mb-1">
                          {BANKS.find(b => b.value === entry.bank)?.label || entry.bank}: <span className="font-mono">{entry.code}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-gray-400">-</span>}
                  </div>
                  <div className="mt-2">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={() => handleOpenBankStatusModal(app)}
                    >
                      Bank Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {applications.length > paginatedApplications.length && (
        <div className="flex justify-center mt-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700" onClick={() => setApplicationsPage(applicationsPage + 1)}>
            See More
          </button>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Application History</h2>
      <p className="text-gray-600 mb-6">View and export application records</p>
      {/* Application summary boxes */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 mb-8">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
          <div className="text-2xl font-bold">{totalApplications}</div>
          <div className="text-gray-500 text-sm mt-1">Total Applications</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
          <div className="text-2xl font-bold">{approved}</div>
          <div className="text-gray-500 text-sm mt-1">Approved</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
          <div className="text-2xl font-bold">{pendingReviews}</div>
          <div className="text-gray-500 text-sm mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
          <div className="text-2xl font-bold">{rejected}</div>
          <div className="text-gray-500 text-sm mt-1">Rejected</div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow mb-6 w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row gap-4 w-full mb-4 items-start sm:items-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 text-sm whitespace-nowrap mb-2 sm:mb-0"
            onClick={handleExportPreview}
            type="button"
          >
            Export as PDF
          </button>
          <input
            className="border rounded-lg px-3 py-2 w-full sm:w-1/2 ml-0 sm:ml-2"
            placeholder="Search by agent name or bank code..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
        </div>

      </div>
      {/* Desktop Table */}
      <div className="bg-white rounded-xl shadow-md w-full overflow-x-hidden">
        <div className="w-full">
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-xs text-gray-500 uppercase align-middle">
                  <th className="py-2 align-middle w-1/5">Applicant</th>
                  <th className="py-2 align-middle w-1/5">Email</th>
                  <th className="py-2 min-w-[150px] px-4">Submitted</th>
                  <th className="py-2 align-middle w-1/8">Submitted By</th>
                  <th className="py-2 align-middle w-1/8">Encoder</th>
                  <th className="py-2 align-middle w-1/6">Bank Codes</th>
                  <th className="py-2 align-middle w-1/8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((app, i) => {
                  let agentBankCodes = null;
                  if (app.submitted_by && app.submitted_by !== 'direct') {
                    const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
                    if (agent && Array.isArray(agent.bank_codes) && agent.bank_codes.length > 0) {
                      agentBankCodes = agent.bank_codes;
                    }
                  }
                  return (
                    <tr key={app.id} className="border-t hover:bg-gray-50 transition">
                      <td className="py-3 px-6 align-middle font-semibold whitespace-nowrap max-w-[180px] truncate">
                        {`${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`.trim()}
                      </td>
                      <td className="py-3 px-2 align-middle whitespace-nowrap text-sm text-gray-600 max-w-[180px] truncate">{app.personal_details?.emailAddress || app.email || ''}</td>
                      <td className="py-3 px-6 min-w-[170px] whitespace-nowrap text-sm">{app.submitted_at ? new Date(app.submitted_at).toLocaleString() : ''}</td>
                      <td className="py-3 px-2 align-middle whitespace-nowrap max-w-[80px] truncate">{!app.submitted_by || app.submitted_by === 'direct' ? 'direct' : app.submitted_by}</td>
                      <td className="py-3 px-2 align-middle whitespace-nowrap max-w-[80px] truncate">{app.encoder || app.submitted_by || 'direct'}</td>
                      <td className="py-3 px-2 align-middle whitespace-nowrap max-w-[140px] truncate">
                        {agentBankCodes ? (
                          <ul className="space-y-1">
                            {agentBankCodes.map((entry: any, idx: any) => (
                              <li key={idx} className="text-xs bg-blue-50 rounded px-2 py-1 inline-block mr-1 mb-1">
                                {BANKS.find(b => b.value === entry.bank)?.label || entry.bank}: <span className="font-mono">{entry.code}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800" onClick={() => handleViewApp(app)}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800" 
                          onClick={() => handleEditApp(app)} 
                          disabled={loadingEditApp}
                        >
                          {loadingEditApp ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-800" 
                          title="Export PDF" 
                          onClick={() => handleSingleExportPreview(app)}
                          disabled={exportingPDF}
                        >
                          {exportingPDF ? (
                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete Application" onClick={async () => {
                          if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;
                          let table = 'application_form';
                          let appId = app.id;
                          if (typeof app.id === 'string' && app.id.startsWith('kyc-')) {
                            table = 'kyc_details';
                            appId = app.id.replace('kyc-', '');
                          }
                          const { error } = await supabase.from(table).delete().eq('id', appId);
                          if (error) {
                            setToast({ show: true, message: 'Failed to delete application: ' + error.message, type: 'error' });
                          } else {
                            setApplications(apps => apps.filter(a => a.id !== app.id));
                            setToast({ show: true, message: 'Application deleted successfully!', type: 'success' });
                          }
                        }}><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            {paginatedHistory.map((app, i) => {
              let agentBankCodes = null;
              if (app.submitted_by && app.submitted_by !== 'direct') {
                const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
                if (agent && Array.isArray(agent.bank_codes) && agent.bank_codes.length > 0) {
                  agentBankCodes = agent.bank_codes;
                }
              }
              return (
                <div key={i} className="border-b py-4">
                  <div className="font-semibold">{app.personal_details?.firstName ?? ''} {app.personal_details?.lastName ?? ''}</div>
                  <div className="text-xs text-gray-500 mb-1">Date: {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : ''}</div>
                  <div className="text-sm mb-1">Submitted By: {app.submitted_by || 'direct'}</div>
                  <div className="text-sm mb-1">Encoder: {app.encoder || app.submitted_by || 'direct'}</div>
                  <div className="text-sm mb-1">Bank Codes: {agentBankCodes ? (
                    <ul className="space-y-1">
                      {agentBankCodes.map((entry: any, idx: any) => (
                        <li key={idx} className="text-xs bg-blue-50 rounded px-2 py-1 inline-block mr-1 mb-1">
                          {BANKS.find(b => b.value === entry.bank)?.label || entry.bank}: <span className="font-mono">{entry.code}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-gray-400">-</span>}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => handleViewApp(app)}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-800" 
                      onClick={() => handleEditApp(app)} 
                      disabled={loadingEditApp}
                    >
                      {loadingEditApp ? (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                    </button>
                    <button 
                      className="text-purple-600 hover:text-purple-800" 
                      title="Export PDF" 
                      onClick={() => handleSingleExportPreview(app)}
                      disabled={exportingPDF}
                    >
                      {exportingPDF ? (
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button className="text-red-600 hover:text-red-800" title="Delete Application" onClick={async () => {
                      if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;
                      let table = 'application_form';
                      let appId = app.id;
                      if (typeof app.id === 'string' && app.id.startsWith('kyc-')) {
                        table = 'kyc_details';
                        appId = app.id.replace('kyc-', '');
                      }
                      const { error } = await supabase.from(table).delete().eq('id', appId);
                      if (error) {
                        setToast({ show: true, message: 'Failed to delete application: ' + error.message, type: 'error' });
                      } else {
                        setApplications(apps => apps.filter(a => a.id !== app.id));
                        setToast({ show: true, message: 'Application deleted successfully!', type: 'success' });
                      }
                    }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {filteredApplications.length > paginatedHistory.length && (
        <div className="flex justify-center mt-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700" onClick={() => setHistoryPage(historyPage + 1)}>
            See More
          </button>
        </div>
      )}
    </div>
  );

  const renderUsers = () => {
    console.log('renderUsers - Current users state:', users);
    return (
    <div>
      <h2 className="text-2xl font-bold mb-2">User Management</h2>
      <p className="text-gray-600 mb-6">Manage admin and agent accounts</p>
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">System Users ({users.length})</h3>
          <button onClick={() => setShowAddUser(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"><User className="w-4 h-4 mr-2" /> Add User</button>
        </div>
        <table className="w-full text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="py-2">User</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">No users found</td>
              </tr>
            ) : (
              users.map((u, i) => (
              <tr key={i} className="border-t">
                <td className="py-3">{u.name}</td>
                <td className="py-3">{u.email}</td>
                <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'moderator' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                <td className="py-3 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800" onClick={() => {
                    setEditUserIdx(i);
                    setEditUser({
                      name: u.name,
                      email: u.email,
                      password: u.password || '',
                      role: u.role,
                      bankCodes: Array.isArray(u.bank_codes) && u.bank_codes.length > 0 ? u.bank_codes : (u.role === 'agent' ? [{ bank: '', code: '' }] : []),
                    });
                  }}><Edit className="w-4 h-4" /></button>
                  <button className="text-red-600 hover:text-red-800" onClick={async () => {
                    if (pendingDeleteIdx === i) {
                      try {
                        console.log('Deleting user:', u);
                        
                        console.log('Deleting user directly with Supabase:', u.email);
                        
                        // First find the user's auth ID from the profile
                        const { data: userProfile, error: profileError } = await supabase
                          .from('user_profiles')
                          .select('user_id')
                          .eq('email', u.email)
                          .single();
                          
                        if (profileError) {
                          console.error('Error finding user profile:', profileError);
                          setToast({ show: true, message: 'Failed to find user: ' + profileError.message, type: 'error' });
                          return;
                        }
                        
                        if (!userProfile?.user_id) {
                          console.error('User has no auth ID:', u);
                          
                          // Just delete the profile if there's no auth ID
                          const { error: deleteProfileError } = await supabase
                            .from('user_profiles')
                            .delete()
                            .eq('email', u.email);
                            
                          if (deleteProfileError) {
                            setToast({ show: true, message: 'Failed to delete user profile: ' + deleteProfileError.message, type: 'error' });
                            return;
                          }
                          
                          // Update local state
                          setUsers(prev => prev.filter((_, idx) => idx !== i));
                          setPendingDeleteIdx(null);
                          setToast({ show: true, message: 'User profile deleted successfully!', type: 'success' });
                          return;
                        }
                        
                        // Delete from auth (requires admin privileges - might fail)
                        try {
                          const { error: authError } = await supabase.auth.admin.deleteUser(
                            userProfile.user_id
                          );
                          
                          if (authError) {
                            console.error('Error deleting auth user:', authError);
                            // Continue to delete the profile even if auth deletion fails
                          }
                        } catch (authErr) {
                          console.error('Failed to delete auth user (might need admin rights):', authErr);
                          // Continue anyway
                        }
                        
                        // Delete the profile
                        const { error: deleteError } = await supabase
                          .from('user_profiles')
                          .delete()
                          .eq('email', u.email);
                          
                        if (deleteError) {
                          setToast({ show: true, message: 'Failed to delete user profile: ' + deleteError.message, type: 'error' });
                          return;
                        }
                        
                        // Update local state
                        setUsers(prev => prev.filter((_, idx) => idx !== i));
                        setPendingDeleteIdx(null);
                        setToast({ show: true, message: 'User deleted successfully!', type: 'success' });
                      } catch (err) {
                        let errorMsg = 'Unknown error';
                        if (err instanceof Error) {
                          errorMsg = err.message;
                        } else if (typeof err === 'string') {
                          errorMsg = err;
                        }
                        console.error('Error in delete user:', err);
                        setToast({ show: true, message: 'Failed to delete user: ' + errorMsg, type: 'error' });
                      }
                    } else {
                      setPendingDeleteIdx(i);
                      setToast({ show: true, message: 'Click again to confirm delete.', type: 'error' });
                      setTimeout(() => setPendingDeleteIdx(null), 3000);
                    }
                  }}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
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
              <img src="/company/new-logo.jpeg" alt="Logo" className="h-16 w-16 object-contain" />
            </div>
            <span className="text-2xl font-extrabold tracking-wide text-center mb-1" style={{letterSpacing: '0.08em'}}>CardConnectPH</span>
            <span className="text-sm text-gray-300 text-center">Moderator Portal</span>
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

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)}></div>
            <aside className="relative h-full w-64 bg-[#101624] text-white flex flex-col py-6 px-2 sm:px-6 shadow-xl z-50">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl" onClick={() => setSidebarOpen(false)}>&times;</button>
              <div className="flex flex-col items-center mb-10 px-2 mt-8">
                <div className="bg-white rounded-full flex items-center justify-center w-24 h-24 mb-4">
                  <img src="/company/new-logo.jpeg" alt="Logo" className="h-16 w-16 object-contain" />
                </div>
                <span className="text-2xl font-extrabold tracking-wide text-center mb-1" style={{letterSpacing: '0.08em'}}>CardConnectPH</span>
                <span className="text-sm text-gray-300 text-center">Moderator Portal</span>
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
            <button
              className="sm:hidden mr-2 text-gray-700 hover:text-blue-700 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-7 w-7" />
            </button>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xl font-bold text-gray-900">CardConnectPH</div>
              <div className="text-xs text-gray-500">Credit Card Management System</div>
            </div>
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
            {activeSection === 'applications' && renderApplications()}
            {activeSection === 'statusReport' && renderStatusReport()}
            {activeSection === 'history' && renderHistory()}
            {activeSection === 'users' && renderUsers()}
          </main>
        </div>
      </div>

      {/* View Application Modal */}
      {viewedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setViewedApp(null); setFetchedApp(null); setCurrentModalStep(1); }} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
            {loadingApp ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (fetchedApp || viewedApp) && (
              typeof (fetchedApp || viewedApp).id === 'number' ? (
                <div>
                  <h3 className="text-2xl font-bold mb-6">KYC Application Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(fetchedApp || viewedApp)
                      .filter(([key]) => !['created_at', 'updated_at'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="border-b pb-2">
                          <span className="font-medium text-gray-700">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>{' '}
                          <span className="text-gray-900">
                            {value === null || value === undefined 
                              ? 'N/A' 
                              : typeof value === 'object' 
                                ? JSON.stringify(value) 
                                : String(value)
                            }
                          </span>
                        </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Application Details</h3>
                  <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-medium">First Name:</span> {(fetchedApp || viewedApp).firstName}</div>
                    <div><span className="font-medium">Last Name:</span> {(fetchedApp || viewedApp).lastName}</div>
                    <div><span className="font-medium">Middle Name:</span> {(fetchedApp || viewedApp).middleName}</div>
                    <div><span className="font-medium">Suffix:</span> {(fetchedApp || viewedApp).suffix}</div>
                    <div><span className="font-medium">Gender:</span> {(fetchedApp || viewedApp).gender}</div>
                    <div><span className="font-medium">Date of Birth:</span> {(fetchedApp || viewedApp).dateOfBirth}</div>
                    <div><span className="font-medium">Place of Birth:</span> {(fetchedApp || viewedApp).placeOfBirth}</div>
                    <div><span className="font-medium">Civil Status:</span> {(fetchedApp || viewedApp).civilStatus}</div>
                    <div><span className="font-medium">Nationality:</span> {(fetchedApp || viewedApp).nationality}</div>
                    <div><span className="font-medium">Mobile Number:</span> {(fetchedApp || viewedApp).mobileNumber}</div>
                    <div><span className="font-medium">Home Number:</span> {(fetchedApp || viewedApp).homeNumber}</div>
                    <div><span className="font-medium">Email Address:</span> {(fetchedApp || viewedApp).emailAddress}</div>
                    <div><span className="font-medium">SSS/GSIS/UMID:</span> {(fetchedApp || viewedApp).sssGsisUmid}</div>
                    <div><span className="font-medium">TIN:</span> {(fetchedApp || viewedApp).tin}</div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {loadingEditApp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Loading application data...</p>
          </div>
        </div>
      )}
      {editApp && !loadingEditApp && (
        (() => {
          try {
            if (!editApp) return null;
            return (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
                  <button
                    onClick={() => { setEditApp(null); setCurrentEditStep(1); }}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl"
                  >&times;</button>
                  <h3 className="text-2xl font-bold mb-6">Edit Application</h3>
                  {renderEditStepIndicator()}
                  {renderEditStepContent(editApp, setEditApp)}
                  <div className="flex justify-between mt-8 pt-6 border-t gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentEditStep(s => Math.max(1, s - 1))}
                      disabled={currentEditStep === 1}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    {currentEditStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentEditStep(s => Math.min(4, s + 1))}
                        className="flex items-center px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-sm"
                      >
                        Next
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setEditApp(null); setCurrentEditStep(1); }}
                          className="flex items-center px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              // Convert bank preferences back to bank_applied format
                              const bankApplied = editApp.bank_preferences 
                                ? Object.keys(editApp.bank_preferences)
                                    .filter(key => editApp.bank_preferences[key])
                                    .join(', ')
                                : '';
                              
                              // Extract the ID without the "kyc-" prefix if present
                              const appId = editApp.id.startsWith ? 
                                (editApp.id.startsWith('kyc-') ? editApp.id.replace('kyc-', '') : editApp.id) : 
                                editApp.id;
                              
                              // Prepare update data based on the actual kyc_details table schema
                              const updateData = {
                                last_name: editApp.personal_details?.lastName || '',
                                first_name: editApp.personal_details?.firstName || '',
                                middle_name: editApp.personal_details?.middleName || '',
                                suffix: editApp.personal_details?.suffix || '',
                                date_of_birth: editApp.personal_details?.dateOfBirth || '',
                                place_of_birth: editApp.personal_details?.placeOfBirth || '',
                                gender: editApp.personal_details?.gender || '',
                                civil_status: editApp.personal_details?.civilStatus || '',
                                nationality: editApp.personal_details?.nationality || '',
                                mobile_number: editApp.personal_details?.mobileNumber || '',
                                email_address: editApp.personal_details?.emailAddress || '',
                                home_number: editApp.personal_details?.homeNumber || '',
                                "sss/gsis/umid": editApp.personal_details?.sssGsisUmid || '',
                                tin: editApp.personal_details?.tin || '',
                                // Map mother's details to relative_name
                                relative_name: editApp.mother_details ? 
                                  `${editApp.mother_details.lastName || ''}, ${editApp.mother_details.firstName || ''} ${editApp.mother_details.middleName || ''}`.trim() : '',
                                // Map permanent address
                                address: editApp.permanent_address?.street || '',
                                years_of_stay: editApp.permanent_address?.yearsOfStay || 0,
                                // Map spouse details to relative2_name
                                relative2_name: editApp.spouse_details ? 
                                  `${editApp.spouse_details.lastName || ''}, ${editApp.spouse_details.firstName || ''} ${editApp.spouse_details.middleName || ''}`.trim() : '',
                                // Map work details
                                business: editApp.work_details?.businessEmployerName || '',
                                profession: editApp.work_details?.professionOccupation || '',
                                nature_of_business: editApp.work_details?.natureOfBusiness || '',
                                department: editApp.work_details?.department || '',
                                contact_number: editApp.work_details?.landlineMobile || '',
                                years_in_business: editApp.work_details?.yearsInBusinessEmployment || 0,
                                monthly_income: editApp.work_details?.monthlyIncome || 0,
                                annual_income: editApp.work_details?.annualIncome || 0,
                                // Map personal reference to relative3_name
                                relative3_name: editApp.personal_reference ? 
                                  `${editApp.personal_reference.lastName || ''}, ${editApp.personal_reference.firstName || ''} ${editApp.personal_reference.middleName || ''}`.trim() : '',
                                // Credit card details
                                bank_institution: editApp.credit_card_details?.bankInstitution || '',
                                card_number: editApp.credit_card_details?.cardNumber || '',
                                credit_limit: editApp.credit_card_details?.creditLimit || 0,
                                member_since: editApp.credit_card_details?.memberSince || '',
                                expiry_date: editApp.credit_card_details?.expDate || '',
                                deliver_card_to: editApp.credit_card_details?.deliverCardTo || '',
                                best_time_to_contact: editApp.credit_card_details?.bestTimeToContact || '',
                                bank_applied: bankApplied,
                                updated_at: new Date().toISOString(),
                              };
                              
                              // Save changes to Supabase
                              const { error } = await supabase
                                .from('kyc_details')
                                .update(updateData)
                                .eq('id', appId);
                                
                              if (error) {
                                setToast({ show: true, message: 'Failed to update application: ' + error.message, type: 'error' });
                                return;
                              }
                              
                              // Update local state
                              setApplications(apps => apps.map(a => {
                                if (a.id === editApp.id || a.id === `kyc-${appId}`) {
                                  return { ...a, ...updateData };
                                }
                                return a;
                              }));
                              
                              setToast({ show: true, message: 'Application updated successfully!', type: 'success' });
                              setEditApp(null);
                              setCurrentEditStep(1);
                            } catch (err) {
                              setToast({ show: true, message: 'Failed to update application: ' + (err instanceof Error ? err.message : 'Unknown error'), type: 'error' });
                            }
                          }}
                          className="flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          } catch (err) {
            console.error('Error rendering editApp modal:', err);
            return (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh] flex flex-col items-center justify-center">
                  <div className="text-red-600 font-bold text-lg mb-4">Error rendering edit modal</div>
                  <div className="text-gray-700 text-sm mb-4">{err ? String(err) : ''}</div>
                  <button
                    onClick={() => { setEditApp(null); setCurrentEditStep(1); }}
                    className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          }
        })()
      )}

      {/* Export Preview Modal */}
      {showExportPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-bold mb-4">Export Preview</h2>
            <div className="overflow-x-auto max-h-96 mb-4">
              <table className="w-full text-xs border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Agent</th>
                    <th className="p-2 border">Applicant</th>
                    <th className="p-2 border">Date & Time</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Bank Codes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app, i) => {
                    let agentBankCodes = null;
                    let agentName = 'direct';
                    if (app.submitted_by && app.submitted_by !== 'direct') {
                      const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
                      if (agent && Array.isArray(agent.bank_codes) && agent.bank_codes.length > 0) {
                        agentBankCodes = agent.bank_codes;
                      }
                      agentName = agent?.name || app.submitted_by;
                    }
                    return (
                      <tr key={i}>
                        <td className="p-2 border">{agentName}</td>
                        <td className="p-2 border">{app.personal_details?.firstName ?? ''} {app.personal_details?.lastName ?? ''}</td>
                        <td className="p-2 border">{app.submitted_at ? new Date(app.submitted_at).toLocaleString() : ''}</td>
                        <td className="p-2 border">{app.status}</td>
                        <td className="p-2 border">
                          {agentBankCodes ? (
                            <ul className="space-y-1">
                              {agentBankCodes.map((entry: any, idx: any) => (
                                <li key={idx} className="text-xs bg-blue-50 rounded px-2 py-1 inline-block mr-1 mb-1">
                                  {BANKS.find(b => b.value === entry.bank)?.label || entry.bank}: <span className="font-mono">{entry.code}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={handleClosePreview}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleExportPDF}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
      {exportingPDF && !exportPreviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Loading export preview...</p>
          </div>
        </div>
      )}
      {exportPreviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 w-full max-w-full h-full max-h-full relative overflow-y-auto">
            <button
              onClick={() => setExportPreviewApp(null)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-red-600 text-xl sm:text-2xl z-10"
            >&times;</button>
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 pr-8">Application Export Preview</h2>
            <div id="single-app-pdf-preview" className="bg-white text-black p-2 sm:p-4 text-[10px] sm:text-[11px]" style={{ fontFamily: 'Arial, sans-serif', minWidth: 'unset', maxWidth: '100%', overflowX: 'auto' }}>
              {/* HEADER */}
              <div className="text-center font-bold text-lg sm:text-xl mb-2">APPLICATION FORM</div>
              {/* PERSONAL DETAILS & WORK/BUSINESS DETAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-black">
                {/* PERSONAL DETAILS */}
                <div className="border-b lg:border-b-0 lg:border-r border-black">
                  <div className="bg-black text-white font-bold text-xs px-2 py-1">PERSONAL DETAILS</div>
                  <table className="w-full text-[9px] sm:text-[11px] border-collapse">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">LAST NAME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.lastName}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">FIRST NAME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.firstName}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">MIDDLE NAME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.middleName}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">SUFFIX</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.suffix}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">DATE OF BIRTH</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.dateOfBirth}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">PLACE OF BIRTH</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.placeOfBirth}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">GENDER</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.gender}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">CIVIL STATUS</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.civilStatus}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">NATIONALITY</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.nationality}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">EMAIL ADDRESS</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.personal_details?.emailAddress}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">MOBILE NUMBER</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.mobileNumber}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">HOME NUMBER</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.homeNumber}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">SSS/GSIS/UMID</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.sssGsisUmid}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">TIN</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.personal_details?.tin}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </table>
                  {/* MOTHER'S MAIDEN NAME */}
                  <div className="bg-black text-white font-bold text-xs px-2 py-1 mt-2">MOTHER'S MAIDEN NAME</div>
                  <table className="w-full text-[9px] sm:text-[11px] border-collapse">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">LAST NAME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.mother_details?.lastName}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">FIRST NAME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.mother_details?.firstName}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">MIDDLE NAME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.mother_details?.middleName}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">SUFFIX</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.mother_details?.suffix}</td>
                      </tr>
                    </tbody>
                  </table>
                  {/* PRESENT HOME ADDRESS */}
                  <div className="bg-black text-white font-bold text-xs px-2 py-1 mt-2">PRESENT HOME ADDRESS</div>
                  <table className="w-full text-[9px] sm:text-[11px] border-collapse">
                    <tbody>
                      <tr className="border-b border-black">
                        <td colSpan={6} className="font-bold px-2 sm:px-3 py-1 sm:py-2">STREET/PUROK/SUBD.</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">YEARS OF STAY</td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.permanent_address?.street}</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2">{exportPreviewApp.permanent_address?.yearsOfStay}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* WORK/BUSINESS DETAILS */}
                <div>
                  <div className="bg-black text-white font-bold text-xs px-2 py-1">WORK/BUSINESS DETAILS</div>
                  <table className="w-full text-[9px] sm:text-[11px] border-collapse">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">EMPLOYER'S NAME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={7}>{exportPreviewApp.work_details?.employerName}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">POSITION</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.work_details?.position}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">MONTHLY INCOME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.work_details?.monthlyIncome}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">ANNUAL INCOME</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={7}>{exportPreviewApp.work_details?.annualIncome}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">WORK ADDRESS</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={7}>{exportPreviewApp.work_details?.workAddress}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">CONTACT NUMBER</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.work_details?.contactNumber}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">YEARS EMPLOYED</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.work_details?.yearsEmployed}</td>
                      </tr>
                    </tbody>
                  </table>
                  {/* CREDIT CARD DETAILS */}
                  <div className="bg-black text-white font-bold text-xs px-2 py-1 mt-2">CREDIT CARD DETAILS</div>
                  <table className="w-full text-[9px] sm:text-[11px] border-collapse">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">BANK/INSTITUTION</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.credit_card_details?.bankInstitution}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">MEMBER SINCE</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.credit_card_details?.memberSince}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">CARD NUMBER</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.credit_card_details?.cardNumber}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">CREDIT LIMIT</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.credit_card_details?.creditLimit}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">EXPIRY DATE</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.credit_card_details?.expirationDate}</td>
                        <td className="font-bold px-2 sm:px-3 py-1 sm:py-2">BEST TIME TO CONTACT</td>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={3}>{exportPreviewApp.credit_card_details?.bestTimeToContact}</td>
                      </tr>
                    </tbody>
                  </table>
                  {/* SPOUSE DETAILS */}
                  <div className="bg-black text-white font-bold text-xs px-2 py-1 mt-2">SPOUSE DETAILS</div>
                  <table className="w-full text-[9px] sm:text-[11px] border-collapse">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={8}>
                          {exportPreviewApp.spouse_details?.lastName} {exportPreviewApp.spouse_details?.firstName} {exportPreviewApp.spouse_details?.middleName} {exportPreviewApp.spouse_details?.suffix} {exportPreviewApp.spouse_details?.mobileNumber}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {/* PERSONAL REFERENCE */}
                  <div className="bg-black text-white font-bold text-xs px-2 py-1 mt-2">PERSONAL REFERENCE</div>
                  <table className="w-full text-[9px] sm:text-[11px] border-collapse">
                    <tbody>
                      <tr>
                        <td className="px-2 sm:px-3 py-1 sm:py-2" colSpan={8}>
                          {exportPreviewApp.personal_reference?.lastName} {exportPreviewApp.personal_reference?.firstName} {exportPreviewApp.personal_reference?.middleName} {exportPreviewApp.personal_reference?.suffix} {exportPreviewApp.personal_reference?.mobileNumber} {exportPreviewApp.personal_reference?.relationship}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              {/* BANK PREFERENCES */}
              <div className="border-b border-black">
                <div className="bg-black text-white font-bold text-xs px-2 py-1">BANK PREFERENCES</div>
                <table className="w-full text-[9px] sm:text-[11px] border-collapse">
                  <tbody>
                    <tr>
                      {BANKS.filter(b => exportPreviewApp.bank_preferences && exportPreviewApp.bank_preferences[b.value]).map(b => (
                        <td key={b.value} className="px-2 sm:px-3 py-1 sm:py-2 border-r border-black last:border-r-0">
                          <span className="inline-block w-3 text-center mr-1">✓</span>
                          {b.label}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* LOCATION, DATE, AGENT, REMARKS, PHOTOS */}
              <div className="flex flex-col lg:flex-row gap-4 mt-2 w-full">
                {/* Left: Location/Date/Agent, then Remarks below */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-xs">
                    <div><span className="font-bold">LOCATION:</span> {exportPreviewApp.location}</div>
                    <div><span className="font-bold">DATE:</span> {exportPreviewApp.submitted_at ? format(new Date(exportPreviewApp.submitted_at), 'MMM dd, yyyy') : ''}</div>
                    <div><span className="font-bold">AGENT:</span> {exportPreviewApp.agent}</div>
                  </div>
                  <div className="text-xs mt-4">
                    <span className="font-bold">REMARKS:</span> {exportPreviewApp.remarks}
                  </div>
                </div>
                {/* Right: Always show both image blocks, with placeholder if missing */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 items-center lg:items-end min-w-fit">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs mb-1">VALID ID</span>
                    {exportPreviewApp.id_photo_url ? (
                      <img src={exportPreviewApp.id_photo_url} alt="Valid ID" className="w-48 sm:w-64 h-32 sm:h-40 object-contain bg-white border" />
                    ) : (
                      <div className="w-48 sm:w-64 h-32 sm:h-40 flex items-center justify-center bg-gray-200 text-gray-500 border text-xs">No ID Uploaded</div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs mb-1">E-SIGNATURE</span>
                    {exportPreviewApp.e_signature_url ? (
                      <img src={exportPreviewApp.e_signature_url} alt="E-Signature" className="w-48 sm:w-64 h-20 sm:h-28 object-contain bg-white border" />
                    ) : (
                      <div className="w-48 sm:w-64 h-20 sm:h-28 flex items-center justify-center bg-gray-200 text-gray-500 border text-xs">No Signature Uploaded</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setExportPreviewApp(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleExportSinglePDF} disabled={exportingPDF}>
                {exportingPDF ? 'Exporting...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setShowAddUser(false)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
            <h3 className="text-xl font-bold mb-6">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    setNewUser({
                      ...newUser, 
                      role,
                      bankCodes: role === 'agent' ? [{ bank: '', code: '' }] : []
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="agent">Agent</option>
                  <option value="encoder">Encoder</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {newUser.role === 'agent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Codes</label>
                  {newUser.bankCodes.map((bc, idx) => (
                    <div key={idx} className="flex space-x-2 mb-2">
                      <select
                        value={bc.bank}
                        onChange={(e) => {
                          const newBankCodes = [...newUser.bankCodes];
                          newBankCodes[idx].bank = e.target.value;
                          setNewUser({...newUser, bankCodes: newBankCodes});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Bank</option>
                        {BANKS.map(bank => (
                          <option key={bank.value} value={bank.value}>{bank.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={bc.code}
                        onChange={(e) => {
                          const newBankCodes = [...newUser.bankCodes];
                          newBankCodes[idx].code = e.target.value;
                          setNewUser({...newUser, bankCodes: newBankCodes});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Code"
                      />
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newBankCodes = [...newUser.bankCodes];
                            newBankCodes.splice(idx, 1);
                            setNewUser({...newUser, bankCodes: newBankCodes});
                          }}
                          className="px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewUser({
                      ...newUser,
                      bankCodes: [...newUser.bankCodes, { bank: '', code: '' }]
                    })}
                    className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200"
                  >
                    + Add Bank Code
                  </button>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddUser}
                  disabled={isCreatingUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingUser ? 'Creating...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserIdx !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setEditUserIdx(null)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
            <h3 className="text-xl font-bold mb-6">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New Password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    setEditUser({
                      ...editUser, 
                      role,
                      bankCodes: role === 'agent' ? (editUser.bankCodes.length ? editUser.bankCodes : [{ bank: '', code: '' }]) : []
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="agent">Agent</option>
                  <option value="encoder">Encoder</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {editUser.role === 'agent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Codes</label>
                  {editUser.bankCodes.map((bc, idx) => (
                    <div key={idx} className="flex space-x-2 mb-2">
                      <select
                        value={bc.bank}
                        onChange={(e) => {
                          const newBankCodes = [...editUser.bankCodes];
                          newBankCodes[idx].bank = e.target.value;
                          setEditUser({...editUser, bankCodes: newBankCodes});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Bank</option>
                        {BANKS.map(bank => (
                          <option key={bank.value} value={bank.value}>{bank.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={bc.code}
                        onChange={(e) => {
                          const newBankCodes = [...editUser.bankCodes];
                          newBankCodes[idx].code = e.target.value;
                          setEditUser({...editUser, bankCodes: newBankCodes});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Code"
                      />
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newBankCodes = [...editUser.bankCodes];
                            newBankCodes.splice(idx, 1);
                            setEditUser({...editUser, bankCodes: newBankCodes});
                          }}
                          className="px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditUser({
                      ...editUser,
                      bankCodes: [...editUser.bankCodes, { bank: '', code: '' }]
                    })}
                    className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200"
                  >
                    + Add Bank Code
                  </button>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditUserIdx(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateUser(editUserIdx)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Application View Modal */}
      {viewBankApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {selectedBank === 'maybank' ? 'Maybank' : 'Bank'} Application Details
                </h2>
                <button 
                  onClick={() => setViewBankApp(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loadingBankApp ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading application details...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {viewBankApp.originalData ? (
                    // Show detailed information for bank applications from individual tables
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-blue-700">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><span className="font-medium">ID:</span> {viewBankApp.originalData.id || 'N/A'}</div>
                          <div><span className="font-medium">Client Name:</span> {viewBankApp.originalData.client_name || 'N/A'}</div>
                          <div><span className="font-medium">Bank Code:</span> {viewBankApp.originalData.bank_code || 'N/A'}</div>
                          <div><span className="font-medium">Agent Name:</span> {viewBankApp.originalData.agent_name || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> 
                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                              viewBankApp.status === 'approved' ? 'bg-green-100 text-green-800' :
                              viewBankApp.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              viewBankApp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              viewBankApp.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                              viewBankApp.status === 'incomplete' ? 'bg-orange-100 text-orange-800' :
                              viewBankApp.status === 'in_process' ? 'bg-blue-100 text-blue-800' :
                              viewBankApp.status === 'existing' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {viewBankApp.status || 'pending'}
                            </span>
                          </div>
                          <div><span className="font-medium">Created At:</span> {viewBankApp.originalData.created_at ? format(new Date(viewBankApp.originalData.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</div>
                        </div>
                      </div>

                      {/* Status Details */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-blue-700">Status Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {viewBankApp.bankName === 'aub' && (
                            <>
                              <div><span className="font-medium">Approved:</span> <span className={viewBankApp.originalData.approved ? 'text-green-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.approved ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Declined:</span> <span className={viewBankApp.originalData.declined ? 'text-red-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.declined ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Incomplete:</span> <span className={viewBankApp.originalData.incomplete ? 'text-orange-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.incomplete ? 'Yes' : 'No'}</span></div>
                            </>
                          )}
                          {viewBankApp.bankName === 'bpi' && (
                            <>
                              <div><span className="font-medium">Approved:</span> <span className={viewBankApp.originalData.approved ? 'text-green-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.approved ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Existing BPI:</span> <span className={viewBankApp.originalData.existing_bpi ? 'text-blue-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.existing_bpi ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Existing RBank:</span> <span className={viewBankApp.originalData.existing_rbank ? 'text-blue-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.existing_rbank ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">In Process:</span> <span className={viewBankApp.originalData.in_process ? 'text-yellow-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.in_process ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Cancelled:</span> <span className={viewBankApp.originalData.cancelled ? 'text-gray-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.cancelled ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Denied:</span> <span className={viewBankApp.originalData.denied ? 'text-red-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.denied ? 'Yes' : 'No'}</span></div>
                            </>
                          )}
                          {viewBankApp.bankName === 'eastwest' && (
                            <>
                              <div><span className="font-medium">Approved:</span> <span className={viewBankApp.originalData.approved ? 'text-green-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.approved ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Cancelled:</span> <span className={viewBankApp.originalData.cancelled ? 'text-gray-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.cancelled ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Declined:</span> <span className={viewBankApp.originalData.declined ? 'text-red-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.declined ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Pending:</span> <span className={viewBankApp.originalData.pending ? 'text-yellow-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.pending ? 'Yes' : 'No'}</span></div>
                            </>
                          )}
                          {viewBankApp.bankName === 'maybank' && (
                            <>
                              <div><span className="font-medium">Approved:</span> <span className={viewBankApp.originalData.approved ? 'text-green-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.approved ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">In Process:</span> <span className={viewBankApp.originalData.in_process ? 'text-yellow-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.in_process ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Declined:</span> <span className={viewBankApp.originalData.declined ? 'text-red-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.declined ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Cancelled:</span> <span className={viewBankApp.originalData.cancelled ? 'text-gray-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.cancelled ? 'Yes' : 'No'}</span></div>
                            </>
                          )}
                          {viewBankApp.bankName === 'metrobank' && (
                            <>
                              <div><span className="font-medium">Approved:</span> <span className={viewBankApp.originalData.approved ? 'text-green-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.approved ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Declined:</span> <span className={viewBankApp.originalData.declined ? 'text-red-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.declined ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Incomplete:</span> <span className={viewBankApp.originalData.incomplete ? 'text-orange-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.incomplete ? 'Yes' : 'No'}</span></div>
                            </>
                          )}
                          {viewBankApp.bankName === 'pnb' && (
                            <>
                              <div><span className="font-medium">Approved:</span> <span className={viewBankApp.originalData.approved ? 'text-green-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.approved ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Product:</span> {viewBankApp.originalData.product || 'N/A'}</div>
                            </>
                          )}
                          {viewBankApp.bankName === 'robinsons' && (
                            <>
                              <div><span className="font-medium">Approved:</span> <span className={viewBankApp.originalData.approved ? 'text-green-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.approved ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Existing BPI:</span> <span className={viewBankApp.originalData.existing_bpi ? 'text-blue-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.existing_bpi ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Existing RBank:</span> <span className={viewBankApp.originalData.existing_rbank ? 'text-blue-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.existing_rbank ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">In Process:</span> <span className={viewBankApp.originalData.in_process ? 'text-yellow-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.in_process ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Cancelled:</span> <span className={viewBankApp.originalData.cancelled ? 'text-gray-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.cancelled ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Denied:</span> <span className={viewBankApp.originalData.denied ? 'text-red-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.denied ? 'Yes' : 'No'}</span></div>
                            </>
                          )}
                          {viewBankApp.bankName === 'rcbc' && (
                            <>
                              <div><span className="font-medium">Approved:</span> <span className={viewBankApp.originalData.approved ? 'text-green-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.approved ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Incomplete:</span> <span className={viewBankApp.originalData.incomplete ? 'text-orange-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.incomplete ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">In Process:</span> <span className={viewBankApp.originalData.in_process ? 'text-yellow-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.in_process ? 'Yes' : 'No'}</span></div>
                              <div><span className="font-medium">Rejected:</span> <span className={viewBankApp.originalData.rejected ? 'text-red-600 font-semibold' : 'text-gray-500'}>{viewBankApp.originalData.rejected ? 'Yes' : 'No'}</span></div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Additional Information */}
                      {(viewBankApp.originalData.reasons || viewBankApp.originalData.product) && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3 text-blue-700">Additional Information</h3>
                          <div className="space-y-2">
                            {viewBankApp.originalData.reasons && (
                              <div>
                                <span className="font-medium">Reasons:</span>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-1">
                                  <p className="text-blue-800">{viewBankApp.originalData.reasons}</p>
                                </div>
                              </div>
                            )}
                            {viewBankApp.originalData.product && (
                              <div><span className="font-medium">Product:</span> {viewBankApp.originalData.product}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show basic information for Maybank applications (fallback)
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-3 text-blue-700">Basic Information</h3>
                          <div className="space-y-2">
                            <div><span className="font-medium">Application No:</span> {viewBankApp.applicationNo || 'N/A'}</div>
                            <div><span className="font-medium">Name:</span> {viewBankApp.personal_details?.firstName} {viewBankApp.personal_details?.lastName}</div>
                            <div><span className="font-medium">Status:</span> 
                              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                (viewBankApp.status || '').toLowerCase().includes('approved') || (viewBankApp.status || '').toLowerCase().includes('cif') ? 'bg-green-100 text-green-800' :
                                (viewBankApp.status || '').toLowerCase().includes('pending') ? 'bg-yellow-100 text-yellow-800' :
                                (viewBankApp.status || '').toLowerCase().includes('rejected') ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {viewBankApp.status || '-'}
                              </span>
                            </div>
                            <div><span className="font-medium">Card Type:</span> {viewBankApp.cardType || 'N/A'}</div>
                            <div><span className="font-medium">Agent:</span> {viewBankApp.agent || 'N/A'}</div>
                            <div><span className="font-medium">Submitted:</span> {viewBankApp.submitted_at ? format(new Date(viewBankApp.submitted_at), 'MMM dd, yyyy') : 'N/A'}</div>
                          </div>
                        </div>
                        
                        {/* Additional Details */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3 text-blue-700">Additional Details</h3>
                          <div className="space-y-2">
                            <div><span className="font-medium">Application Type:</span> {viewBankApp.applnType || 'N/A'}</div>
                            <div><span className="font-medium">Source Code:</span> {viewBankApp.sourceCd || 'N/A'}</div>
                            <div><span className="font-medium">Agency Branch:</span> {viewBankApp.agencyBrName || 'N/A'}</div>
                            <div><span className="font-medium">Month:</span> {viewBankApp.month || 'N/A'}</div>
                            <div><span className="font-medium">O Codes:</span> {viewBankApp.oCodes || 'N/A'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Decline Reason if applicable */}
                      {viewBankApp.declineReason && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3 text-red-700">Decline Reason</h3>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="text-red-800">{viewBankApp.declineReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Remarks */}
                      {viewBankApp.remarks && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3 text-blue-700">Remarks</h3>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-blue-800">{viewBankApp.remarks}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t">
              <button 
                onClick={() => setViewBankApp(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Status Modal */}
      <BankStatusModal
        isOpen={bankStatusModalOpen}
        onClose={handleCloseBankStatusModal}
        application={selectedApplicationForStatus}
        onUpdateStatus={handleUpdateBankStatus}
        banks={BANKS}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false, message: '', type: undefined })}
        />
      )}
    </>
  );
};

export default ModeratorDashboard; 