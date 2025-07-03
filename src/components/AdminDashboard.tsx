import React, { useState } from 'react';
import { Users, FileText, BarChart3, Settings, Plus, Check, X, Eye, Edit, LogOut, User, Clock, CheckCircle, List, History, Trash2, Download, Menu } from 'lucide-react';
import { useApplications } from '../context/ApplicationContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import Toast from './Toast';
import Logo from '../assets/Company/Logo.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// Restore mockApplications array
const mockApplications = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    date: '6/22/2025',
    time: '9:51:46 PM',
    status: 'pending',
    submittedBy: 'Direct',
    location: '',
    agent: '',
    remarks: '',
    bankApplied: '',
    personalDetails: {
      lastName: 'Doe',
      firstName: 'John',
      middleName: 'A',
      suffix: '',
      dateOfBirth: '1990-01-01',
      placeOfBirth: 'Manila',
      gender: 'Male',
      civilStatus: 'Single',
      nationality: 'Filipino',
      mobileNumber: '09171234567',
      homeNumber: '1234567',
      emailAddress: 'john.doe@email.com',
      sssGsisUmid: '123-45-6789',
      tin: '987-65-4321',
    },
    motherDetails: {
      lastName: 'Smith',
      firstName: 'Jane',
      middleName: 'B',
      suffix: '',
    },
    permanentAddress: {
      street: '123 Main St',
      barangay: 'Barangay 1',
      city: 'Quezon City',
      zipCode: '1100',
      yearsOfStay: '5',
    },
    spouseDetails: {
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      mobileNumber: '',
    },
    personalReference: {
      lastName: 'Reyes',
      firstName: 'Carlos',
      middleName: 'C',
      suffix: '',
      mobileNumber: '09181234567',
      relationship: 'Friend',
    },
    workDetails: {
      businessEmployerName: 'ABC Corp',
      professionOccupation: 'Engineer',
      natureOfBusiness: 'IT',
      department: 'Development',
      landlineMobile: '2345678',
      yearsInBusiness: '3',
      monthlyIncome: '50000',
      annualIncome: '600000',
      address: {
        street: '456 Office St',
        barangay: 'Barangay 2',
        city: 'Makati',
        zipCode: '1200',
        unitFloor: '10F',
        buildingTower: 'Tower 1',
        lotNo: 'Lot 5',
      },
    },
    creditCardDetails: {
      bankInstitution: 'BPI',
      cardNumber: '1234-5678-9012-3456',
      creditLimit: '100000',
      memberSince: '2018',
      expirationDate: '2026-12',
      deliverCardTo: 'home',
      bestTimeToContact: 'Afternoon',
    },
    bankPreferences: {
      rcbc: false,
      metrobank: true,
      eastWestBank: false,
      securityBank: false,
      bpi: true,
      pnb: false,
      robinsonBank: false,
      maybank: false,
      aub: false,
    },
  },
];

// Restore mockUsers array
const mockUsers = [
  { name: 'Admin User', email: 'admin@silverpay.com', role: 'admin', password: '' },
  { name: 'Agent User', email: 'agent@silverpay.com', role: 'agent', password: '' },
];

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [users, setUsers] = useState<typeof mockUsers>(mockUsers);
  const [applications, setApplications] = useState<typeof mockApplications>(mockApplications);
  const [viewedApp, setViewedApp] = useState<typeof mockApplications[0] | null>(null);
  const [editUserIdx, setEditUserIdx] = useState<number | null>(null);
  const [editUser, setEditUser] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);
  const [editApp, setEditApp] = useState<typeof mockApplications[0] | null>(null);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [currentEditStep, setCurrentEditStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewApp, setPreviewApp] = useState<typeof mockApplications[0] | null>(null);

  // Sidebar navigation
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <List className="w-5 h-5 mr-2" /> },
    { key: 'account', label: 'Account Management', icon: <User className="w-5 h-5 mr-2" /> },
    { key: 'applications', label: 'Client Applications', icon: <FileText className="w-5 h-5 mr-2" /> },
    { key: 'history', label: 'Application History', icon: <History className="w-5 h-5 mr-2" /> },
  ];

  // Dashboard stats
  const totalApplications = mockApplications.length;
  const pendingReviews = mockApplications.filter(a => a.status === 'pending').length;
  const approved = mockApplications.filter(a => a.status === 'approved').length;
  const totalUsers = mockUsers.length;

  // Stepper for modal
  const modalSteps = [
    { title: 'Personal Details', number: 1 },
    { title: 'Address & Family', number: 2 },
    { title: 'Work Details', number: 3 },
    { title: 'Credit & Preferences', number: 4 },
  ];

  // Export single application as PDF
  const exportSinglePDF = (app: typeof mockApplications[0]) => {
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
          {mockApplications.map(app => (
            <div key={app.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-2">
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">{app.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-gray-500">{app.date}</div>
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">{app.status}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'dashboard' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-blue-700 border-transparent hover:bg-blue-100'}`} onClick={() => setActiveSection('dashboard')}><List className="w-5 h-5 mr-2" /> Dashboard</button>
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'applications' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-blue-700 border-transparent hover:bg-blue-100'}`} onClick={() => setActiveSection('applications')}><FileText className="w-5 h-5 mr-2" /> Client Applications <span className="ml-auto bg-blue-200 text-blue-800 rounded-full px-2 py-0.5 text-xs">{applications.length}</span></button>
            <button className={`w-full flex items-center px-4 py-3 rounded-lg font-medium border-2 ${activeSection === 'account' ? 'bg-green-50 text-green-700 border-green-400' : 'bg-white text-green-700 border-transparent hover:bg-green-100'}`} onClick={() => setActiveSection('account')}><User className="w-5 h-5 mr-2" /> Account Management <span className="ml-auto bg-green-200 text-green-800 rounded-full px-2 py-0.5 text-xs">{users.length}</span></button>
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
                <td className="py-3 flex items-center"><div className="bg-purple-200 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-2">{u.name.split(' ').map(n => n[0]).join('')}</div>{u.name}</td>
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
                    });
                  }}><Edit className="w-4 h-4" /></button>
                  <button className="text-red-600 hover:text-red-800" onClick={() => {
                    if (pendingDeleteIdx === i) {
                      setUsers(prev => prev.filter((_, idx) => idx !== i));
                      setPendingDeleteIdx(null);
                      setToast({ show: false, message: '' });
                    } else {
                      setPendingDeleteIdx(i);
                      setToast({ show: true, message: 'Click again to confirm delete.' });
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
              <form onSubmit={e => {
                e.preventDefault();
                setUsers(prev => [...prev, { name: newUser.name, email: newUser.email, role: newUser.role, password: newUser.password }]);
                setShowAddUser(false);
                setNewUser({ name: '', email: '', password: '', role: 'agent' });
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
                <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800">Create Account</button>
              </form>
            </div>
          </div>
        )}
        {editUserIdx !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button onClick={() => setEditUserIdx(null)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
              <h3 className="text-xl font-bold mb-4">Edit User</h3>
              <form onSubmit={e => {
                e.preventDefault();
                setUsers(prev => prev.map((u, idx) => idx === editUserIdx ? { ...u, ...editUser } : u));
                setEditUserIdx(null);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" value={editUser.password} onChange={e => setEditUser({ ...editUser, password: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })} className="w-full border rounded-lg px-3 py-2" required>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                  </select>
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
      <div className="flex items-center mb-4 gap-4">
        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 cursor-pointer">
          Import Excel/CSV
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} className="hidden" />
        </label>
        <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 ml-2">Export Excel/CSV</button>
        <span className="text-xs text-gray-500">(Import or export client applications in bulk)</span>
      </div>
      <div className="bg-white rounded-xl shadow-md w-full overflow-x-hidden">
        <div className="w-full">
          {/* Desktop Table */}
          <table className="w-full text-xs sm:text-sm md:text-base table-fixed hidden sm:table">
            <thead>
              <tr className="text-xs text-gray-500 uppercase align-middle">
                <th className="py-2 align-middle">Applicant</th>
                <th className="py-2 align-middle">Email</th>
                <th className="py-2 align-middle">Submitted</th>
                <th className="py-2 align-middle">Status</th>
                <th className="py-2 align-middle">Submitted By</th>
                <th className="py-2 align-middle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={i} className="border-t">
                  <td className="py-3 flex items-center pl-6 align-middle"><div className="bg-blue-200 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-2">{app.name.split(' ').map(n => n[0]).join('')}</div>{app.name}</td>
                  <td className="py-3 break-words">{app.email}</td>
                  <td className="py-3">{app.date} <span className="block text-xs text-gray-400">{app.time}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span></td>
                  <td className="py-3">{app.submittedBy}</td>
                  <td className="py-3 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => setViewedApp(app)}><Eye className="w-4 h-4" /></button>
                    <button className="text-green-600 hover:text-green-800" onClick={() => setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'approved' } : a))}><Check className="w-4 h-4" /></button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'rejected' } : a))}><X className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile Card Layout */}
          <div className="sm:hidden flex flex-col gap-4">
            {applications.map((app, i) => (
              <div key={i} className="rounded-xl shadow p-4 bg-white flex flex-col gap-2 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-200 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">{app.name.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <div className="font-semibold text-base text-gray-900">{app.name}</div>
                      <div className="text-xs text-gray-500">{app.email}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-right min-w-fit ml-2">
                    {app.date} <br />{app.time}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-700 mb-2 justify-between items-center w-full">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span>
                    <span className="font-semibold ml-2">By:</span> {app.submittedBy}
                  </div>
                  <div className="flex gap-3 items-center ml-auto">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => setViewedApp(app)} title="View"><Eye className="w-5 h-5" /></button>
                    <button className="text-green-600 hover:text-green-800" onClick={() => setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'approved' } : a))} title="Approve"><Check className="w-5 h-5" /></button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => setApplications(apps => apps.map((a, idx) => idx === i ? { ...a, status: 'rejected' } : a))} title="Reject"><X className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
        <div className="flex flex-col gap-2 mb-4">
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Search by name..." />
          <div className="flex gap-2 w-full">
            <input className="border rounded-lg px-3 py-2 w-1/2" placeholder="mm/dd/yyyy" />
            <select className="border rounded-lg px-3 py-2 w-1/2">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>
        {/* Desktop Table */}
        <table className="w-full text-xs sm:text-sm md:text-base table-fixed hidden sm:table">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="py-2">Application ID</th>
              <th className="py-2">Applicant</th>
              <th className="py-2">Date & Time</th>
              <th className="py-2">Status</th>
              <th className="py-2">Submitted By</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, i) => (
              <tr key={i} className="border-t">
                <td className="py-3">#{app.id}</td>
                <td className="py-3 flex items-center"><div className="bg-blue-200 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-2">{app.name.split(' ').map(n => n[0]).join('')}</div>{app.name}</td>
                <td className="py-3">{app.date} <span className="block text-xs text-gray-400">{app.time}</span></td>
                <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span></td>
                <td className="py-3">{app.submittedBy}</td>
                <td className="py-3 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800" onClick={() => setViewedApp(app)}><Eye className="w-4 h-4" /></button>
                  <button className="text-green-600 hover:text-green-800" onClick={() => setEditApp(app)}><Edit className="w-4 h-4" /></button>
                  <button className="text-purple-600 hover:text-purple-800" title="Export PDF" onClick={() => setPreviewApp(app)}><Download className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Mobile Card Layout */}
        <div className="sm:hidden flex flex-col gap-4">
          {applications.map((app, i) => (
            <div key={i} className="rounded-xl shadow p-4 bg-white flex flex-col gap-2 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-200 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">{app.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div className="font-semibold text-base text-gray-900">{app.name}</div>
                    <div className="text-xs text-gray-500">ID: {app.id}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right min-w-fit ml-2">
                  {app.date} <br />{app.time}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-700 mb-2 justify-between items-center w-full">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span>
                  <span className="font-semibold ml-2">By:</span> {app.submittedBy}
                </div>
                <div className="flex gap-3 items-center ml-auto">
                  <button className="text-blue-600 hover:text-blue-800" onClick={() => setViewedApp(app)} title="View"><Eye className="w-5 h-5" /></button>
                  <button className="text-green-600 hover:text-green-800" onClick={() => setEditApp(app)} title="Edit"><Edit className="w-5 h-5" /></button>
                  <button className="text-purple-600 hover:text-purple-800" title="Export PDF" onClick={() => setPreviewApp(app)}><Download className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

  const renderModalStepContent = (app: typeof mockApplications[0]) => {
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

  const renderEditStepContent = (app: typeof mockApplications[0], setApp: (a: typeof mockApplications[0]) => void) => {
    switch (currentEditStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Personal Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.lastName || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, lastName: e.target.value } })} required /></div>
                <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.firstName || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, firstName: e.target.value } })} required /></div>
                <div><label className="block text-sm font-medium mb-1">Middle Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.middleName || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, middleName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Suffix</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.suffix || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, suffix: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Date of Birth</label><input type="date" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.dateOfBirth || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, dateOfBirth: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Place of Birth</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.placeOfBirth || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, placeOfBirth: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Gender</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.gender || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, gender: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Civil Status</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.civilStatus || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, civilStatus: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Nationality</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.nationality || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, nationality: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Mobile Number</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.mobileNumber || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, mobileNumber: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Home Number</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.homeNumber || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, homeNumber: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Email Address</label><input type="email" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.emailAddress || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, emailAddress: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">SSS/GSIS/UMID</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.sssGsisUmid || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, sssGsisUmid: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">TIN</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalDetails?.tin || ''} onChange={e => setApp({ ...app, personalDetails: { ...app.personalDetails, tin: e.target.value } })} /></div>
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
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.motherDetails?.lastName || ''} onChange={e => setApp({ ...app, motherDetails: { ...app.motherDetails, lastName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.motherDetails?.firstName || ''} onChange={e => setApp({ ...app, motherDetails: { ...app.motherDetails, firstName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Middle Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.motherDetails?.middleName || ''} onChange={e => setApp({ ...app, motherDetails: { ...app.motherDetails, middleName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Suffix</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.motherDetails?.suffix || ''} onChange={e => setApp({ ...app, motherDetails: { ...app.motherDetails, suffix: e.target.value } })} /></div>
              </div>
            </div>
            {/* Permanent Address */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Permanent Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Street</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.permanentAddress?.street || ''} onChange={e => setApp({ ...app, permanentAddress: { ...app.permanentAddress, street: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Barangay</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.permanentAddress?.barangay || ''} onChange={e => setApp({ ...app, permanentAddress: { ...app.permanentAddress, barangay: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">City</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.permanentAddress?.city || ''} onChange={e => setApp({ ...app, permanentAddress: { ...app.permanentAddress, city: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Zip Code</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.permanentAddress?.zipCode || ''} onChange={e => setApp({ ...app, permanentAddress: { ...app.permanentAddress, zipCode: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Years of Stay</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.permanentAddress?.yearsOfStay || ''} onChange={e => setApp({ ...app, permanentAddress: { ...app.permanentAddress, yearsOfStay: e.target.value } })} /></div>
              </div>
            </div>
            {/* Spouse Details */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Spouse Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.spouseDetails?.lastName || ''} onChange={e => setApp({ ...app, spouseDetails: { ...app.spouseDetails, lastName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.spouseDetails?.firstName || ''} onChange={e => setApp({ ...app, spouseDetails: { ...app.spouseDetails, firstName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Middle Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.spouseDetails?.middleName || ''} onChange={e => setApp({ ...app, spouseDetails: { ...app.spouseDetails, middleName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Suffix</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.spouseDetails?.suffix || ''} onChange={e => setApp({ ...app, spouseDetails: { ...app.spouseDetails, suffix: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Mobile Number</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.spouseDetails?.mobileNumber || ''} onChange={e => setApp({ ...app, spouseDetails: { ...app.spouseDetails, mobileNumber: e.target.value } })} /></div>
              </div>
            </div>
            {/* Personal Reference */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Personal Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalReference?.lastName || ''} onChange={e => setApp({ ...app, personalReference: { ...app.personalReference, lastName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalReference?.firstName || ''} onChange={e => setApp({ ...app, personalReference: { ...app.personalReference, firstName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Middle Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalReference?.middleName || ''} onChange={e => setApp({ ...app, personalReference: { ...app.personalReference, middleName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Suffix</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalReference?.suffix || ''} onChange={e => setApp({ ...app, personalReference: { ...app.personalReference, suffix: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Mobile Number</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalReference?.mobileNumber || ''} onChange={e => setApp({ ...app, personalReference: { ...app.personalReference, mobileNumber: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Relationship</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.personalReference?.relationship || ''} onChange={e => setApp({ ...app, personalReference: { ...app.personalReference, relationship: e.target.value } })} /></div>
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
                <div><label className="block text-sm font-medium mb-1">Business/Employer's Name</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.businessEmployerName || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, businessEmployerName: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Profession/Occupation</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.professionOccupation || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, professionOccupation: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Nature of Business</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.natureOfBusiness || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, natureOfBusiness: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Department</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.department || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, department: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Landline/Mobile</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.landlineMobile || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, landlineMobile: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Years in Business</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.yearsInBusiness || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, yearsInBusiness: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Monthly Income</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.monthlyIncome || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, monthlyIncome: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Annual Income</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.annualIncome || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, annualIncome: e.target.value } })} /></div>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Business/Office Address</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Street</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.address?.street || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, address: { ...app.workDetails?.address, street: e.target.value } } })} /></div>
                  <div><label className="block text-sm font-medium mb-1">Barangay</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.address?.barangay || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, address: { ...app.workDetails?.address, barangay: e.target.value } } })} /></div>
                  <div><label className="block text-sm font-medium mb-1">City</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.address?.city || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, address: { ...app.workDetails?.address, city: e.target.value } } })} /></div>
                  <div><label className="block text-sm font-medium mb-1">Zip Code</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.address?.zipCode || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, address: { ...app.workDetails?.address, zipCode: e.target.value } } })} /></div>
                  <div><label className="block text-sm font-medium mb-1">Unit/Floor</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.address?.unitFloor || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, address: { ...app.workDetails?.address, unitFloor: e.target.value } } })} /></div>
                  <div><label className="block text-sm font-medium mb-1">Building/Tower</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.address?.buildingTower || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, address: { ...app.workDetails?.address, buildingTower: e.target.value } } })} /></div>
                  <div><label className="block text-sm font-medium mb-1">Lot No.</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.workDetails?.address?.lotNo || ''} onChange={e => setApp({ ...app, workDetails: { ...app.workDetails, address: { ...app.workDetails?.address, lotNo: e.target.value } } })} /></div>
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
                <div><label className="block text-sm font-medium mb-1">Bank/Institution</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.creditCardDetails?.bankInstitution || ''} onChange={e => setApp({ ...app, creditCardDetails: { ...app.creditCardDetails, bankInstitution: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Card Number</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.creditCardDetails?.cardNumber || ''} onChange={e => setApp({ ...app, creditCardDetails: { ...app.creditCardDetails, cardNumber: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Credit Limit</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.creditCardDetails?.creditLimit || ''} onChange={e => setApp({ ...app, creditCardDetails: { ...app.creditCardDetails, creditLimit: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Member Since</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.creditCardDetails?.memberSince || ''} onChange={e => setApp({ ...app, creditCardDetails: { ...app.creditCardDetails, memberSince: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Exp. Date</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.creditCardDetails?.expirationDate || ''} onChange={e => setApp({ ...app, creditCardDetails: { ...app.creditCardDetails, expirationDate: e.target.value } })} /></div>
                <div><label className="block text-sm font-medium mb-1">Deliver Card To</label><select className="w-full border rounded-lg px-3 py-2" value={app.creditCardDetails?.deliverCardTo || ''} onChange={e => setApp({ ...app, creditCardDetails: { ...app.creditCardDetails, deliverCardTo: e.target.value as 'home' | 'business' } })}>
                  <option value="home">Present Home Address</option>
                  <option value="business">Business Address</option>
                </select></div>
                <div><label className="block text-sm font-medium mb-1">Best Time to Contact</label><input type="text" className="w-full border rounded-lg px-3 py-2" value={app.creditCardDetails?.bestTimeToContact || ''} onChange={e => setApp({ ...app, creditCardDetails: { ...app.creditCardDetails, bestTimeToContact: e.target.value } })} /></div>
              </div>
            </div>
            {/* Bank Preferences */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Bank Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {app.bankPreferences && Object.entries(app.bankPreferences).map(([k, v]) => (
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

  // Main layout
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
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-gradient-to-b from-[#101624] to-[#1a2236] text-white flex flex-col justify-between py-6 px-2 sm:px-6 min-h-fit shadow-xl transform transition-transform duration-300
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
            <div className="text-xs text-blue-100 font-semibold">Admin Portal</div>
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
        <div className="flex flex-col items-center mb-2 mt-auto absolute bottom-6 left-0 w-full">
          <div className="bg-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mb-2 shadow-md">AU</div>
          <div className="text-white font-semibold">Admin User</div>
          <div className="text-xs text-blue-100">admin@silverpay.com</div>
        </div>
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
            <div className="text-xl font-bold text-gray-900">Silver Card</div>
            <div className="text-xs text-gray-500">Credit Card Management System</div>
          </div>
          {/* Logout button */}
          <button onClick={logout} className="ml-2 text-gray-400 hover:text-red-600" title="Sign Out">
            <LogOut className="w-6 h-6" />
          </button>
        </header>
        {/* Content */}
        <main className="flex-1 p-2 sm:p-8 overflow-x-visible">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'account' && renderAccount()}
          {activeSection === 'applications' && renderApplications()}
          {activeSection === 'history' && renderHistory()}
        </main>
        {/* Application Details Modal - always available */}
        {viewedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => { setViewedApp(null); setCurrentModalStep(1); }} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
              {/* Status badge always visible at top right, below close button */}
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
              {viewedApp.personalDetails ? (
                <>
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
            <button
                      type="button"
                      onClick={() => {
                        if (currentModalStep < 4) setCurrentModalStep(s => Math.min(4, s + 1));
                        else { setViewedApp(null); setCurrentModalStep(1); }
                      }}
                      className={`flex items-center px-4 py-2 rounded-lg ${currentModalStep < 4 ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-green-600 text-white hover:bg-green-700'} text-sm`}
                    >
                      {currentModalStep < 4 ? 'Next' : 'Close'}
                    </button>
                  </div>
                  {currentModalStep === 4 && (
                    <div className="flex justify-end gap-4 mt-8">
                      <button
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
                        onClick={() => {
                          setApplications(apps => apps.map(a => a.id === viewedApp.id ? { ...a, status: 'rejected' } : a));
                          setViewedApp(null);
                          setCurrentModalStep(1);
                        }}
                      >
                        Reject
                      </button>
                      <button
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
                        onClick={() => {
                          setApplications(apps => apps.map(a => a.id === viewedApp.id ? { ...a, status: 'approved' } : a));
                          setViewedApp(null);
                          setCurrentModalStep(1);
                        }}
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500 text-center py-12">No detailed data available for this application.</div>
              )}
            </div>
          </div>
        )}
        {editApp && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => { setEditApp(null); setCurrentEditStep(1); }} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
              {/* Status badge always visible at top right, below close button */}
              {editApp.status && (
                <span
                  className={`absolute top-3 right-12 px-3 py-1 rounded-full text-sm font-medium ${
                    editApp.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : editApp.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                  style={{ zIndex: 10 }}
                >
                  {editApp.status}
                </span>
              )}
              <h3 className="text-2xl font-bold mb-6">Edit Application</h3>
              {editApp.personalDetails ? (
                <>
                  {renderEditStepIndicator()}
                  <form onSubmit={e => {
                    e.preventDefault();
                    setApplications(apps => apps.map(a => a.id === editApp.id ? editApp : a));
                    setEditApp(null);
                    setCurrentEditStep(1);
                  }}>
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
                          className="flex items-center px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 text-sm"
                        >
                          Next
            </button>
                      ) : (
            <button
                          type="submit"
                          className="flex items-center px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-sm"
                        >
                          Save Changes
            </button>
                      )}
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-gray-500 text-center py-12">No detailed data available for this application.</div>
              )}
            </div>
        </div>
        )}
      </div>
      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      {previewApp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-[1400px] relative overflow-y-auto max-h-[95vh] flex flex-col">
            <button onClick={() => setPreviewApp(null)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl">&times;</button>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Application Print Preview</h2>
              <button onClick={handleExportPreviewPDF} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center"><Download className="w-5 h-5 mr-2" />Export PDF</button>
            </div>
            <div
              id="pdf-preview"
              style={{
                width: '1200px',
                height: '793px',
                margin: 0,
                padding: 0,
                border: 'none',
                background: '#fff',
                overflow: 'hidden',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                gap: '2rem'
              }}
            >
              {/* Two-column layout: left for personal/address, right for work/card/bank/images */}
              {previewApp && (
                <div className="flex flex-row h-full w-full gap-8">
                  {/* LEFT COLUMN */}
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Personal Details Table */}
                    <div className="mb-2">
                      <div className="bg-gray-800 text-white font-bold px-2 py-1">PERSONAL DETAILS</div>
                      <table className="w-full border text-xs">
                        <tbody>
                          <tr className="border">
                            <td className="border px-1">LAST NAME</td>
                            <td className="border px-1">{previewApp.personalDetails.lastName}</td>
                            <td className="border px-1">FIRST NAME</td>
                            <td className="border px-1">{previewApp.personalDetails.firstName}</td>
                            <td className="border px-1">MIDDLE NAME</td>
                            <td className="border px-1">{previewApp.personalDetails.middleName}</td>
                            <td className="border px-1">SUFFIX</td>
                            <td className="border px-1">{previewApp.personalDetails.suffix}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">DATE OF BIRTH</td>
                            <td className="border px-1">{previewApp.personalDetails.dateOfBirth}</td>
                            <td className="border px-1">PLACE OF BIRTH</td>
                            <td className="border px-1">{previewApp.personalDetails.placeOfBirth}</td>
                            <td className="border px-1">GENDER</td>
                            <td className="border px-1">{previewApp.personalDetails.gender}</td>
                            <td className="border px-1">CIVIL STATUS</td>
                            <td className="border px-1">{previewApp.personalDetails.civilStatus}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">NATIONALITY</td>
                            <td className="border px-1">{previewApp.personalDetails.nationality}</td>
                            <td className="border px-1">EMAIL ADDRESS</td>
                            <td className="border px-1">{previewApp.personalDetails.emailAddress}</td>
                            <td className="border px-1">MOBILE NUMBER</td>
                            <td className="border px-1">{previewApp.personalDetails.mobileNumber}</td>
                            <td className="border px-1">HOME NUMBER</td>
                            <td className="border px-1">{previewApp.personalDetails.homeNumber}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">SSS/GSIS/UMID</td>
                            <td className="border px-1">{previewApp.personalDetails.sssGsisUmid}</td>
                            <td className="border px-1">TIN</td>
                            <td className="border px-1">{previewApp.personalDetails.tin}</td>
                            <td className="border px-1" colSpan={4}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Mother's Maiden Name Table */}
                    <div className="mb-2">
                      <div className="bg-gray-800 text-white font-bold px-2 py-1">MOTHER'S MAIDEN NAME</div>
                      <table className="w-full border text-xs">
                        <tbody>
                          <tr className="border">
                            <td className="border px-1">LAST NAME</td>
                            <td className="border px-1">{previewApp.motherDetails.lastName}</td>
                            <td className="border px-1">FIRST NAME</td>
                            <td className="border px-1">{previewApp.motherDetails.firstName}</td>
                            <td className="border px-1">MIDDLE NAME</td>
                            <td className="border px-1">{previewApp.motherDetails.middleName}</td>
                            <td className="border px-1">SUFFIX</td>
                            <td className="border px-1">{previewApp.motherDetails.suffix}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Permanent Address Table */}
                    <div className="mb-2">
                      <div className="bg-gray-800 text-white font-bold px-2 py-1">PRESENT HOME ADDRESS</div>
                      <table className="w-full border text-xs">
                        <tbody>
                          <tr className="border">
                            <td className="border px-1">STREET</td>
                            <td className="border px-1">{previewApp.permanentAddress.street}</td>
                            <td className="border px-1">BARANGAY</td>
                            <td className="border px-1">{previewApp.permanentAddress.barangay}</td>
                            <td className="border px-1">CITY</td>
                            <td className="border px-1">{previewApp.permanentAddress.city}</td>
                            <td className="border px-1">ZIP CODE</td>
                            <td className="border px-1">{previewApp.permanentAddress.zipCode}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">YEARS OF STAY</td>
                            <td className="border px-1">{previewApp.permanentAddress.yearsOfStay}</td>
                            <td className="border px-1" colSpan={6}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Spouse Details Table */}
                    <div className="mb-2">
                      <div className="bg-gray-800 text-white font-bold px-2 py-1">SPOUSE DETAILS</div>
                      <table className="w-full border text-xs">
                        <tbody>
                          <tr className="border">
                            <td className="border px-1">LAST NAME</td>
                            <td className="border px-1">{previewApp.spouseDetails.lastName}</td>
                            <td className="border px-1">FIRST NAME</td>
                            <td className="border px-1">{previewApp.spouseDetails.firstName}</td>
                            <td className="border px-1">MIDDLE NAME</td>
                            <td className="border px-1">{previewApp.spouseDetails.middleName}</td>
                            <td className="border px-1">SUFFIX</td>
                            <td className="border px-1">{previewApp.spouseDetails.suffix}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">MOBILE NUMBER</td>
                            <td className="border px-1">{previewApp.spouseDetails.mobileNumber}</td>
                            <td className="border px-1" colSpan={6}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Personal Reference Table */}
                    <div className="mb-2">
                      <div className="bg-gray-800 text-white font-bold px-2 py-1">PERSONAL REFERENCE</div>
                      <table className="w-full border text-xs">
                        <tbody>
                          <tr className="border">
                            <td className="border px-1">LAST NAME</td>
                            <td className="border px-1">{previewApp.personalReference.lastName}</td>
                            <td className="border px-1">FIRST NAME</td>
                            <td className="border px-1">{previewApp.personalReference.firstName}</td>
                            <td className="border px-1">MIDDLE NAME</td>
                            <td className="border px-1">{previewApp.personalReference.middleName}</td>
                            <td className="border px-1">SUFFIX</td>
                            <td className="border px-1">{previewApp.personalReference.suffix}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">MOBILE NUMBER</td>
                            <td className="border px-1">{previewApp.personalReference.mobileNumber}</td>
                            <td className="border px-1">RELATIONSHIP</td>
                            <td className="border px-1">{previewApp.personalReference.relationship}</td>
                            <td className="border px-1" colSpan={4}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* RIGHT COLUMN */}
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Work/Business Details Table */}
                    <div className="mb-2">
                      <div className="bg-gray-800 text-white font-bold px-2 py-1">WORK/BUSINESS DETAILS</div>
                      <table className="w-full border text-xs">
                        <tbody>
                          <tr className="border">
                            <td className="border px-1">BUSINESS/EMPLOYER'S NAME</td>
                            <td className="border px-1">{previewApp.workDetails.businessEmployerName}</td>
                            <td className="border px-1">PROFESSION/OCCUPATION</td>
                            <td className="border px-1">{previewApp.workDetails.professionOccupation}</td>
                            <td className="border px-1">NATURE OF BUSINESS</td>
                            <td className="border px-1">{previewApp.workDetails.natureOfBusiness}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">DEPARTMENT</td>
                            <td className="border px-1">{previewApp.workDetails.department}</td>
                            <td className="border px-1">LANDLINE/MOBILE NO.</td>
                            <td className="border px-1">{previewApp.workDetails.landlineMobile}</td>
                            <td className="border px-1">YEARS IN BUSINESS</td>
                            <td className="border px-1">{previewApp.workDetails.yearsInBusiness}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">MONTHLY INCOME</td>
                            <td className="border px-1">{previewApp.workDetails.monthlyIncome}</td>
                            <td className="border px-1">ANNUAL INCOME</td>
                            <td className="border px-1">{previewApp.workDetails.annualIncome}</td>
                            <td className="border px-1" colSpan={3}></td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">BUSINESS/OFFICE ADDRESS</td>
                            <td className="border px-1" colSpan={5}>{previewApp.workDetails.address.street}, {previewApp.workDetails.address.barangay}, {previewApp.workDetails.address.city}, {previewApp.workDetails.address.zipCode}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Credit Card Details Table */}
                    <div className="mb-2">
                      <div className="bg-gray-800 text-white font-bold px-2 py-1">CREDIT CARD DETAILS</div>
                      <table className="w-full border text-xs">
                        <tbody>
                          <tr className="border">
                            <td className="border px-1">BANK/INSTITUTION</td>
                            <td className="border px-1">{previewApp.creditCardDetails.bankInstitution}</td>
                            <td className="border px-1">CARD NUMBER</td>
                            <td className="border px-1">{previewApp.creditCardDetails.cardNumber}</td>
                            <td className="border px-1">CREDIT LIMIT</td>
                            <td className="border px-1">{previewApp.creditCardDetails.creditLimit}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">MEMBER SINCE</td>
                            <td className="border px-1">{previewApp.creditCardDetails.memberSince}</td>
                            <td className="border px-1">EXP. DATE</td>
                            <td className="border px-1">{previewApp.creditCardDetails.expirationDate}</td>
                            <td className="border px-1">DELIVER CARD TO</td>
                            <td className="border px-1">{previewApp.creditCardDetails.deliverCardTo === 'home' ? 'Present Home Address' : 'Business Address'}</td>
                          </tr>
                          <tr className="border">
                            <td className="border px-1">BEST TIME TO CONTACT</td>
                            <td className="border px-1">{previewApp.creditCardDetails.bestTimeToContact}</td>
                            <td className="border px-1" colSpan={4}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Bank Preferences */}
                    <div className="mb-2">
                      <div className="bg-gray-800 text-white font-bold px-2 py-1">BANK PREFERENCES</div>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {Object.entries(previewApp.bankPreferences).map(([bank, checked]) => (
                          <div key={bank} className="flex items-center gap-1">
                            <input type="checkbox" checked={checked} readOnly className="accent-blue-600" />
                            <span className="text-xs">{bank.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* ID and E-signature inline at bottom right */}
                    <div className="flex flex-row items-start justify-start min-w-[540px] mt-auto gap-8">
                      <div className="flex flex-col items-center">
                        <div className="font-bold text-xs mb-1">Valid ID</div>
                        {('idPhoto' in previewApp && previewApp.idPhoto) ? (
                          typeof previewApp.idPhoto === 'string' ? (
                            <img src={previewApp.idPhoto} alt="Valid ID" className="w-56 h-40 object-contain border" />
                          ) : (previewApp.idPhoto instanceof File || previewApp.idPhoto instanceof Blob) ? (
                            <img src={URL.createObjectURL(previewApp.idPhoto)} alt="Valid ID" className="w-56 h-40 object-contain border" />
                          ) : (
                            <div className="w-56 h-40 bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">No ID Uploaded</div>
                          )
                        ) : (
                          <div className="w-56 h-40 bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">No ID Uploaded</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="font-bold text-xs mb-1">E-signature</div>
                        {('eSignature' in previewApp && previewApp.eSignature) ? (
                          typeof previewApp.eSignature === 'string' ? (
                            <img src={previewApp.eSignature} alt="E-signature" className="w-56 h-24 object-contain border" />
                          ) : (previewApp.eSignature instanceof File || previewApp.eSignature instanceof Blob) ? (
                            <img src={URL.createObjectURL(previewApp.eSignature)} alt="E-signature" className="w-56 h-24 object-contain border" />
                          ) : (
                            <div className="w-56 h-24 bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">No Signature Uploaded</div>
                          )
                        ) : (
                          <div className="w-56 h-24 bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">No Signature Uploaded</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;