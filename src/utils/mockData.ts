// Mock data for testing the application

export const MOCK_APPLICATIONS = [
  {
    id: 'app-1',
    personal_details: {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      suffix: 'Jr',
      dateOfBirth: '1990-05-15',
      placeOfBirth: 'Manila, Philippines',
      gender: 'Male',
      civilStatus: 'Single',
      nationality: 'Filipino',
      mobileNumber: '+63 912 345 6789',
      homeNumber: '+63 2 8123 4567',
      emailAddress: 'john.doe@email.com',
      sssGsisUmid: '1234567890',
      tin: '123-456-789-000',
    },
    mother_details: {
      firstName: 'Maria',
      lastName: 'Santos',
      middleName: 'Garcia',
      suffix: '',
    },
    permanent_address: {
      street: '123 Main Street',
      barangay: 'Barangay 1',
      city: 'Makati City',
      zipCode: '1200',
      yearsOfStay: '5',
    },
    spouse_details: {
      firstName: '',
      lastName: '',
      middleName: '',
      suffix: '',
      mobileNumber: '',
    },
    personal_reference: {
      firstName: 'Robert',
      lastName: 'Smith',
      middleName: 'Johnson',
      suffix: '',
      mobileNumber: '+63 923 456 7890',
      relationship: 'Friend',
    },
    work_details: {
      businessEmployerName: 'Tech Solutions Inc.',
      professionOccupation: 'Software Engineer',
      natureOfBusiness: 'Information Technology',
      department: 'Engineering',
      landlineMobile: '+63 2 8123 4567',
      yearsInBusiness: '3',
      monthlyIncome: '75000',
      annualIncome: '900000',
      address: {
        street: '456 Business Ave',
        barangay: 'Barangay 2',
        city: 'Taguig City',
        zipCode: '1630',
      },
    },
    credit_card_details: {
      bankInstitution: 'BPI',
      cardNumber: '4111-1111-1111-1111',
      creditLimit: '500000',
      memberSince: '2020-01-15',
      expirationDate: '2025-12-31',
      deliverCardTo: 'home',
      bestTimeToContact: '9:00 AM - 6:00 PM',
    },
    bank_preferences: {
      rcbc: true,
      metrobank: false,
      eastWestBank: true,
      bpi: true,
      pnb: false,
      robinsonBank: false,
      maybank: false,
      aub: false,
    },
    status: 'pending',
    submitted_by: 'agent@silvercard.com',
    submitted_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'app-2',
    personal_details: {
      firstName: 'Jane',
      lastName: 'Smith',
      middleName: 'Elizabeth',
      suffix: '',
      dateOfBirth: '1985-08-22',
      placeOfBirth: 'Quezon City, Philippines',
      gender: 'Female',
      civilStatus: 'Married',
      nationality: 'Filipino',
      mobileNumber: '+63 934 567 8901',
      homeNumber: '+63 2 8234 5678',
      emailAddress: 'jane.smith@email.com',
      sssGsisUmid: '0987654321',
      tin: '987-654-321-000',
    },
    mother_details: {
      firstName: 'Ana',
      lastName: 'Cruz',
      middleName: 'Reyes',
      suffix: '',
    },
    permanent_address: {
      street: '789 Oak Street',
      barangay: 'Barangay 3',
      city: 'Quezon City',
      zipCode: '1100',
      yearsOfStay: '8',
    },
    spouse_details: {
      firstName: 'Michael',
      lastName: 'Smith',
      middleName: 'David',
      suffix: '',
      mobileNumber: '+63 945 678 9012',
    },
    personal_reference: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      middleName: 'Williams',
      suffix: '',
      mobileNumber: '+63 956 789 0123',
      relationship: 'Sister',
    },
    work_details: {
      businessEmployerName: 'Global Marketing Corp.',
      professionOccupation: 'Marketing Manager',
      natureOfBusiness: 'Marketing and Advertising',
      department: 'Marketing',
      landlineMobile: '+63 2 8234 5678',
      yearsInBusiness: '6',
      monthlyIncome: '85000',
      annualIncome: '1020000',
      address: {
        street: '321 Corporate Plaza',
        barangay: 'Barangay 4',
        city: 'Makati City',
        zipCode: '1200',
      },
    },
    credit_card_details: {
      bankInstitution: 'Metrobank',
      cardNumber: '5555-5555-5555-4444',
      creditLimit: '750000',
      memberSince: '2019-03-10',
      expirationDate: '2026-08-31',
      deliverCardTo: 'business',
      bestTimeToContact: '10:00 AM - 7:00 PM',
    },
    bank_preferences: {
      rcbc: false,
      metrobank: true,
      eastWestBank: false,
      bpi: true,
      pnb: true,
      robinsonBank: false,
      maybank: false,
      aub: false,
    },
    status: 'approved',
    submitted_by: 'agent@silvercard.com',
    submitted_at: '2024-01-10T14:15:00Z',
  },
  {
    id: 'app-3',
    personal_details: {
      firstName: 'Carlos',
      lastName: 'Garcia',
      middleName: 'Manuel',
      suffix: '',
      dateOfBirth: '1992-12-03',
      placeOfBirth: 'Cebu City, Philippines',
      gender: 'Male',
      civilStatus: 'Single',
      nationality: 'Filipino',
      mobileNumber: '+63 967 890 1234',
      homeNumber: '+63 32 2345 6789',
      emailAddress: 'carlos.garcia@email.com',
      sssGsisUmid: '1122334455',
      tin: '111-222-333-444',
    },
    mother_details: {
      firstName: 'Carmen',
      lastName: 'Garcia',
      middleName: 'Lopez',
      suffix: '',
    },
    permanent_address: {
      street: '555 Pine Street',
      barangay: 'Barangay 5',
      city: 'Cebu City',
      zipCode: '6000',
      yearsOfStay: '3',
    },
    spouse_details: {
      firstName: '',
      lastName: '',
      middleName: '',
      suffix: '',
      mobileNumber: '',
    },
    personal_reference: {
      firstName: 'Miguel',
      lastName: 'Santos',
      middleName: 'Cruz',
      suffix: '',
      mobileNumber: '+63 978 901 2345',
      relationship: 'Cousin',
    },
    work_details: {
      businessEmployerName: 'Startup Innovations',
      professionOccupation: 'Product Manager',
      natureOfBusiness: 'Technology Startup',
      department: 'Product',
      landlineMobile: '+63 32 2345 6789',
      yearsInBusiness: '2',
      monthlyIncome: '65000',
      annualIncome: '780000',
      address: {
        street: '777 Tech Hub',
        barangay: 'Barangay 6',
        city: 'Cebu City',
        zipCode: '6000',
      },
    },
    credit_card_details: {
      bankInstitution: 'RCBC',
      cardNumber: '4000-0000-0000-0002',
      creditLimit: '300000',
      memberSince: '2021-06-20',
      expirationDate: '2025-06-30',
      deliverCardTo: 'home',
      bestTimeToContact: '2:00 PM - 10:00 PM',
    },
    bank_preferences: {
      rcbc: true,
      metrobank: false,
      eastWestBank: false,
      bpi: false,
      pnb: false,
      robinsonBank: true,
      maybank: false,
      aub: false,
    },
    status: 'submitted',
    submitted_by: 'agent@silvercard.com',
    submitted_at: '2024-01-20T09:45:00Z',
  },
];

export const MOCK_USERS = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@silvercard.com',
    role: 'admin',
    bank_codes: [],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'agent-1',
    name: 'Agent User',
    email: 'agent@silvercard.com',
    role: 'agent',
    bank_codes: [
      { bank: 'rcbc', code: 'RC001' },
      { bank: 'metrobank', code: 'MB002' },
      { bank: 'bpi', code: 'BP003' },
    ],
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Helper function to initialize mock data in localStorage
export const initializeMockData = () => {
  if (!localStorage.getItem('mockApplications')) {
    localStorage.setItem('mockApplications', JSON.stringify(MOCK_APPLICATIONS));
  }
  if (!localStorage.getItem('mockUsers')) {
    localStorage.setItem('mockUsers', JSON.stringify(MOCK_USERS));
  }
};

// Helper function to get mock applications
export const getMockApplications = () => {
  const stored = localStorage.getItem('mockApplications');
  return stored ? JSON.parse(stored) : MOCK_APPLICATIONS;
};

// Helper function to get mock users
export const getMockUsers = () => {
  const stored = localStorage.getItem('mockUsers');
  return stored ? JSON.parse(stored) : MOCK_USERS;
};

// Helper function to save mock applications
export const saveMockApplications = (applications: any[]) => {
  localStorage.setItem('mockApplications', JSON.stringify(applications));
};

// Helper function to save mock users
export const saveMockUsers = (users: any[]) => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
}; 