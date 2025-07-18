import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart3, Settings, Plus, Check, X, Eye, Edit, LogOut, User, Clock, CheckCircle, List, History, Trash2, Download, Menu, Send, ArrowDownCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useApplications } from '../context/ApplicationContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import Toast from './Toast';
import Logo from '../assets/Company/Logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

// Add this to the top, after imports
const BANKS = [
  { value: 'rcbc', label: 'RCBC' },
  { value: 'metrobank', label: 'Metrobank' },
  { value: 'eastWestBank', label: 'EastWest Bank' },
  { value: 'securityBank', label: 'Security Bank' },
  { value: 'bpi', label: 'BPI' },
  { value: 'pnb', label: 'PNB' },
  { value: 'robinsonBank', label: 'Robinson Bank' },
  { value: 'maybank', label: 'Maybank' },
  { value: 'aub', label: 'AUB' },
];

// Add this at the top after imports
const initialToastState = { show: false, message: '', type: undefined as 'success' | 'error' | undefined };

const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'agent', bankCodes: [{ bank: '', code: '' }] });
  const [users, setUsers] = useState<any[]>([]); // fetched from Supabase
  const [applications, setApplications] = useState<any[]>([]); // merged applications
  const [viewedApp, setViewedApp] = useState<any | null>(null);
  const [editUserIdx, setEditUserIdx] = useState<number | null>(null);
  const [editUser, setEditUser] = useState({ name: '', email: '', password: '', role: 'agent', bankCodes: [{ bank: '', code: '' }] });
  const [toast, setToast] = useState<typeof initialToastState>(initialToastState);
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);
  const [editApp, setEditApp] = useState<any | null>(null);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [currentEditStep, setCurrentEditStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewApp, setPreviewApp] = useState<any | null>(null);
  const [pdfPreviewApp, setPdfPreviewApp] = useState<any | null>(null);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const sectionTitles = [
    'Personal Details',
    'Family & Address',
    'Work/Business Details',
    'Credit Card & Bank Preferences',
    'File Links & Review',
  ];
  const [currentSection, setCurrentSection] = useState(0);
  const [bankFilter, setBankFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Add state for pagination
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 15;

  // Sidebar navigation
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <List className="w-5 h-5 mr-2" /> },
    { key: 'account', label: 'Account Management', icon: <User className="w-5 h-5 mr-2" /> },
    { key: 'applications', label: 'Client Applications', icon: <FileText className="w-5 h-5 mr-2" /> },
    { key: 'history', label: 'Application History', icon: <History className="w-5 h-5 mr-2" /> },
  ];

  // Fetch users and applications from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      const [{ data: appData, error: appError }, { data: kycData, error: kycError }] = await Promise.all([
        supabase.from('application_form').select('*'),
        supabase.from('kyc_details').select('*'),
      ]);
      const normalizedKyc = (kycData || []).map((k: any) => ({
        id: `kyc-${k.id}`,
        personal_details: {
          firstName: k.first_name,
          lastName: k.last_name,
          middleName: k.middle_name,
          suffix: k.suffix,
          dateOfBirth: k.date_of_birth,
          placeOfBirth: k.place_of_birth,
          gender: k.gender,
          emailAddress: k.email_address,
        },
        status: null,
        submitted_by: k.agent || '',
        submitted_at: null,
      }));
      const merged = [ ...(appData || []), ...normalizedKyc ];
      if (isMounted) setApplications(merged);

      // Fetch all users from Supabase
      const { data: userData, error: userError } = await supabase.from('users').select('*');
      if (userError) {
        console.error('Failed to fetch users:', userError.message);
      } else if (isMounted) {
        setUsers(userData || []);
      }
    };
    fetchAllData();
    const channel = supabase
      .channel('realtime:application_form')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'application_form' },
        (payload) => { fetchAllData(); }
      )
      .subscribe();
    return () => { isMounted = false; supabase.removeChannel(channel); };
  }, []);

  // Update dashboard stats
  const totalApplications = applications.length;
  const pendingReviews = applications.filter(a => a.status === 'pending').length;
  const approved = applications.filter(a => a.status === 'approved').length;
  const totalUsers = users.length;

  // Stepper for modal
  const modalSteps = [
    { title: 'Personal Details', number: 1 },
    { title: 'Address & Family', number: 2 },
    { title: 'Work Details', number: 3 },
    { title: 'Credit & Preferences', number: 4 },
  ];

  // Export single application as PDF
  const exportSinglePDF = (app: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Application Details', 14, 18);
    doc.setFontSize(12);
    doc.text(`Application ID: #${app.id}`, 14, 30);
    doc.text(`Name: ${app.name}`, 14, 38);
    doc.text(`Email: ${app.email}`, 14, 46);
    doc.text(`Date: ${app.date} ${app.time}`, 14, 54);
    doc.text(`Status: ${app.status}`, 14, 62);
    doc.text(`Submitted By: ${app.submittedBy}`, 14, 70);
    doc.text('---', 14, 78);
    doc.text('Personal Details:', 14, 86);
    const pd = app.personalDetails;
    doc.text(`Last Name: ${pd.lastName}`, 14, 94);
    doc.text(`First Name: ${pd.firstName}`, 14, 102);
    doc.text(`Middle Name: ${pd.middleName}`, 14, 110);
    doc.text(`Date of Birth: ${pd.dateOfBirth}`, 14, 118);
    doc.text(`Place of Birth: ${pd.placeOfBirth}`, 14, 126);
    doc.text(`Gender: ${pd.gender}`, 14, 134);
    doc.text(`Civil Status: ${pd.civilStatus}`, 14, 142);
    doc.text(`Nationality: ${pd.nationality}`, 14, 150);
    doc.text(`Mobile Number: ${pd.mobileNumber}`, 14, 158);
    doc.text(`Home Number: ${pd.homeNumber}`, 14, 166);
    doc.text(`Email Address: ${pd.emailAddress}`, 14, 174);
    doc.save(`Application_${app.id}.pdf`);
  };

  // Export preview as PDF using html2canvas and jsPDF
  const handleExportPreviewPDF = async () => {
    if (!previewApp) return;
    const previewElement = document.getElementById('pdf-preview');
    if (!previewElement) return;
    const pdfWidth = 1200;
    const pdfHeight = 793;
    const canvas = await html2canvas(previewElement, {
      scale: 2,
      width: pdfWidth,
      height: pdfHeight,
      backgroundColor: '#fff',
      useCORS: true
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [pdfWidth, pdfHeight] });
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Application_${previewApp.id}.pdf`);
  };

  // Section renderers
  const renderDashboard = () => (
            <div>
      <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
      <p className="text-gray-600 mb-6">Welcome back! Here's what's happening today.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><FileText className="w-6 h-6 text-blue-500 mr-2" /> <span className="font-semibold">Total Applications</span></div>
          <div className="text-2xl font-bold">{totalApplications}</div>
          <div className="text-green-600 text-xs mt-1">↑+12% from last month</div>
            </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><Clock className="w-6 h-6 text-yellow-500 mr-2" /> <span className="font-semibold">Pending Reviews</span></div>
          <div className="text-2xl font-bold">{pendingReviews}</div>
          <div className="text-green-600 text-xs mt-1">↑+3 from last month</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><CheckCircle className="w-6 h-6 text-green-500 mr-2" /> <span className="font-semibold">Approved</span></div>
          <div className="text-2xl font-bold">{approved}</div>
          <div className="text-green-600 text-xs mt-1">↑+8% from last month</div>
            </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
          <div className="flex items-center mb-2"><User className="w-6 h-6 text-purple-500 mr-2" /> <span className="font-semibold">Total Users</span></div>
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
                      <span className="ml-2 text-xs text-gray-500">{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : ''}</span>
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
        {/* Restore Quick Actions card */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'dashboard' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-blue-700 border-transparent hover:bg-blue-100'}`} onClick={() => setActiveSection('dashboard')}><List className="w-5 h-5 mr-2" /> Dashboard</button>
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'applications' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-blue-700 border-transparent hover:bg-blue-100'}`} onClick={() => setActiveSection('applications')}><FileText className="w-5 h-5 mr-2" /> Client Applications</button>
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'account' ? 'bg-green-50 text-green-700 border-green-400' : 'bg-white text-green-700 border-transparent hover:bg-green-100'}`} onClick={() => setActiveSection('account')}><User className="w-5 h-5 mr-2" /> Account Management</button>
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'history' ? 'bg-purple-50 text-purple-700 border-purple-400' : 'bg-white text-purple-700 border-transparent hover:bg-purple-100'}`} onClick={() => setActiveSection('history')}><History className="w-5 h-5 mr-2" /> Application History</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Account Management</h2>
      <p className="text-gray-600 mb-6">Manage admin and agent accounts</p>
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">System Users</h3>
          <button onClick={() => setShowAddUser(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"><Plus className="w-4 h-4 mr-2" /> Add User</button>
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
            {users.map((u, i) => (
              <tr key={i} className="border-t">
                <td className="py-3">{u.name}</td>
                <td className="py-3">{u.email}</td>
                <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
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
                      // Delete user from Supabase
                      const { error } = await supabase.from('users').delete().eq('email', u.email);
                      if (error) {
                        setToast({ show: true, message: 'Failed to delete user: ' + error.message, type: 'error' as const });
                        return;
                      }
                      setUsers(prev => prev.filter((_, idx) => idx !== i));
                      setPendingDeleteIdx(null);
                      setToast({ show: false, message: '', type: undefined });
                    } else {
                      setPendingDeleteIdx(i);
                      setToast({ show: true, message: 'Click again to confirm delete.', type: 'error' as const });
                      setTimeout(() => setPendingDeleteIdx(null), 3000);
                    }
                  }}><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        {showAddUser && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button onClick={() => setShowAddUser(false)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
              <h3 className="text-xl font-bold mb-4">Add New User</h3>
              <form onSubmit={async e => {
                e.preventDefault();
                // Call backend API to create user in Supabase Auth and users table
                try {
                  const response = await fetch('/api/create-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newUser.name,
                      email: newUser.email,
                      password: newUser.password,
                      role: newUser.role,
                      bank_codes: newUser.bankCodes,
                    }),
                  });
                  const result = await response.json();
                  if (!response.ok) {
                    setToast({ show: true, message: 'Failed to add user: ' + (result.error || response.statusText), type: 'error' as const });
                    return;
                  }
                setShowAddUser(false);
                setNewUser({ name: '', email: '', password: '', role: 'agent', bankCodes: [{ bank: '', code: '' }] });
                  setToast({ show: true, message: 'User created successfully!', type: 'success' as const });
                } catch (err) {
                  let errorMsg = 'Unknown error';
                  if (err instanceof Error) {
                    errorMsg = err.message;
                  } else if (typeof err === 'string') {
                    errorMsg = err;
                  }
                  setToast({ show: true, message: 'Failed to add user: ' + errorMsg, type: 'error' as const });
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full border rounded-lg px-3 py-2" required>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Codes</label>
                  {(newUser.bankCodes ? newUser.bankCodes : [{ bank: '', code: '' }]).map((entry, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <select
                        value={entry.bank}
                        onChange={e => {
                          const bank = e.target.value;
                          setNewUser(u => ({
                            ...u,
                            bankCodes: u.bankCodes.map((b, i) => i === idx ? { ...b, bank } : b)
                          }));
                        }}
                        className="border rounded-lg px-2 py-1 flex-1"
                        required
                      >
                        <option value="">Select Bank</option>
                        {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Code"
                        value={entry.code}
                        onChange={e => {
                          const code = e.target.value;
                          setNewUser(u => ({
                            ...u,
                            bankCodes: u.bankCodes.map((b, i) => i === idx ? { ...b, code } : b)
                          }));
                        }}
                        className="border rounded-lg px-2 py-1 flex-1"
                        required
                      />
                      <button type="button" onClick={() => setNewUser(u => ({ ...u, bankCodes: u.bankCodes.filter((_, i) => i !== idx) }))} className="text-red-500 px-2">&times;</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewUser(u => ({ ...u, bankCodes: [...u.bankCodes, { bank: '', code: '' }] }))} className="text-blue-600 text-xs underline">+ Add Another</button>
                </div>
                <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800">Create Account</button>
              </form>
              <div className="text-xs text-gray-500 mt-2">User creation is handled securely via a backend API.</div>
            </div>
          </div>
        )}
        {editUserIdx !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button onClick={() => setEditUserIdx(null)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
              <h3 className="text-xl font-bold mb-4">Edit User</h3>
              <form onSubmit={async e => {
                e.preventDefault();
                // Update user in Supabase (excluding password)
                const { error } = await supabase.from('users').update({
                  name: editUser.name,
                  role: editUser.role,
                  bank_codes: editUser.bankCodes,
                }).eq('email', editUser.email);
                if (error) {
                  setToast({ show: true, message: 'Failed to update user: ' + error.message, type: 'error' as const });
                  return;
                }
                setUsers(prev => prev.map((u, idx) => idx === editUserIdx ? { ...u, ...editUser } : u));
                setEditUserIdx(null);
                setToast({ show: true, message: 'User updated successfully!', type: 'success' as const });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} className="w-full border rounded-lg px-3 py-2" required disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })} className="w-full border rounded-lg px-3 py-2" required>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Codes</label>
                  {(editUser.bankCodes ? editUser.bankCodes : [{ bank: '', code: '' }]).map((entry, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <select
                        value={entry.bank}
                        onChange={e => {
                          const bank = e.target.value;
                          setEditUser(u => ({
                            ...u,
                            bankCodes: u.bankCodes.map((b, i) => i === idx ? { ...b, bank } : b)
                          }));
                        }}
                        className="border rounded-lg px-2 py-1 flex-1"
                        required
                      >
                        <option value="">Select Bank</option>
                        {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Code"
                        value={entry.code}
                        onChange={e => {
                          const code = e.target.value;
                          setEditUser(u => ({
                            ...u,
                            bankCodes: u.bankCodes.map((b, i) => i === idx ? { ...b, code } : b)
                          }));
                        }}
                        className="border rounded-lg px-2 py-1 flex-1"
                        required
                      />
                      <button type="button" onClick={() => setEditUser(u => ({ ...u, bankCodes: u.bankCodes.filter((_, i) => i !== idx) }))} className="text-red-500 px-2">&times;</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditUser(u => ({ ...u, bankCodes: [...u.bankCodes, { bank: '', code: '' }] }))} className="text-blue-600 text-xs underline">+ Add Another</button>
                </div>
                <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800">Save Changes</button>
              </form>
            </div>
        </div>
        )}
      </div>
    </div>
  );

  const renderApplications = () => (
    <div>
      <h2 className="text-2xl font-bold mb-2">Client Applications</h2>
      <p className="text-gray-600 mb-6">Review and manage credit card applications</p>
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
                <th className="py-2 align-middle w-1/8">Status</th>
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
                    <td className="py-3 px-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span></td>
                    <td className="py-3 px-2 align-middle whitespace-nowrap max-w-[80px] truncate">{!app.submitted_by || app.submitted_by === 'direct' ? 'direct' : app.submitted_by}</td>
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
                    <td className="py-3 px-4 align-middle flex space-x-2">
                      <div className="relative group">
                        <button className="text-blue-600 hover:text-blue-800 transition-colors" onClick={async () => {
                          await supabase.from('application_form').update({ status: 'submitted' }).eq('id', app.id);
                          setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'submitted' } : a));
                        }}>
                          <Send className="w-5 h-5" />
                        </button>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Submit</span>
                      </div>
                      <div className="relative group">
                        <button className="text-purple-600 hover:text-purple-800 transition-colors" onClick={async () => {
                          await supabase.from('application_form').update({ status: 'turn-in' }).eq('id', app.id);
                          setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'turn-in' } : a));
                        }}>
                          <ArrowDownCircle className="w-5 h-5" />
                        </button>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Turn-in</span>
                      </div>
                      <div className="relative group">
                        <button className="text-green-600 hover:text-green-800 transition-colors" onClick={async () => {
                          await supabase.from('application_form').update({ status: 'approved' }).eq('id', app.id);
                          setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'approved' } : a));
                        }}>
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Approve</span>
                      </div>
                      <div className="relative group">
                        <button className="text-red-600 hover:text-red-800 transition-colors" onClick={async () => {
                          await supabase.from('application_form').update({ status: 'rejected' }).eq('id', app.id);
                          setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'rejected' } : a));
                        }}>
                          <ThumbsDown className="w-5 h-5" />
                        </button>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Reject</span>
                      </div>
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
                  <div className="mb-1 text-sm"><span className="font-medium">Status:</span> <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>{app.status ?? ''}</span></div>
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
                  <div className="flex space-x-4 mt-2">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors" onClick={() => setViewedApp(app)}><Eye className="w-5 h-5" /></button>
                    <button className="text-green-600 hover:text-green-800 transition-colors" onClick={() => setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'approved' } : a))}><Check className="w-5 h-5" /></button>
                    <button className="text-red-600 hover:text-red-800 transition-colors" onClick={() => setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'rejected' } : a))}><X className="w-5 h-5" /></button>
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
          <div className="text-2xl font-bold">{applications.length}</div>
          <div className="text-gray-500 text-sm mt-1">Total Applications</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
          <div className="text-2xl font-bold">{applications.filter(a => a.status === 'approved').length}</div>
          <div className="text-gray-500 text-sm mt-1">Approved</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
          <div className="text-2xl font-bold">{applications.filter(a => a.status === 'pending').length}</div>
          <div className="text-gray-500 text-sm mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
          <div className="text-2xl font-bold">{applications.filter(a => a.status === 'rejected').length}</div>
          <div className="text-gray-500 text-sm mt-1">Rejected</div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow mb-6 w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row gap-4 w-full mb-4 items-start sm:items-end">
          <input
            className="border rounded-lg px-3 py-2 w-full sm:w-1/2 mb-2 sm:mb-0"
            placeholder="Search by agent name or bank code..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 text-sm whitespace-nowrap ml-0 sm:ml-2"
            onClick={handleExportPreview}
            type="button"
          >
            Export as PDF
          </button>
        </div>
        <div className="flex gap-4 w-full mt-2">
          <input className="border rounded-lg px-3 py-2 w-1/2" placeholder="mm/dd/yyyy" />
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
            <th className="py-2">Bank Codes</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedHistory.map((app, i) => {
            // Find agent user if not direct
            let agentBankCodes = null;
            if (app.submitted_by && app.submitted_by !== 'direct') {
              const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
              if (agent && Array.isArray(agent.bank_codes) && agent.bank_codes.length > 0) {
                agentBankCodes = agent.bank_codes;
              }
            }
            return (
              <tr key={i} className="border-t">
                <td className="py-3">{app.personal_details?.firstName ?? ''} {app.personal_details?.lastName ?? ''}</td>
                <td className="py-3 px-6 min-w-[170px] whitespace-nowrap text-sm">{app.submitted_at ? new Date(app.submitted_at).toLocaleString() : ''}</td>
                <td className="py-3 px-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span></td>
                <td className="py-3">{app.submitted_by || 'direct'}</td>
                <td className="py-3">
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
                  <button className="text-blue-600 hover:text-blue-800" onClick={() => setViewedApp(app)}><Eye className="w-4 h-4" /></button>
                  <button className="text-green-600 hover:text-green-800" onClick={() => setEditApp(app)}><Edit className="w-4 h-4" /></button>
                  <button className="text-purple-600 hover:text-purple-800" title="Export PDF" onClick={() => setPdfPreviewApp(app)}><Download className="w-4 h-4" /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Mobile Card Layout */}
      <div className="block sm:hidden">
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
              <div className="text-sm mb-1">Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span></div>
              <div className="text-sm mb-1">Submitted By: {app.submitted_by || 'direct'}</div>
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
                <button className="text-blue-600 hover:text-blue-800" onClick={() => setViewedApp(app)}><Eye className="w-4 h-4" /></button>
                <button className="text-green-600 hover:text-green-800" onClick={() => setEditApp(app)}><Edit className="w-4 h-4" /></button>
                <button className="text-purple-600 hover:text-purple-800" title="Export PDF" onClick={() => setPdfPreviewApp(app)}><Download className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
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

  const renderModalStepIndicator = () => (
    <div className="mb-8">
      <div className="flex w-full justify-between items-center gap-2 md:gap-4 px-1 overflow-x-auto whitespace-nowrap">
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
          </div>
        );
      default:
        return null;
    }
  };

  const renderEditStepIndicator = () => (
    <div className="mb-8">
      <div className="flex w-full justify-between items-end gap-2 md:gap-4 flex-wrap px-1 overflow-x-hidden">
        {modalSteps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                  currentEditStep >= step.number
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              <span className={`mt-1 text-xs md:text-base font-medium whitespace-nowrap truncate ${
                currentEditStep >= step.number ? 'text-green-700' : 'text-gray-500'
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
                <div><label className="font-medium">Bank/Institution:</label> <input className="border rounded px-2 py-1 w-full" value={editApp.credit_card_details?.bankInstitution ?? ''} onChange={e => setEditApp({ ...editApp, credit_card_details: { ...editApp.credit_card_details, bankInstitution: e.target.value } })} /></div>
                <div><label className="font-medium">Card Number:</label> <input className="border rounded px-2 py-1 w-full" value={editApp.credit_card_details?.cardNumber ?? ''} onChange={e => setEditApp({ ...editApp, credit_card_details: { ...editApp.credit_card_details, cardNumber: e.target.value } })} /></div>
                <div><label className="font-medium">Credit Limit:</label> <input className="border rounded px-2 py-1 w-full" value={editApp.credit_card_details?.creditLimit ?? ''} onChange={e => setEditApp({ ...editApp, credit_card_details: { ...editApp.credit_card_details, creditLimit: e.target.value } })} /></div>
                <div><label className="font-medium">Member Since:</label> <input className="border rounded px-2 py-1 w-full" value={editApp.credit_card_details?.memberSince ?? ''} onChange={e => setEditApp({ ...editApp, credit_card_details: { ...editApp.credit_card_details, memberSince: e.target.value } })} /></div>
                <div><label className="font-medium">Exp. Date:</label> <input className="border rounded px-2 py-1 w-full" value={editApp.credit_card_details?.expirationDate ?? ''} onChange={e => setEditApp({ ...editApp, credit_card_details: { ...editApp.credit_card_details, expirationDate: e.target.value } })} /></div>
                <div><label className="font-medium">Deliver Card To:</label><select className="border rounded px-2 py-1 w-full" value={editApp.credit_card_details?.deliverCardTo ?? ''} onChange={e => setEditApp({ ...editApp, credit_card_details: { ...editApp.credit_card_details, deliverCardTo: e.target.value as 'home' | 'business' } })}>
                  <option value="home">Present Home Address</option>
                  <option value="business">Business Address</option>
                </select></div>
                <div><label className="font-medium">Best Time to Contact:</label> <input className="border rounded px-2 py-1 w-full" value={editApp.credit_card_details?.bestTimeToContact ?? ''} onChange={e => setEditApp({ ...editApp, credit_card_details: { ...editApp.credit_card_details, bestTimeToContact: e.target.value } })} /></div>
              </div>
            </div>
            {/* Bank Preferences */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Bank Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {app.bank_preferences && Object.entries(app.bank_preferences).map(([k, v]) => (
                  <span key={k} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Handler for Excel/CSV import (flexible header mapping)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { header: 0 }); // [{header: value, ...}]

      // Mapping table: normalized header -> field name
      const fieldMap: Record<string, string> = {
        'lastname': 'lastName',
        'firstname': 'firstName',
        'middlename': 'middleName',
        'suffix': 'suffix',
        'dateofbirth': 'dateOfBirth',
        'placeofbirth': 'placeOfBirth',
        'gender': 'gender',
        'civilstatus': 'civilStatus',
        'nationality': 'nationality',
        'mobilenumber': 'mobileNumber',
        'homenumber': 'homeNumber',
        'emailaddress': 'emailAddress',
        'sssgsisumid': 'sssGsisUmid',
        'tin': 'tin',
        'motherlastname': 'motherLastName',
        'motherfirstname': 'motherFirstName',
        'mothermiddlename': 'motherMiddleName',
        'mothersuffix': 'motherSuffix',
        'street': 'street',
        'barangay': 'barangay',
        'city': 'city',
        'zipcode': 'zipCode',
        'yearsofstay': 'yearsOfStay',
        'spouselastname': 'spouseLastName',
        'spousefirstname': 'spouseFirstName',
        'spousemiddlename': 'spouseMiddleName',
        'spousesuffix': 'spouseSuffix',
        'spousemobilenumber': 'spouseMobileNumber',
        'referencelastname': 'referenceLastName',
        'referencefirstname': 'referenceFirstName',
        'referencemiddlename': 'referenceMiddleName',
        'referencesuffix': 'referenceSuffix',
        'referencemobilenumber': 'referenceMobileNumber',
        'referencerelationship': 'referenceRelationship',
        'businessemployername': 'businessEmployerName',
        'professionoccupation': 'professionOccupation',
        'natureofbusiness': 'natureOfBusiness',
        'department': 'department',
        'landlinemobile': 'landlineMobile',
        'yearsinbusiness': 'yearsInBusiness',
        'monthlyincome': 'monthlyIncome',
        'annualincome': 'annualIncome',
        'workstreet': 'workStreet',
        'workbarangay': 'workBarangay',
        'workcity': 'workCity',
        'workzipcode': 'workZipCode',
        'unitfloor': 'unitFloor',
        'buildingtower': 'buildingTower',
        'lotno': 'lotNo',
        'bankinstitution': 'bankInstitution',
        'cardnumber': 'cardNumber',
        'creditlimit': 'creditLimit',
        'membersince': 'memberSince',
        'expirationdate': 'expirationDate',
        'delivercardto': 'deliverCardTo',
        'besttimetocontact': 'bestTimeToContact',
        'rcbc': 'rcbc',
        'metrobank': 'metrobank',
        'eastwestbank': 'eastWestBank',
        'securitybank': 'securityBank',
        'bpi': 'bpi',
        'pnb': 'pnb',
        'robinsonbank': 'robinsonBank',
        'maybank': 'maybank',
        'aub': 'aub',
        'status': 'status',
      };
      const normalize = (str: string): string => String(str).toLowerCase().replace(/[_\s]/g, '');
      const mappedData = data.map((row: Record<string, any>) => {
        const app: { [key: string]: any } = {};
        for (const key in row) {
          const normKey = normalize(key);
          const field = fieldMap[normKey];
          if (field) app[field] = row[key];
        }
        return app;
      });
      console.log('Mapped imported data:', mappedData);
      // You can setApplications(mappedData) in the future
    };
    reader.readAsBinaryString(file);
  };

  // Restore the exportToExcel function
  const exportToExcel = () => {
    const headers = [
      'LAST NAME', 'FIRST NAME', 'MIDDLE NAME', 'SUFFIX', 'DATE OF BIRTH', 'PLACE OF BIRTH', 'GENDER', 'CIVIL STATUS', 'NATIONALITY', 'MOBILE NUMBER', 'EMAIL ADDRESS', 'HOME NUMBER', 'SSS/GSIS/UMID', 'TIN',
      "MOTHER'S MAIDEN NAME", 'PRESENT HOME ADDRESS', 'YEARS OF STAY', 'SPOUSE DETAILS', "BUSINESS/EMPLOYER'S NAME", 'PROFESSION/OCCUPATION', 'NATURE OF BUSINESS', 'DEPARTMENT (IF EMPLOYED)', 'LANDLINE NUMBER/MOBILE NO.', 'YEARS IN PRESENT BUSINESS/EMPLOYER', 'MONTHLY INCOME', 'ANNUAL INCOME',
      'BUSINESS ADDRESS', 'BANK INSTITUTION', 'CARD NUMBER', 'CREDIT LIMIT', 'MEMBER SINCE', 'EXPIRY DATE', 'DELIVER CARD TO', 'BEST TIME TO CONTACT', 'LOCATION', 'AGENT', 'PERSONAL REFERENCE', 'REMARKS', 'BANK APPLIED'
    ];

    const data = applications.map(app => [
      app.personalDetails?.lastName || '',
      app.personalDetails?.firstName || '',
      app.personalDetails?.middleName || '',
      app.personalDetails?.suffix || '',
      app.personalDetails?.dateOfBirth || '',
      app.personalDetails?.placeOfBirth || '',
      app.personalDetails?.gender || '',
      app.personalDetails?.civilStatus || '',
      app.personalDetails?.nationality || '',
      app.personalDetails?.mobileNumber || '',
      app.personalDetails?.emailAddress || '',
      app.personalDetails?.homeNumber || '',
      app.personalDetails?.sssGsisUmid || '',
      app.personalDetails?.tin || '',
      [app.motherDetails?.lastName, app.motherDetails?.firstName, app.motherDetails?.middleName, app.motherDetails?.suffix].filter(Boolean).join(' ') || '',
      [app.permanentAddress?.street, app.permanentAddress?.barangay, app.permanentAddress?.city, app.permanentAddress?.zipCode].filter(Boolean).join(', ') || '',
      app.permanentAddress?.yearsOfStay || '',
      [app.spouseDetails?.lastName, app.spouseDetails?.firstName, app.spouseDetails?.middleName, app.spouseDetails?.suffix, app.spouseDetails?.mobileNumber].filter(Boolean).join(' ') || '',
      app.workDetails?.businessEmployerName || '',
      app.workDetails?.professionOccupation || '',
      app.workDetails?.natureOfBusiness || '',
      app.workDetails?.department || '',
      app.workDetails?.landlineMobile || '',
      app.workDetails?.yearsInBusiness || '',
      app.workDetails?.monthlyIncome || '',
      app.workDetails?.annualIncome || '',
      [app.workDetails?.address?.street, app.workDetails?.address?.barangay, app.workDetails?.address?.city, app.workDetails?.address?.zipCode].filter(Boolean).join(', ') || '',
      app.creditCardDetails?.bankInstitution || '',
      app.creditCardDetails?.cardNumber || '',
      app.creditCardDetails?.creditLimit || '',
      app.creditCardDetails?.memberSince || '',
      app.creditCardDetails?.expirationDate || '',
      app.creditCardDetails?.deliverCardTo === 'business' ? 'BUSINESS ADDRESS' : 'PRESENT HOME ADDRESS',
      app.creditCardDetails?.bestTimeToContact || '',
      app.location || '',
      app.agent || '',
      [app.personalReference?.lastName, app.personalReference?.firstName, app.personalReference?.middleName, app.personalReference?.suffix, app.personalReference?.mobileNumber, app.personalReference?.relationship].filter(Boolean).join(' ') || '',
      app.remarks || '',
      app.bankApplied || ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    XLSX.writeFile(wb, 'applications_export.xlsx');
  };

  // Reset section when opening/closing modal
  useEffect(() => {
    if (viewedApp) setCurrentSection(0);
  }, [viewedApp]);

  // Place this useEffect at the top level of the component, after other hooks:
  useEffect(() => {
    if (viewedApp) {
      console.log('DEBUG viewedApp:', viewedApp);
    }
  }, [viewedApp]);

  const filteredApplications = applications.filter(app => {
    const search = nameFilter.trim().toLowerCase();
    let matchesSearch = true;
    if (search) {
      // Always show public submissions
      if (!app.submitted_by || app.submitted_by === 'direct') matchesSearch = true;
      else {
        // Agent name match
        const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
        const agentName = agent?.name?.toLowerCase() || '';
        const matchesName = agentName.includes(search);
        // Bank code match
        let matchesCode = false;
        if (agent && Array.isArray(agent.bank_codes)) {
          matchesCode = agent.bank_codes.some((entry: any) => (entry.code || '').toLowerCase().includes(search));
        }
        matchesSearch = matchesName || matchesCode;
      }
    }
    // Status filter
    let matchesStatus = true;
    if (statusFilter) {
      matchesStatus = (app.status || '').toLowerCase() === statusFilter.toLowerCase();
    }
    return matchesSearch && matchesStatus;
  });

  const exportHistoryToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Application History', 20, 20);
    // Horizontal line after title
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(12);
    const tableColumn = ['Applicant', 'Date & Time', 'Status', 'Submitted By', 'Bank Codes'];
    const tableRows = filteredApplications.map(app => [
      `${app.personal_details?.firstName ?? ''} ${app.personal_details?.lastName ?? ''}`,
      app.submitted_at ? new Date(app.submitted_at).toLocaleString() : '',
      app.status,
      app.submitted_by || 'direct',
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
  const handleExportPDF = () => {
    exportHistoryToPDF();
    setShowExportPreview(false);
  };

  // In renderApplications, slice the applications array
  const paginatedApplications = applications.slice(0, applicationsPage * PAGE_SIZE);
  // In renderHistory, slice the filteredApplications array
  const paginatedHistory = filteredApplications.slice(0, historyPage * PAGE_SIZE);

  // Reset pagination when switching sections or filters
  useEffect(() => { setApplicationsPage(1); }, [activeSection]);
  useEffect(() => { setHistoryPage(1); }, [activeSection, nameFilter, statusFilter]);

  // Main layout
  return (
    <>
      <div className="flex min-h-screen">
        <aside className="fixed top-0 left-0 h-screen w-64 bg-[#101624] text-white flex flex-col py-6 px-2 sm:px-6 shadow-xl z-50">
          {/* Logo and Title Section */}
          <div className="flex flex-col items-center mb-10 px-2">
            <div className="bg-white rounded-full flex items-center justify-center w-24 h-24 mb-4">
              <img src={Logo} alt="Logo" className="h-16 w-16 object-contain" />
            </div>
            <span className="text-2xl font-extrabold tracking-wide text-center mb-1" style={{letterSpacing: '0.08em'}}>SILVER CARD</span>
            <span className="text-xs uppercase text-gray-400 tracking-widest text-center mb-1">SOLUTIONS</span>
            <span className="text-sm text-gray-300 text-center">Admin Portal</span>
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
                {/* Notification badges removed */}
              </button>
            ))}
          </nav>
          {/* Optional: Logout at the bottom */}
          <button onClick={logout} className="flex items-center mt-auto px-4 py-3 rounded-lg text-red-400 hover:text-red-600 border-2 border-transparent hover:bg-white/10 justify-center">
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </button>
        </aside>
        <div className="ml-64 flex-1 flex flex-col min-h-0" style={{height: '100vh'}}>
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
              {activeSection === 'account' && renderAccount()}
              {activeSection === 'applications' && renderApplications()}
              {activeSection === 'history' && renderHistory()}
            </main>
              {previewApp && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            {/* ...previewApp modal content... */}
                </div>
              )}
              {editApp && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            {/* ...editApp modal content... */}
              </div>
            )}
            {pdfPreviewApp && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            {/* ...pdfPreviewApp modal content... */}
                  </div>
                        )}
      </div>
      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      {viewedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setViewedApp(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6">Application Details</h3>
            {/* Section content for 5 steps */}
            {currentModalStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">First Name:</span> {viewedApp.personal_details?.firstName ?? 'N/A'}</div>
                  <div><span className="font-medium">Middle Name:</span> {viewedApp.personal_details?.middleName ?? 'N/A'}</div>
                  <div><span className="font-medium">Last Name:</span> {viewedApp.personal_details?.lastName ?? 'N/A'}</div>
                  <div><span className="font-medium">Suffix:</span> {viewedApp.personal_details?.suffix ?? 'N/A'}</div>
                  <div><span className="font-medium">Gender:</span> {viewedApp.personal_details?.gender ?? 'N/A'}</div>
                  <div><span className="font-medium">Date of Birth:</span> {viewedApp.personal_details?.dateOfBirth ?? 'N/A'}</div>
                  <div><span className="font-medium">Place of Birth:</span> {viewedApp.personal_details?.placeOfBirth ?? 'N/A'}</div>
                  <div><span className="font-medium">Civil Status:</span> {viewedApp.personal_details?.civilStatus ?? 'N/A'}</div>
                  <div><span className="font-medium">Nationality:</span> {viewedApp.personal_details?.nationality ?? 'N/A'}</div>
                  <div><span className="font-medium">Mobile Number:</span> {viewedApp.personal_details?.mobileNumber ?? 'N/A'}</div>
                  <div><span className="font-medium">Home Number:</span> {viewedApp.personal_details?.homeNumber ?? 'N/A'}</div>
                  <div><span className="font-medium">Email Address:</span> {viewedApp.personal_details?.emailAddress ?? 'N/A'}</div>
                  <div><span className="font-medium">SSS/GSIS/UMID:</span> {viewedApp.personal_details?.sssGsisUmid ?? 'N/A'}</div>
                  <div><span className="font-medium">TIN:</span> {viewedApp.personal_details?.tin ?? 'N/A'}</div>
                </div>
              </div>
            )}
            {currentModalStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold mb-2 text-blue-700">Family & Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">Mother's First Name:</span> {viewedApp.mother_details?.firstName ?? 'N/A'}</div>
                  <div><span className="font-medium">Mother's Middle Name:</span> {viewedApp.mother_details?.middleName ?? 'N/A'}</div>
                  <div><span className="font-medium">Mother's Last Name:</span> {viewedApp.mother_details?.lastName ?? 'N/A'}</div>
                  <div><span className="font-medium">Mother's Suffix:</span> {viewedApp.mother_details?.suffix ?? 'N/A'}</div>
                  <div><span className="font-medium">Street:</span> {viewedApp.permanent_address?.street ?? 'N/A'}</div>
                  <div><span className="font-medium">Barangay:</span> {viewedApp.permanent_address?.barangay ?? 'N/A'}</div>
                  <div><span className="font-medium">City:</span> {viewedApp.permanent_address?.city ?? 'N/A'}</div>
                  <div><span className="font-medium">Province:</span> {viewedApp.permanent_address?.province ?? 'N/A'}</div>
                  <div><span className="font-medium">Zip Code:</span> {viewedApp.permanent_address?.zipCode ?? 'N/A'}</div>
                  <div><span className="font-medium">Years of Stay:</span> {viewedApp.permanent_address?.yearsOfStay ?? 'N/A'}</div>
                  <div><span className="font-medium">Spouse First Name:</span> {viewedApp.spouse_details?.firstName ?? 'N/A'}</div>
                  <div><span className="font-medium">Spouse Middle Name:</span> {viewedApp.spouse_details?.middleName ?? 'N/A'}</div>
                  <div><span className="font-medium">Spouse Last Name:</span> {viewedApp.spouse_details?.lastName ?? 'N/A'}</div>
                  <div><span className="font-medium">Spouse Suffix:</span> {viewedApp.spouse_details?.suffix ?? 'N/A'}</div>
                  <div><span className="font-medium">Spouse Mobile Number:</span> {viewedApp.spouse_details?.mobileNumber ?? 'N/A'}</div>
                  <div><span className="font-medium">Personal Reference First Name:</span> {viewedApp.personal_reference?.firstName ?? 'N/A'}</div>
                  <div><span className="font-medium">Personal Reference Middle Name:</span> {viewedApp.personal_reference?.middleName ?? 'N/A'}</div>
                  <div><span className="font-medium">Personal Reference Last Name:</span> {viewedApp.personal_reference?.lastName ?? 'N/A'}</div>
                  <div><span className="font-medium">Personal Reference Suffix:</span> {viewedApp.personal_reference?.suffix ?? 'N/A'}</div>
                  <div><span className="font-medium">Personal Reference Mobile Number:</span> {viewedApp.personal_reference?.mobileNumber ?? 'N/A'}</div>
                  <div><span className="font-medium">Personal Reference Relationship:</span> {viewedApp.personal_reference?.relationship ?? 'N/A'}</div>
                </div>
              </div>
            )}
            {currentModalStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold mb-2 text-blue-700">Work/Business Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">Business/Employer's Name:</span> {viewedApp.work_details?.businessEmployerName ?? 'N/A'}</div>
                  <div><span className="font-medium">Profession/Occupation:</span> {viewedApp.work_details?.professionOccupation ?? 'N/A'}</div>
                  <div><span className="font-medium">Nature of Business:</span> {viewedApp.work_details?.natureOfBusiness ?? 'N/A'}</div>
                  <div><span className="font-medium">Department:</span> {viewedApp.work_details?.department ?? 'N/A'}</div>
                  <div><span className="font-medium">Landline/Mobile:</span> {viewedApp.work_details?.landlineMobile ?? 'N/A'}</div>
                  <div><span className="font-medium">Years in Business:</span> {viewedApp.work_details?.yearsInBusiness ?? 'N/A'}</div>
                  <div><span className="font-medium">Monthly Income:</span> {viewedApp.work_details?.monthlyIncome ?? 'N/A'}</div>
                  <div><span className="font-medium">Annual Income:</span> {viewedApp.work_details?.annualIncome ?? 'N/A'}</div>
                  <div className="col-span-2">
                    <span className="font-medium">Address:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      {(() => {
                        const addr = viewedApp.work_details?.address;
                        if (addr && typeof addr === 'object' && !Array.isArray(addr)) {
                          return Object.entries(addr).map(([key, value]) => (
                            <div key={key}>{key}: {value ?? 'N/A'}</div>
                          ));
                        } else if (typeof addr === 'string') {
                          return <div>{addr}</div>;
                        }
                        return <div>N/A</div>;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentModalStep === 4 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold mb-2 text-blue-700">Credit Card & Bank Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">Bank/Institution:</span> {viewedApp.credit_card_details?.bankInstitution ?? 'N/A'}</div>
                  <div><span className="font-medium">Card Number:</span> {viewedApp.credit_card_details?.cardNumber ?? 'N/A'}</div>
                  <div><span className="font-medium">Credit Limit:</span> {viewedApp.credit_card_details?.creditLimit ?? 'N/A'}</div>
                  <div><span className="font-medium">Member Since:</span> {viewedApp.credit_card_details?.memberSince ?? 'N/A'}</div>
                  <div><span className="font-medium">Exp. Date:</span> {viewedApp.credit_card_details?.expirationDate ?? 'N/A'}</div>
                  <div><span className="font-medium">Deliver Card To:</span> {viewedApp.credit_card_details?.deliverCardTo === 'home' ? 'Present Home Address' : 'Business Address'}</div>
                  <div><span className="font-medium">Best Time to Contact:</span> {viewedApp.credit_card_details?.bestTimeToContact ?? 'N/A'}</div>
                  <div className="col-span-2">
                    <span className="font-medium">Bank Preferences:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewedApp.bank_preferences && Object.entries(viewedApp.bank_preferences).filter(([_, v]) => v).map(([k]) => (
                        <span key={k} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentModalStep === 5 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold mb-2 text-blue-700">File Links & Review</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">ID Photo:</span>
                    {viewedApp.id_photo_url ? (
                      <img src={viewedApp.id_photo_url} alt="ID Photo" className="w-56 h-40 object-contain border mt-2" />
                    ) : (
                      <span className="text-xs ml-2">No ID Uploaded</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">E-Signature:</span>
                    {viewedApp.e_signature_url ? (
                      <img src={viewedApp.e_signature_url} alt="E-Signature" className="w-56 h-24 object-contain border mt-2" />
                    ) : (
                      <span className="text-xs ml-2">No Signature Uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            )}
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
      {/* Export Preview Modal */}
      {showExportPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-bold mb-4">Export Preview</h2>
            <div className="overflow-x-auto max-h-96 mb-4">
              <table className="w-full text-xs border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Applicant</th>
                    <th className="p-2 border">Date & Time</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Submitted By</th>
                    <th className="p-2 border">Bank Codes</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app, i) => {
                    let agentBankCodes = null;
                    if (app.submitted_by && app.submitted_by !== 'direct') {
                      const agent = users.find(u => u.name === app.submitted_by || u.email === app.submitted_by);
                      if (agent && Array.isArray(agent.bank_codes) && agent.bank_codes.length > 0) {
                        agentBankCodes = agent.bank_codes;
                      }
                    }
                    return (
                      <tr key={i}>
                        <td className="p-2 border">{app.personal_details?.firstName ?? ''} {app.personal_details?.lastName ?? ''}</td>
                        <td className="p-2 border">{app.submitted_at ? new Date(app.submitted_at).toLocaleString() : ''}</td>
                        <td className="p-2 border">{app.status}</td>
                        <td className="p-2 border">{app.submitted_by || 'direct'}</td>
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
                        <td className="p-2 border flex space-x-2">
                          <div className="relative group">
                            <button className="text-blue-600 hover:text-blue-800 transition-colors" onClick={async () => {
                              await supabase.from('application_form').update({ status: 'submitted' }).eq('id', app.id);
                              setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'submitted' } : a));
                            }}>
                              <Send className="w-5 h-5" />
                            </button>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Submit</span>
                          </div>
                          <div className="relative group">
                            <button className="text-purple-600 hover:text-purple-800 transition-colors" onClick={async () => {
                              await supabase.from('application_form').update({ status: 'turn-in' }).eq('id', app.id);
                              setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'turn-in' } : a));
                            }}>
                              <ArrowDownCircle className="w-5 h-5" />
                            </button>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Turn-in</span>
                          </div>
                          <div className="relative group">
                            <button className="text-green-600 hover:text-green-800 transition-colors" onClick={async () => {
                              await supabase.from('application_form').update({ status: 'approved' }).eq('id', app.id);
                              setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'approved' } : a));
                            }}>
                              <ThumbsUp className="w-5 h-5" />
                            </button>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Approve</span>
                          </div>
                          <div className="relative group">
                            <button className="text-red-600 hover:text-red-800 transition-colors" onClick={async () => {
                              await supabase.from('application_form').update({ status: 'rejected' }).eq('id', app.id);
                              setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'rejected' } : a));
                            }}>
                              <ThumbsDown className="w-5 h-5" />
                            </button>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Reject</span>
                          </div>
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
       </div>
      </>
  );
};

export default AdminDashboard;