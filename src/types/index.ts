export interface User {
  id: string;
  email: string;
  role: 'admin' | 'agent';
  name: string;
  createdAt: Date;
}

export interface PersonalDetails {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  mobileNumber: string;
  homeNumber: string;
  emailAddress: string;
  sssGsisUmid: string;
  tin: string;
}

export interface MotherDetails {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
}

export interface Address {
  street: string;
  barangay: string;
  city: string;
  zipCode: string;
  yearsOfStay?: string;
  unitFloor?: string;
  buildingTower?: string;
  lotNo?: string;
}

export interface SpouseDetails {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  mobileNumber: string;
}

export interface PersonalReference {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  mobileNumber: string;
  relationship: string;
}

export interface WorkDetails {
  businessEmployerName: string;
  professionOccupation: string;
  natureOfBusiness: string;
  department: string;
  landlineMobile: string;
  yearsInBusiness: string;
  monthlyIncome: string;
  annualIncome: string;
  address: Address;
}

export interface CreditCardDetails {
  bankInstitution: string;
  cardNumber: string;
  creditLimit: string;
  memberSince: string;
  expirationDate: string;
  deliverCardTo: 'home' | 'business';
  bestTimeToContact: string;
}

export interface BankPreferences {
  rcbc: boolean;
  metrobank: boolean;
  eastWestBank: boolean;
  securityBank: boolean;
  bpi: boolean;
  pnb: boolean;
  robinsonBank: boolean;
  maybank: boolean;
  aub: boolean;
}

export interface Application {
  id: string;
  personalDetails: PersonalDetails;
  motherDetails: MotherDetails;
  permanentAddress: Address;
  spouseDetails: SpouseDetails;
  personalReference: PersonalReference;
  workDetails: WorkDetails;
  creditCardDetails: CreditCardDetails;
  bankPreferences: BankPreferences;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  submittedBy?: string; // For agent submissions
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  location?: string;
  agent?: string;
  remarks?: string;
  bankApplied?: string;
}