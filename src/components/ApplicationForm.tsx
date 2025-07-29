import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Toast from './Toast';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import {
  PersonalDetails,
  MotherDetails,
  Address,
  SpouseDetails,
  PersonalReference,
  WorkDetails,
  CreditCardDetails,
} from '../types';

// Philippine location data - Simplified structure for cascading dropdowns
const PHILIPPINE_REGIONS = [
  'National Capital Region (NCR)',
  'Region I - Ilocos Region',
  'Region II - Cagayan Valley',
  'Region III - Central Luzon',
  'Region IV-A - Calabarzon',
  'Region IV-B - Mimaropa',
  'Region V - Bicol Region',
  'Region VI - Western Visayas',
  'Region VII - Central Visayas',
  'Region VIII - Eastern Visayas',
  'Region IX - Zamboanga Peninsula',
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region XII - Soccsksargen',
  'Region XIII - Caraga',
  'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)'
];

const PHILIPPINE_PROVINCES = {
  'National Capital Region (NCR)': ['Metro Manila'],
  'Region I - Ilocos Region': ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'],
  'Region II - Cagayan Valley': ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
  'Region III - Central Luzon': ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'],
  'Region IV-A - Calabarzon': ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'],
  'Region IV-B - Mimaropa': ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'],
  'Region V - Bicol Region': ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'],
  'Region VI - Western Visayas': ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental', 'Negros Oriental'],
  'Region VII - Central Visayas': ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor'],
  'Region VIII - Eastern Visayas': ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'],
  'Region IX - Zamboanga Peninsula': ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
  'Region X - Northern Mindanao': ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'],
  'Region XI - Davao Region': ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'],
  'Region XII - Soccsksargen': ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'],
  'Region XIII - Caraga': ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'],
  'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)': ['Basilan', 'Lanao del Sur', 'Maguindanao', 'Sulu', 'Tawi-Tawi']
};

// Sample cities for some provinces (you can expand this)
const PHILIPPINE_CITIES = {
  'Metro Manila': ['Manila', 'Quezon City', 'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'San Juan', 'Taguig', 'Valenzuela', 'Pateros'],
  'Pampanga': ['Angeles', 'Apalit', 'Arayat', 'Bacolor', 'Candaba', 'Floridablanca', 'Guagua', 'Lubao', 'Mabalacat', 'Macabebe', 'Magalang', 'Masantol', 'Mexico', 'Minalin', 'Porac', 'San Fernando', 'San Luis', 'San Simon', 'Santa Ana', 'Santa Rita', 'Santo Tomas', 'Sasmuan'],
  'Bulacan': ['Angat', 'Balagtas', 'Baliuag', 'Bocaue', 'Bulakan', 'Bustos', 'Calumpit', 'Doña Remedios Trinidad', 'Guiguinto', 'Hagonoy', 'Malolos', 'Marilao', 'Meycauayan', 'Norzagaray', 'Obando', 'Pandi', 'Paombong', 'Plaridel', 'Pulilan', 'San Ildefonso', 'San Jose del Monte', 'San Miguel', 'San Rafael', 'San Simon', 'Santa Maria'],
  'Cebu': ['Alcantara', 'Alcoy', 'Alegria', 'Aloguinsan', 'Argao', 'Asturias', 'Badian', 'Balamban', 'Bantayan', 'Barili', 'Bogo', 'Boljoon', 'Borbon', 'Carcar', 'Carmen', 'Catmon', 'Cebu', 'Compostela', 'Consolacion', 'Cordova', 'Daanbantayan', 'Dalaguete', 'Danao', 'Dumanjug', 'Ginatilan', 'Lapu-Lapu', 'Liloan', 'Madridejos', 'Malabuyoc', 'Mandaue', 'Medellin', 'Minglanilla', 'Moalboal', 'Naga', 'Oslob', 'Pilar', 'Pinamungajan', 'Poro', 'Ronda', 'Samboan', 'San Fernando', 'San Francisco', 'San Remigio', 'Santa Fe', 'Santander', 'Sibonga', 'Sogod', 'Tabogon', 'Tabuelan', 'Talisay', 'Toledo', 'Tuburan', 'Tudela']
};

// Sample barangays for some cities (you can expand this)
const PHILIPPINE_BARANGAYS = {
  'Manila': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10'],
  'Quezon City': ['Alicia', 'Bagong Silangan', 'Batasan Hills', 'Commonwealth', 'Culiat', 'E. Rodriguez', 'Holy Spirit', 'Immaculate Concepcion', 'Kamuning', 'Katipunan'],
  'Cebu': ['Adlaon', 'Agsungot', 'Apas', 'Babag', 'Bacayan', 'Banilad', 'Basak Pardo', 'Basak San Nicolas', 'Binaliw', 'Bonbon', 'Budlaan', 'Buhisan', 'Bulacao', 'Buot-Taup', 'Calamba', 'Cambinocot', 'Capitol Site', 'Carreta', 'Central', 'Cogon Pardo', 'Cogon Ramos', 'Day-as', 'Ermita', 'Guadalupe', 'Guba', 'Hipodromo', 'Inayawan', 'Kalubihan', 'Kamagayan', 'Kamputhaw', 'Kasambagan', 'Kinasang-an Pardo', 'Labangon', 'Lahug', 'Lorega San Miguel', 'Lusaran', 'Luz', 'Mabini', 'Mabolo', 'Malubog', 'Mambaling', 'Pahina Central', 'Pahina San Nicolas', 'Pamutan', 'Parian', 'Paril', 'Pasil', 'Pit-os', 'Poblacion Pardo', 'Pulangbato', 'Pung-ol-Sibugay', 'Punta Princesa', 'Quiot Pardo', 'Sambag I', 'Sambag II', 'San Antonio', 'San Jose', 'San Nicolas Central', 'San Roque', 'Santa Cruz', 'Santo Niño', 'Sapangdaku', 'Sawang Calero', 'Sinsin', 'Sirao', 'Suba San Nicolas', 'Sudlon I', 'Sudlon II', 'T. Padilla', 'Tabunan', 'Tagbao', 'Talamban', 'Taptap', 'Tejero', 'Tinago', 'Tisa', 'To-ong Pardo', 'Zapatera'],
  'San Fernando': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25', 'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30', 'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35'],
  'Angeles': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25', 'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30', 'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35'],
  'Malolos': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25', 'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30', 'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35'],
  'Marilao': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25', 'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30', 'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35'],
  'Meycauayan': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25', 'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30', 'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35'],
  'San Jose del Monte': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25', 'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30', 'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35']
};

// Banking preferences
const bankTypes = [
  'rcbc', 'metrobank', 'eastWestBank', 'bpi', 'pnb', 'robinsonBank', 'maybank', 'aub',
] as const;

// Bank names for display
const bankNames: Record<string, string> = {
  rcbc: 'RCBC', metrobank: 'Metrobank', eastWestBank: 'EastWestBank', bpi: 'BPI',
  pnb: 'PNB', robinsonBank: 'Robinson Bank', maybank: 'Maybank', aub: 'AUB',
};

interface BankPreferences {
  rcbc: boolean;
  metrobank: boolean;
  eastWestBank: boolean;
  bpi: boolean;
  pnb: boolean;
  robinsonBank: boolean;
  maybank: boolean;
  aub: boolean;
  [key: string]: boolean;
}

type FormDataType = {
  personalDetails: PersonalDetails;
  motherDetails: MotherDetails;
  permanentAddress: Address;
  spouseDetails: SpouseDetails;
  personalReference: PersonalReference;
  workDetails: WorkDetails;
  creditCardDetails: CreditCardDetails;
  bankPreferences: BankPreferences;
  [key: string]: any;
};

const LOCAL_STORAGE_KEY = 'applicationFormData';

const ApplicationForm = ({ isAgentForm = false }) => {
  const navigate = useNavigate();
  const { user } = isAgentForm ? useAuth() : { user: null };
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
      }
    }
    return {
      personalDetails: { lastName: '', firstName: '', middleName: '', suffix: '', dateOfBirth: '', placeOfBirth: '', gender: '', civilStatus: '', nationality: '', mobileNumber: '', homeNumber: '', emailAddress: '', sssGsisUmid: '', tin: '' },
      motherDetails: { lastName: '', firstName: '', middleName: '', suffix: '' },
      permanentAddress: { street: '', barangay: '', city: '', zipCode: '', yearsOfStay: '' },
      spouseDetails: { lastName: '', firstName: '', middleName: '', suffix: '', mobileNumber: '' },
      personalReference: { lastName: '', firstName: '', middleName: '', suffix: '', mobileNumber: '', relationship: '' },
      workDetails: { businessEmployerName: '', professionOccupation: '', natureOfBusiness: '', department: '', landlineMobile: '', yearsInBusiness: '', monthlyIncome: '', annualIncome: '', address: { street: '', barangay: '', city: '', zipCode: '', unitFloor: '', buildingTower: '', lotNo: '' } },
      creditCardDetails: { bankInstitution: '', cardNumber: '', creditLimit: '', memberSince: '', expirationDate: '', deliverCardTo: 'home', bestTimeToContact: '' },
      bankPreferences: { rcbc: false, metrobank: false, eastWestBank: false, bpi: false, pnb: false, robinsonBank: false, maybank: false, aub: false },
    };
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | undefined }>({ show: false, message: '', type: undefined });
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [eSignature, setESignature] = useState<File | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState<'region' | 'province' | 'city'>('region');
  const { setLoading } = useLoading();

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);



  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [subsection]: { ...prev[section][subsection], [field]: value } },
    }));
  };

  const handleLocationChange = (value: string) => {
    if (currentLevel === 'region') {
      setSelectedRegion(value);
      setCurrentLevel('province');
      setFormData(prev => ({
        ...prev,
        personalDetails: { ...prev.personalDetails, placeOfBirth: '' }
      }));
    } else if (currentLevel === 'province') {
      setSelectedProvince(value);
      setCurrentLevel('city');
      setFormData(prev => ({
        ...prev,
        personalDetails: { ...prev.personalDetails, placeOfBirth: '' }
      }));
    } else if (currentLevel === 'city') {
      setSelectedCity(value);
      const fullPlaceOfBirth = `${value}, ${selectedProvince}, ${selectedRegion}`;
      setFormData(prev => ({
        ...prev,
        personalDetails: { ...prev.personalDetails, placeOfBirth: fullPlaceOfBirth }
      }));
    }
  };

  const getCurrentOptions = () => {
    if (currentLevel === 'region') {
      return PHILIPPINE_REGIONS;
    } else if (currentLevel === 'province') {
      return PHILIPPINE_PROVINCES[selectedRegion] || [];
    } else if (currentLevel === 'city') {
      return PHILIPPINE_CITIES[selectedProvince] || [];
    }
    return [];
  };

  const getCurrentLabel = () => {
    if (currentLevel === 'region') {
      return 'Select Region';
    } else if (currentLevel === 'province') {
      return `Select Province in ${selectedRegion}`;
    } else if (currentLevel === 'city') {
      return `Select City/Municipality in ${selectedProvince}`;
    }
    return 'Select';
  };

  const getAllLocations = () => {
    const results: string[] = [];
    
    // Add regions
    PHILIPPINE_REGIONS.forEach(region => {
      results.push(region);
    });
    
    // Add provinces with their regions
    Object.entries(PHILIPPINE_PROVINCES).forEach(([region, provinces]) => {
      provinces.forEach(province => {
        results.push(`${province}, ${region}`);
      });
    });
    
    // Add cities with their provinces and regions
    Object.entries(PHILIPPINE_CITIES).forEach(([province, cities]) => {
      // Find which region this province belongs to
      const region = Object.entries(PHILIPPINE_PROVINCES).find(([r, provinces]) => 
        provinces.includes(province)
      )?.[0];
      
      cities.forEach(city => {
        if (region) {
          results.push(`${city}, ${province}, ${region}`);
        }
      });
    });
    
    // Add barangays with their cities, provinces, and regions
    Object.entries(PHILIPPINE_BARANGAYS).forEach(([city, barangays]) => {
      // Find which province this city belongs to
      const province = Object.entries(PHILIPPINE_CITIES).find(([p, cities]) => 
        cities.includes(city)
      )?.[0];
      
      if (province) {
        // Find which region this province belongs to
        const region = Object.entries(PHILIPPINE_PROVINCES).find(([r, provinces]) => 
          provinces.includes(province)
        )?.[0];
        
        barangays.forEach(barangay => {
          if (region) {
            results.push(`${barangay}, ${city}, ${province}, ${region}`);
          }
        });
      }
    });
    
    return results.sort();
  };

  const uploadWithRetry = async (file: File, pathPrefix: string) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Uploading ${file.name} (Attempt ${attempt})`);
      const filePath = `${pathPrefix}/${file.name}_${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('application-documents')
        .upload(filePath, file, {
          upsert: false,
        });
      if (!error) {
        console.log(`${file.name} uploaded successfully:`, data.path);
        const { data: publicUrlData } = supabase.storage
          .from('application-documents')
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
      console.error(`${file.name} Upload Error (Attempt ${attempt}):`, error);
      if (attempt === 3) return null;
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep !== 5) return;
    setLoading(true);
    const missing = validateStep();
    if (missing.length > 0) {
      setToast({ show: true, message: 'Fill all the requirements', type: 'error' as const });
      setLoading(false);
      return;
    }

    // Backend validation for mobile number
    const pd = formData.personalDetails;
    if (!/^\d{11}$/.test(pd.mobileNumber)) {
      setToast({ show: true, message: 'Mobile Number must be exactly 11 digits', type: 'error' });
      return;
    }

    let idPhotoUrl = null;
    let eSignatureUrl = null;
    if (idPhoto) {
      idPhotoUrl = await uploadWithRetry(idPhoto, 'id_photos');
      if (!idPhotoUrl) {
        setToast({ show: true, message: 'Failed to upload ID photo after retries', type: 'error' as const });
        setLoading(false);
        return;
      }
    }
    if (eSignature) {
      eSignatureUrl = await uploadWithRetry(eSignature, 'e_signatures');
      if (!eSignatureUrl) {
        setToast({ show: true, message: 'Failed to upload e-signature after retries', type: 'error' as const });
        setLoading(false);
        return;
      }
    }

    const insertData = {
      last_name: formData.personalDetails.lastName,
      first_name: formData.personalDetails.firstName,
      middle_name: formData.personalDetails.middleName,
      suffix: formData.personalDetails.suffix,
      date_of_birth: formData.personalDetails.dateOfBirth,
      place_of_birth: formData.personalDetails.placeOfBirth,
      gender: formData.personalDetails.gender,
      civil_status: formData.personalDetails.civilStatus,
      nationality: formData.personalDetails.nationality,
      mobile_number: formData.personalDetails.mobileNumber,
      email_address: formData.personalDetails.emailAddress,
      home_number: formData.personalDetails.homeNumber,
      "sss/gsis/umid": formData.personalDetails.sssGsisUmid,
      tin: formData.personalDetails.tin,
      relative_name: formData.motherDetails.lastName ? `${formData.motherDetails.lastName}, ${formData.motherDetails.firstName} ${formData.motherDetails.middleName} ${formData.motherDetails.suffix}`.trim() : null,
      address: formData.permanentAddress.street ? `${formData.permanentAddress.street}, ${formData.permanentAddress.barangay}, ${formData.permanentAddress.city}, ${formData.permanentAddress.zipCode}`.trim() : null,
      years_of_stay: formData.permanentAddress.yearsOfStay ? Number(formData.permanentAddress.yearsOfStay) : null,
      relative2_name: formData.spouseDetails.lastName ? `${formData.spouseDetails.lastName}, ${formData.spouseDetails.firstName} ${formData.spouseDetails.middleName} ${formData.spouseDetails.suffix}`.trim() : null,
      business: formData.workDetails.businessEmployerName,
      profession: formData.workDetails.professionOccupation,
      nature_of_business: formData.workDetails.natureOfBusiness,
      department: formData.workDetails.department,
      contact_number: formData.workDetails.landlineMobile,
      years_in_business: formData.workDetails.yearsInBusiness ? Number(formData.workDetails.yearsInBusiness) : null,
      monthly_income: formData.workDetails.monthlyIncome ? Number(formData.workDetails.monthlyIncome) : null,
      annual_income: formData.workDetails.annualIncome ? Number(formData.workDetails.annualIncome) : null,
      business_address: formData.workDetails.address.street ? `${formData.workDetails.address.street}, ${formData.workDetails.address.barangay}, ${formData.workDetails.address.city}, ${formData.workDetails.address.zipCode}, ${formData.workDetails.address.unitFloor}, ${formData.workDetails.address.buildingTower}, ${formData.workDetails.address.lotNo}`.trim() : null,
      bank_institution: formData.creditCardDetails.bankInstitution,
      card_number: formData.creditCardDetails.cardNumber,
      credit_limit: formData.creditCardDetails.creditLimit ? Number(formData.creditCardDetails.creditLimit) : null,
      member_since: formData.creditCardDetails.memberSince,
      expiry_date: formData.creditCardDetails.expirationDate,
      deliver_card_to: formData.creditCardDetails.deliverCardTo,
      best_time_to_contact: formData.creditCardDetails.bestTimeToContact,
      location: '',
      agent: isAgentForm && user ? user.name : 'direct',
      relative3_name: formData.personalReference.lastName ? `${formData.personalReference.lastName}, ${formData.personalReference.firstName} ${formData.personalReference.middleName} ${formData.personalReference.suffix} (${formData.personalReference.relationship}) ${formData.personalReference.mobileNumber}`.trim() : null,
      remarks: '',
      bank_applied: Object.keys(formData.bankPreferences).filter(k => formData.bankPreferences[k as keyof BankPreferences]).join(', '),
      id_photo_url: idPhotoUrl,
      e_signature_url: eSignatureUrl,
    };
    console.log('Inserting data into kyc_details table:', JSON.stringify(insertData, null, 2));
  
    const { error, data } = await supabase.from('kyc_details').insert(insertData);
    if (error) {
      console.error('Application Insert Error:', {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint,
      });
      setToast({ show: true, message: `Error submitting application: ${error.message}`, type: 'error' as const });
      setLoading(false);
      return;
    }

    console.log('Application inserted successfully:', data);
    setToast({ show: true, message: 'Application submitted successfully', type: 'success' as const });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setTimeout(() => {
      setLoading(false);
      if (isAgentForm) {
        navigate('/agent/applications');
      } else {
        navigate('/application-success');
      }
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && currentStep !== 5) {
      e.preventDefault();
      setCurrentStep(s => Math.min(5, s + 1));
    }
  };

  const validateStep = () => {
    const missing = [];
    if (currentStep === 1) {
      const pd = formData.personalDetails;
      if (!pd.lastName) missing.push('Last Name');
      if (!pd.firstName) missing.push('First Name');
      if (!pd.dateOfBirth) missing.push('Date of Birth');
      if (!formData.personalDetails.placeOfBirth) missing.push('Place of Birth');
      if (!pd.gender) missing.push('Gender');
      if (!pd.civilStatus) missing.push('Civil Status');
      if (!pd.nationality) missing.push('Nationality');
      if (!pd.mobileNumber) missing.push('Mobile Number');
      else if (!/^\d{11}$/.test(pd.mobileNumber)) missing.push('Mobile Number must be exactly 11 digits');
      if (!pd.emailAddress) missing.push('Email Address');
      if (!pd.sssGsisUmid) missing.push('SSS/GSIS/UMID');
      if (!pd.tin) missing.push('TIN');
    } else if (currentStep === 2) {
      const md = formData.motherDetails;
      if (!md.lastName) missing.push('Mother Last Name');
      if (!md.firstName) missing.push('Mother First Name');
      if (!md.middleName) missing.push('Mother Middle Name');
      const pa = formData.permanentAddress;
      if (!pa.street) missing.push('Street');
      if (!pa.barangay) missing.push('Barangay');
      if (!pa.city) missing.push('City');
      if (!pa.zipCode) missing.push('Zip Code');
      if (!pa.yearsOfStay) missing.push('Years of Stay');
      const sp = formData.spouseDetails;
      if (sp.lastName || sp.firstName || sp.middleName) {
        if (!sp.lastName) missing.push('Spouse Last Name');
        if (!sp.firstName) missing.push('Spouse First Name');
        if (!sp.middleName) missing.push('Spouse Middle Name');
        // Spouse mobile number is not required
      }
      // Personal reference fields are not required
    } else if (currentStep === 3) {
      const wd = formData.workDetails;
      if (!wd.businessEmployerName) missing.push('Business/Employer Name');
      if (!wd.professionOccupation) missing.push('Profession/Occupation');
      if (!wd.natureOfBusiness) missing.push('Nature of Business');
      if (!wd.department) missing.push('Department');
      if (!wd.landlineMobile) missing.push('Landline/Mobile');
      if (!wd.yearsInBusiness) missing.push('Years in Business');
      if (!wd.monthlyIncome) missing.push('Monthly Income');
      if (!wd.annualIncome) missing.push('Annual Income');
      const wa = wd.address;
      if (!wa.street) missing.push('Work Street');
      if (!wa.barangay) missing.push('Work Barangay');
      if (!wa.city) missing.push('Work City');
      if (!wa.zipCode) missing.push('Work Zip Code');
      if (!wa.unitFloor) missing.push('Unit/Floor');
      if (!wa.buildingTower) missing.push('Building/Tower');
      if (!wa.lotNo) missing.push('Lot No.');
    } else if (currentStep === 4) {
      const cd = formData.creditCardDetails;
      if (!cd.bankInstitution) missing.push('Bank/Institution');
      if (!cd.cardNumber) missing.push('Card Number');
      if (!cd.creditLimit) missing.push('Credit Limit');
      if (!cd.memberSince) missing.push('Member Since');
      if (!cd.expirationDate) missing.push('Expiration Date');
      if (!cd.deliverCardTo) missing.push('Deliver Card To');
      if (!cd.bestTimeToContact) missing.push('Best Time to Contact');
      const bp = formData.bankPreferences;
      const anyBank = Object.values(bp).some(Boolean);
      if (!anyBank) missing.push('At least one Bank Preference');
    } else if (currentStep === 5) {
      if (!idPhoto) missing.push('ID Photo');
      if (!eSignature) missing.push('E-Signature');
    }
    return missing;
  };

  const steps = [
    { title: 'Personal Details', number: 1 },
    { title: 'Address & Family', number: 2 },
    { title: 'Work Details', number: 3 },
    { title: 'Credit & Preferences', number: 4 },
    { title: 'Upload Documents', number: 5 },
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex w-full justify-between items-center gap-2 md:gap-4 px-1 overflow-x-auto whitespace-nowrap">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                  currentStep >= step.number ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              <span className={`mt-1 text-xs md:text-base font-medium whitespace-nowrap truncate hidden md:block ${
                currentStep >= step.number ? 'text-blue-700' : 'text-gray-500'
              }`} style={{ maxWidth: '6rem' }}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && <div className="flex-shrink-0 w-6 md:w-12 h-0.5 bg-gray-200 mx-1 md:mx-2 self-center" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-700 mb-6">Personal Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label><input type="text" value={formData.personalDetails.lastName} onChange={(e) => handleInputChange('personalDetails', 'lastName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label><input type="text" value={formData.personalDetails.firstName} onChange={(e) => handleInputChange('personalDetails', 'firstName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label><input type="text" value={formData.personalDetails.middleName} onChange={(e) => handleInputChange('personalDetails', 'middleName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label><input type="text" value={formData.personalDetails.suffix} onChange={(e) => handleInputChange('personalDetails', 'suffix', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth <span className="text-red-500">*</span></label><input type="date" value={formData.personalDetails.dateOfBirth} onChange={(e) => handleInputChange('personalDetails', 'dateOfBirth', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth <span className="text-red-500">*</span></label>
          <select
            value={formData.personalDetails.placeOfBirth || ""}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            required
          >
            <option value="">{formData.personalDetails.placeOfBirth || getCurrentLabel()}</option>
            {!formData.personalDetails.placeOfBirth && getCurrentOptions().map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label><select value={formData.personalDetails.gender} onChange={(e) => handleInputChange('personalDetails', 'gender', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Civil Status <span className="text-red-500">*</span></label><select value={formData.personalDetails.civilStatus} onChange={(e) => handleInputChange('personalDetails', 'civilStatus', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required><option value="">Select Status</option><option value="Single">Single</option><option value="Married">Married</option><option value="Separated">Separated</option><option value="Divorced">Divorced</option><option value="Widowed">Widowed</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Nationality <span className="text-red-500">*</span></label><input type="text" value={formData.personalDetails.nationality} onChange={(e) => handleInputChange('personalDetails', 'nationality', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number <span className="text-red-500">*</span></label><input type="tel" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} value={formData.personalDetails.mobileNumber} onInput={e => { const input = e.target as HTMLInputElement; input.value = input.value.replace(/\D/g, '').slice(0, 11); }} onChange={(e) => handleInputChange('personalDetails', 'mobileNumber', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Home Number</label><input type="tel" inputMode="numeric" pattern="[0-9]*" value={formData.personalDetails.homeNumber} onInput={e => { const input = e.target as HTMLInputElement; input.value = input.value.replace(/\D/g, ''); }} onChange={(e) => handleInputChange('personalDetails', 'homeNumber', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label><input type="email" value={formData.personalDetails.emailAddress} onChange={(e) => handleInputChange('personalDetails', 'emailAddress', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">SSS/GSIS/UMID <span className="text-red-500">*</span></label><input type="text" value={formData.personalDetails.sssGsisUmid} onChange={(e) => handleInputChange('personalDetails', 'sssGsisUmid', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">TIN <span className="text-red-500">*</span></label><input type="text" value={formData.personalDetails.tin} onChange={(e) => handleInputChange('personalDetails', 'tin', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
      </div>
      <div><h3 className="text-xl font-semibold text-gray-700 mb-4">Mother's Maiden Name</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label><input type="text" value={formData.motherDetails.lastName} onChange={(e) => handleInputChange('motherDetails', 'lastName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label><input type="text" value={formData.motherDetails.firstName} onChange={(e) => handleInputChange('motherDetails', 'firstName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Middle Name <span className="text-red-500">*</span></label><input type="text" value={formData.motherDetails.middleName} onChange={(e) => handleInputChange('motherDetails', 'middleName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label><input type="text" value={formData.motherDetails.suffix} onChange={(e) => handleInputChange('motherDetails', 'suffix', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div></div></div>
      <div><h3 className="text-xl font-semibold text-gray-700 mb-4">Spouse Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label><input type="text" value={formData.spouseDetails.lastName} onChange={(e) => handleInputChange('spouseDetails', 'lastName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">First Name</label><input type="text" value={formData.spouseDetails.firstName} onChange={(e) => handleInputChange('spouseDetails', 'firstName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label><input type="text" value={formData.spouseDetails.middleName} onChange={(e) => handleInputChange('spouseDetails', 'middleName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label><input type="text" value={formData.spouseDetails.suffix} onChange={(e) => handleInputChange('spouseDetails', 'suffix', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label><input type="tel" inputMode="numeric" pattern="[0-9]*" value={formData.spouseDetails.mobileNumber} onInput={e => { const input = e.target as HTMLInputElement; input.value = input.value.replace(/\D/g, ''); }} onChange={(e) => handleInputChange('spouseDetails', 'mobileNumber', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div></div></div>
      <div><h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Reference</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label><input type="text" value={formData.personalReference.lastName} onChange={(e) => handleInputChange('personalReference', 'lastName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">First Name</label><input type="text" value={formData.personalReference.firstName} onChange={(e) => handleInputChange('personalReference', 'firstName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label><input type="text" value={formData.personalReference.middleName} onChange={(e) => handleInputChange('personalReference', 'middleName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label><input type="text" value={formData.personalReference.suffix} onChange={(e) => handleInputChange('personalReference', 'suffix', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label><input type="tel" inputMode="numeric" pattern="[0-9]*" value={formData.personalReference.mobileNumber} onInput={e => { const input = e.target as HTMLInputElement; input.value = input.value.replace(/\D/g, ''); }} onChange={(e) => handleInputChange('personalReference', 'mobileNumber', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label><input type="text" value={formData.personalReference.relationship} onChange={(e) => handleInputChange('personalReference', 'relationship', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" /></div></div></div>
    </div>
  );

  const renderAddressAndFamily = () => (
    <div className="space-y-8">
      <div><h3 className="text-2xl font-semibold text-gray-700 mb-6">Permanent Home Address</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Street/Purok/Subdivision <span className="text-red-500">*</span></label><input type="text" value={formData.permanentAddress.street} onChange={(e) => handleInputChange('permanentAddress', 'street', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Barangay <span className="text-red-500">*</span></label><input type="text" value={formData.permanentAddress.barangay} onChange={(e) => handleInputChange('permanentAddress', 'barangay', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label><input type="text" value={formData.permanentAddress.city} onChange={(e) => handleInputChange('permanentAddress', 'city', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Zip Code <span className="text-red-500">*</span></label><input type="text" value={formData.permanentAddress.zipCode} onChange={(e) => handleInputChange('permanentAddress', 'zipCode', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Years of Stay <span className="text-red-500">*</span></label><input type="text" value={formData.permanentAddress.yearsOfStay} onChange={(e) => handleInputChange('permanentAddress', 'yearsOfStay', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div></div></div>
    </div>
  );

  const renderWorkDetails = () => (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold text-gray-700 mb-6">Work/Business Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Business/Employer's Name <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.businessEmployerName} onChange={(e) => handleInputChange('workDetails', 'businessEmployerName', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Profession/Occupation <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.professionOccupation} onChange={(e) => handleInputChange('workDetails', 'professionOccupation', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Nature of Business <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.natureOfBusiness} onChange={(e) => handleInputChange('workDetails', 'natureOfBusiness', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Department (if employed) <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.department} onChange={(e) => handleInputChange('workDetails', 'department', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Landline Number/Mobile No. <span className="text-red-500">*</span></label><input type="tel" inputMode="numeric" pattern="[0-9]*" value={formData.workDetails.landlineMobile} onInput={e => { const input = e.target as HTMLInputElement; input.value = input.value.replace(/\D/g, ''); }} onChange={(e) => handleInputChange('workDetails', 'landlineMobile', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Years in Present Business/Employer <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.yearsInBusiness} onChange={(e) => handleInputChange('workDetails', 'yearsInBusiness', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.monthlyIncome} onChange={(e) => handleInputChange('workDetails', 'monthlyIncome', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Annual Income <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.annualIncome} onChange={(e) => handleInputChange('workDetails', 'annualIncome', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div>
      </div>
      <div><h4 className="text-xl font-semibold text-gray-700 mb-4">Business/Office Address</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Street <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.address.street} onChange={(e) => handleNestedInputChange('workDetails', 'address', 'street', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Barangay <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.address.barangay} onChange={(e) => handleNestedInputChange('workDetails', 'address', 'barangay', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.address.city} onChange={(e) => handleNestedInputChange('workDetails', 'address', 'city', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Zip Code <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.address.zipCode} onChange={(e) => handleNestedInputChange('workDetails', 'address', 'zipCode', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Unit/Floor <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.address.unitFloor} onChange={(e) => handleNestedInputChange('workDetails', 'address', 'unitFloor', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Building/Tower <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.address.buildingTower} onChange={(e) => handleNestedInputChange('workDetails', 'address', 'buildingTower', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Lot No. <span className="text-red-500">*</span></label><input type="text" value={formData.workDetails.address.lotNo} onChange={(e) => handleNestedInputChange('workDetails', 'address', 'lotNo', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div></div></div>
    </div>
  );

  const renderCreditAndPreferences = () => (
    <div className="space-y-8">
      <div><h3 className="text-2xl font-semibold text-gray-700 mb-6">Credit Card Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Bank/Institution <span className="text-red-500">*</span></label><input type="text" value={formData.creditCardDetails.bankInstitution} onChange={(e) => handleInputChange('creditCardDetails', 'bankInstitution', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Card Number <span className="text-red-500">*</span></label><input type="text" value={formData.creditCardDetails.cardNumber} onChange={(e) => handleInputChange('creditCardDetails', 'cardNumber', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit <span className="text-red-500">*</span></label><input type="text" value={formData.creditCardDetails.creditLimit} onChange={(e) => handleInputChange('creditCardDetails', 'creditLimit', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Member Since <span className="text-red-500">*</span></label><input type="date" value={formData.creditCardDetails.memberSince} onChange={(e) => handleInputChange('creditCardDetails', 'memberSince', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Exp. Date <span className="text-red-500">*</span></label><input type="date" value={formData.creditCardDetails.expirationDate} onChange={(e) => handleInputChange('creditCardDetails', 'expirationDate', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Best Time to Contact <span className="text-red-500">*</span></label><input type="text" value={formData.creditCardDetails.bestTimeToContact} onChange={(e) => handleInputChange('creditCardDetails', 'bestTimeToContact', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base" required /></div></div><div className="mt-6"><label className="block text-sm font-medium text-gray-700 mb-3">Deliver Card To</label><div className="space-y-2"><label className="flex items-center"><input type="radio" name="deliverCardTo" value="home" checked={formData.creditCardDetails.deliverCardTo === 'home'} onChange={(e) => handleInputChange('creditCardDetails', 'deliverCardTo', e.target.value)} className="mr-2" />Present Home Address</label><label className="flex items-center"><input type="radio" name="deliverCardTo" value="business" checked={formData.creditCardDetails.deliverCardTo === 'business'} onChange={(e) => handleInputChange('creditCardDetails', 'deliverCardTo', e.target.value)} className="mr-2" />Business Address</label></div></div></div>
      <div><h3 className="text-2xl font-semibold text-gray-700 mb-6">Bank Preferences</h3><p className="text-gray-600 mb-4">Check all banks that apply:</p><div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">{bankTypes.map(key => <label key={key} className="flex items-center p-3 border rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.bankPreferences[key]} onChange={(e) => handleInputChange('bankPreferences', key, e.target.checked ? true : false)} className="mr-3" /><span>{bankNames[key]}</span></label>)}</div></div>
    </div>
  );

  const renderUploadDocuments = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center">Upload Documents</h3>
        <div className="mb-8"><label className="block text-base font-semibold text-gray-700 mb-3">Upload Valid ID Photo <span className="text-red-500">*</span></label><div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors"><svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5m0 0l5 5m-5-5v12" /></svg><input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={e => {const file = e.target.files?.[0]; if (file && (file.size > 25 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type))) {setToast({ show: true, message: 'ID photo must be PNG, JPG, JPEG, or WEBP and less than 25MB', type: 'error' as const }); e.target.value = ''; setIdPhoto(null); return;} setIdPhoto(file || null);}} className="hidden" id="idPhotoUpload" required /><label htmlFor="idPhotoUpload" className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Choose File</label>{idPhoto && <span className="mt-2 text-green-700 text-sm font-medium">{idPhoto.name}</span>}{!idPhoto && <span className="mt-2 text-gray-500 text-xs">PNG, JPG, JPEG, WEBP up to 25MB</span>}</div></div>
        <div className="mb-8"><label className="block text-base font-semibold text-gray-700 mb-3">Upload E-signature Photo <span className="text-red-500">*</span></label><div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors"><svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5m0 0l5 5m-5-5v12" /></svg><input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={e => {const file = e.target.files?.[0]; if (file && (file.size > 25 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type))) {setToast({ show: true, message: 'E-signature photo must be PNG, JPG, JPEG, or WEBP and less than 25MB', type: 'error' as const }); e.target.value = ''; setESignature(null); return;} setESignature(file || null);}} className="hidden" id="eSignatureUpload" required /><label htmlFor="eSignatureUpload" className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Choose File</label>{eSignature && <span className="mt-2 text-green-700 text-sm font-medium">{eSignature.name}</span>}{!eSignature && <span className="mt-2 text-gray-500 text-xs">PNG, JPG, JPEG, WEBP up to 25MB</span>}</div></div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalDetails();
      case 2: return renderAddressAndFamily();
      case 3: return renderWorkDetails();
      case 4: return renderCreditAndPreferences();
      case 5: return renderUploadDocuments();
      default: return renderPersonalDetails();
    }
  };

  const handleNext = () => {
    const missing = validateStep();
    if (missing.length > 0) {
      setToast({ show: true, message: `Please fill in: ${missing.join(', ')}`, type: 'error' });
      return;
    }
    setCurrentStep(s => Math.min(5, s + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative overflow-x-hidden">
      <button type="button" onClick={() => navigate(-1)} className="fixed top-4 left-4 z-30 flex items-center p-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 bg-white shadow" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8"><h1 className="text-3xl font-bold text-gray-700 text-center mb-2">{isAgentForm ? 'Agent Application Form' : 'Credit Card Application'}</h1><p className="text-gray-600 text-center">{isAgentForm ? 'Fill out this form on behalf of your client' : 'Complete all required fields to submit your application'}</p></div>
          {renderStepIndicator()}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {renderCurrentStep()}
            <div className="flex flex-col sm:flex-row justify-between mt-8 pt-6 border-t gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {currentStep > 1 ? (
                  <button type="button" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} className="flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">
                    <ArrowLeft className="h-4 w-4 mr-2" />Previous
                  </button>
                ) : null}
                {currentStep < 5 ? (
                  <button type="button" onClick={handleNext} className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm sm:text-base">
                    Next<ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button type="submit" className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save className="h-4 w-4 mr-2" />Submit Application
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
    </div>
  );
};

export default ApplicationForm;