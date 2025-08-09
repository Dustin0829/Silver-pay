import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { Upload, FileText, X, MapPin, Clock, Building } from 'lucide-react';
import Toast from '../components/Toast';

const jobPositions = [
  {
    id: 1,
    title: 'Credit Card Sales Officer',
    company: 'CardConnectPH',
    location: 'Quezon City, Philippines',
    type: 'Full-time',
    description: 'We are looking for a dynamic Credit Card Sales Officer to join our team and help expand our customer base.',
    requirements: [
      'Bachelor\'s degree in Business, Marketing, or related field',
      'Minimum 2 years of sales experience, preferably in financial services',
      'Excellent communication and interpersonal skills',
      'Strong negotiation and closing abilities',
      'Knowledge of credit card products and financial services',
      'Ability to meet and exceed sales targets',
      'Valid driver\'s license and willingness to travel'
    ],
    responsibilities: [
      'Prospect and generate new credit card applications',
      'Build and maintain relationships with potential customers',
      'Present credit card products and benefits to prospects',
      'Process applications and ensure compliance with regulations',
      'Meet monthly and quarterly sales targets',
      'Provide excellent customer service throughout the sales process',
      'Stay updated on industry trends and product offerings'
    ],
    benefits: [
      'Competitive salary with commission structure',
      'Health insurance and benefits',
      'Professional development opportunities',
      'Performance-based bonuses',
      'Flexible work arrangements'
    ]
  },
  {
    id: 2,
    title: 'Bank Application Processor',
    company: 'CardConnectPH',
    location: 'Quezon City, Philippines',
    type: 'Part-time',
    description: 'Join our processing team to handle credit card applications and ensure smooth operations.',
    requirements: [
      'Bachelor\'s degree in Business Administration, Finance, or related field',
      '1-2 years experience in banking operations or document processing',
      'Strong attention to detail and accuracy',
      'Knowledge of banking regulations and compliance',
      'Proficiency in MS Office and banking software',
      'Excellent organizational and time management skills',
      'Ability to work under pressure and meet deadlines'
    ],
    responsibilities: [
      'Review and process credit card applications',
      'Verify applicant information and documentation',
      'Ensure compliance with banking regulations',
      'Coordinate with different departments for application approval',
      'Maintain accurate records and documentation',
      'Handle customer inquiries regarding application status',
      'Prepare reports on processing metrics and performance'
    ],
    benefits: [
      'Competitive salary package',
      'Health and dental insurance',
      'Paid time off and holidays',
      'Career growth opportunities',
      'Work-life balance'
    ]
  },
  {
    id: 3,
    title: 'Admin Staff',
    company: 'CardConnectPH',
    location: 'Quezon City, Philippines',
    type: 'Full-time',
    description: 'Support our operations team with administrative tasks and ensure smooth day-to-day operations.',
    requirements: [
      'Bachelor\'s degree in Business Administration, Office Management, or related field',
      '1-2 years of administrative experience',
      'Proficiency in MS Office (Word, Excel, PowerPoint)',
      'Excellent written and verbal communication skills',
      'Strong organizational and multitasking abilities',
      'Attention to detail and accuracy',
      'Professional demeanor and customer service orientation'
    ],
    responsibilities: [
      'Handle incoming calls and correspondence',
      'Maintain filing systems and databases',
      'Prepare reports, presentations, and documents',
      'Schedule meetings and coordinate travel arrangements',
      'Assist with data entry and record keeping',
      'Support various departments with administrative tasks',
      'Manage office supplies and equipment'
    ],
    benefits: [
      'Competitive salary',
      'Health insurance coverage',
      'Paid vacation and sick leave',
      'Professional development training',
      'Friendly work environment'
    ]
  },
  {
    id: 4,
    title: 'Data Encoder',
    company: 'CardConnectPH',
    location: 'Quezon City, Philippines',
    type: 'Full-time',
    description: 'Join our data management team to ensure accurate and timely data entry for our operations.',
    requirements: [
      'High school diploma or equivalent (Bachelor\'s degree preferred)',
      '1-2 years of data entry experience',
      'Fast and accurate typing skills (minimum 40 WPM)',
      'Proficiency in MS Excel and data management software',
      'Strong attention to detail and accuracy',
      'Ability to work with large volumes of data',
      'Good time management and organizational skills'
    ],
    responsibilities: [
      'Enter and update customer information in databases',
      'Verify accuracy of entered data',
      'Process and organize large datasets',
      'Generate reports from entered data',
      'Maintain data integrity and confidentiality',
      'Follow data entry procedures and guidelines',
      'Assist with data quality control and validation'
    ],
    benefits: [
      'Competitive entry-level salary',
      'Health insurance benefits',
      'Paid training and development',
      'Performance incentives',
      'Career advancement opportunities'
    ]
  }
];

const JobApplicationForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [form, setForm] = React.useState({ 
    firstName: '', 
    lastName: '', 
    middleName: '', 
    contactNumber: '', 
    email: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    postalCode: '',
    levelOfEducation: '',
    fieldOfStudy: '',
    schoolName: '',
    timePeriodFrom: '',
    timePeriodTo: '',
    workExperiences: [{
      jobTitle: '',
      company: '',
      workplaceAddress: '',
      currentlyWorkHere: false,
      fromMonth: '',
      fromYear: '',
      toMonth: '',
      toYear: '',
      description: ''
    }],
    message: ''
  });
  const [resume, setResume] = React.useState<File | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [toast, setToast] = React.useState({
    show: false,
    message: '',
    type: 'error' as 'success' | 'error'
  });
  const navigate = useNavigate();

  const totalSteps = 5; // Updated total number of steps in the form

  const selectedJob = jobPositions.find(job => job.id === parseInt(jobId || '0'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWorkExperienceChange = (index: number, field: string, value: any) => {
    const updatedExperiences = [...form.workExperiences];
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value };
    setForm({ ...form, workExperiences: updatedExperiences });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB.', 'error');
        e.target.value = '';
        return;
      }
      setResume(file);
    }
  };

  const removeResume = () => {
    setResume(null);
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Submit even without resume
    if (resume) {
      try {
        // Create email content with resume attachment info
        const emailContent = `
          New Job Application from CardConnectPH Website
          
          Position Applied: ${selectedJob?.title}
          
          Personal Information:
          First Name: ${form.firstName}
          Last Name: ${form.lastName}
          Middle Name: ${form.middleName}
          Contact Number: ${form.contactNumber}
          Email: ${form.email}
          
          Address Information:
          Street: ${form.street}
          Barangay: ${form.barangay}
          City/Municipality: ${form.city}
          Province: ${form.province}
          Postal Code: ${form.postalCode}
          
          Educational Background:
          Level of Education: ${form.levelOfEducation}
          Field of Study: ${form.fieldOfStudy}
          School Name: ${form.schoolName}
          Time Period: ${form.timePeriodFrom} - ${form.timePeriodTo}
          
          Work Experience:
          ${form.workExperiences.map((exp, i) => `
            Experience ${i + 1}:
            Job Title: ${exp.jobTitle}
            Company: ${exp.company}
            Workplace Address: ${exp.workplaceAddress}
            Period: ${exp.fromMonth} ${exp.fromYear} - ${exp.currentlyWorkHere ? 'Present' : `${exp.toMonth} ${exp.toYear}`}
            Description: ${exp.description}
          `).join('\n')}
          
          Cover Letter:
          ${form.message}
          
          IMPORTANT: Please remember to manually attach the resume file to this email before sending.
          Resume filename: ${resume.name} (${(resume.size / 1024 / 1024).toFixed(2)} MB)
          
          ---
          This application was sent from the CardConnectPH careers page.
        `;

        // Create Gmail compose link with both recipients
        const recipients = "hr.admin@teamscsolutions.com,recruitment@teamscsolution.com";
        const subject = `Job Application: ${selectedJob?.title || ''} - ${form.firstName} ${form.lastName}`;
        const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipients)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
        
        // Open Gmail compose window
        window.open(gmailComposeUrl, '_blank');
        
        // Show a reminder toast about attaching the resume
        showToast('Gmail will open in a new tab. Please remember to attach your resume file before sending.', 'success');
        
        // Redirect to success page instead of showing inline message
        navigate('/job-application-success');
        
        setForm({ 
          firstName: '', 
          lastName: '', 
          middleName: '', 
          contactNumber: '', 
          email: '',
          street: '',
          barangay: '',
          city: '',
          province: '',
          postalCode: '',
          levelOfEducation: '',
          fieldOfStudy: '',
          schoolName: '',
          timePeriodFrom: '',
          timePeriodTo: '',
          workExperiences: [{
            jobTitle: '',
            company: '',
            workplaceAddress: '',
            currentlyWorkHere: false,
            fromMonth: '',
            fromYear: '',
            toMonth: '',
            toYear: '',
            description: ''
          }],
          message: ''
        });
        setResume(null);
      } catch (error) {
        showToast('Failed to send message. Please try again later.', 'error');
      }
    } else {
      showToast('Note: You are submitting without a resume.', 'error');
      setSubmitted(true);
      // Reset form
      setForm({ 
        firstName: '', 
        lastName: '', 
        middleName: '', 
        contactNumber: '', 
        email: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        postalCode: '',
        levelOfEducation: '',
        fieldOfStudy: '',
        schoolName: '',
        timePeriodFrom: '',
        timePeriodTo: '',
        workExperiences: [{
          jobTitle: '',
          company: '',
          workplaceAddress: '',
          currentlyWorkHere: false,
          fromMonth: '',
          fromYear: '',
          toMonth: '',
          toYear: '',
          description: ''
        }],
        message: ''
      });
    }
  };

  const validateCurrentStep = (step: number): boolean => {
    // No validation required anymore, all fields are optional
    return true;
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep(currentStep)) {
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  if (!selectedJob) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <BackButton />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/jobs')}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  // Step indicator component
  const StepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[...Array(totalSteps)].map((_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-700 text-white' : 
                  isCompleted ? 'bg-green-600 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                <div className={`text-xs mt-2 ${isActive ? 'text-blue-700 font-medium' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {stepNumber === 1 && "Personal Info"}
                  {stepNumber === 2 && "Address"}
                  {stepNumber === 3 && "Education"}
                  {stepNumber === 4 && "Experience"}
                  {stepNumber === 5 && "Resume"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex w-full mt-2">
          {[...Array(totalSteps - 1)].map((_, index) => (
            <div key={index} className={`h-1 flex-1 mx-1 ${index < currentStep - 1 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to generate month options
  const monthOptions = [
    { value: '', label: 'Month' },
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' }
  ];

  // Helper function to generate year options (last 50 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [{ value: '', label: 'Year' }];
    for (let i = 0; i <= 50; i++) {
      const year = currentYear - i;
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={form.firstName} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={form.lastName} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Middle Name</label>
                <input 
                  type="text" 
                  name="middleName" 
                  value={form.middleName} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Contact Number</label>
                <input 
                  type="tel" 
                  name="contactNumber" 
                  value={form.contactNumber} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 text-sm font-medium">Street Address</label>
                <input 
                  type="text" 
                  name="street" 
                  value={form.street} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Barangay</label>
                <input 
                  type="text" 
                  name="barangay" 
                  value={form.barangay} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">City/Municipality</label>
                <input 
                  type="text" 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Province</label>
                <input 
                  type="text" 
                  name="province" 
                  value={form.province} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Postal Code</label>
                <input 
                  type="text" 
                  name="postalCode" 
                  value={form.postalCode} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Education</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Level of Education</label>
                  <input 
                    type="text" 
                    name="levelOfEducation" 
                    value={form.levelOfEducation} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Field of Study</label>
                  <input 
                    type="text" 
                    name="fieldOfStudy" 
                    value={form.fieldOfStudy} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">School Name</label>
                  <input 
                    type="text" 
                    name="schoolName" 
                    value={form.schoolName} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2 text-sm font-medium">From</label>
                    <input 
                      type="text" 
                      name="timePeriodFrom" 
                      value={form.timePeriodFrom} 
                      onChange={handleChange} 
                      placeholder="Year" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2 text-sm font-medium">To</label>
                    <input 
                      type="text" 
                      name="timePeriodTo" 
                      value={form.timePeriodTo} 
                      onChange={handleChange} 
                      placeholder="Year or Present" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Work Experience</h3>
        
            
            {form.workExperiences.map((experience, index) => (
              <div key={index} className="space-y-4 border-b border-gray-200 pb-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">
                    Job title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={experience.jobTitle} 
                    onChange={(e) => handleWorkExperienceChange(index, 'jobTitle', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Company</label>
                  <input 
                    type="text" 
                    value={experience.company}
                    onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Address of the workplace</label>
                  <input 
                    type="text" 
                    value={experience.workplaceAddress}
                    onChange={(e) => handleWorkExperienceChange(index, 'workplaceAddress', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Time period</label>
                  <div className="flex items-center mb-4">
                    <input 
                      type="checkbox" 
                      id={`currentlyWork-${index}`}
                      checked={experience.currentlyWorkHere}
                      onChange={(e) => handleWorkExperienceChange(index, 'currentlyWorkHere', e.target.checked)}
                      className="h-4 w-4 mr-2" 
                    />
                    <label htmlFor={`currentlyWork-${index}`} className="text-sm text-gray-700">
                      I currently work here
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">From</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={experience.fromMonth}
                      onChange={(e) => handleWorkExperienceChange(index, 'fromMonth', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {monthOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <select
                      value={experience.fromYear}
                      onChange={(e) => handleWorkExperienceChange(index, 'fromYear', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {yearOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {!experience.currentlyWorkHere && (
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">To</label>
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={experience.toMonth}
                        onChange={(e) => handleWorkExperienceChange(index, 'toMonth', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {monthOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <select
                        value={experience.toYear}
                        onChange={(e) => handleWorkExperienceChange(index, 'toYear', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {yearOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Description (Recommended)</label>
                  <div className="border border-gray-300 rounded-lg">
                    <div className="border-b border-gray-300 p-2 flex">
                      <button type="button" className="p-1 mr-1">
                        <span className="sr-only">Bulleted list</span>
                        <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button type="button" className="p-1">
                        <span className="sr-only">Numbered list</span>
                        <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <textarea 
                      value={experience.description}
                      onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-sm border-0 focus:ring-0"
                      rows={6}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            {/* Cover Letter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cover Letter</h3>
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Why are you interested in this position?</label>
                <textarea 
                  name="message" 
                  value={form.message} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                  rows={5}
                  placeholder="Tell us why you're interested in this position, what makes you a good fit, and how you can contribute to our team..."
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Resume Upload</h3>
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">Upload Resume</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                  {!resume ? (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload your resume</p>
                      <p className="text-xs text-gray-500 mb-4">All file types accepted (JPG, PNG, PDF, DOC, etc.) up to 5MB</p>
                      <p className="text-xs text-red-500 mb-4">Important: You will need to manually attach this file again when the email form opens.</p>
                      <input
                        type="file"
                        id="resume-upload"
                        accept="*"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Choose File
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resume.name}</p>
                          <p className="text-xs text-gray-500">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p className="text-xs text-red-500 mt-1">Remember to attach this file again in Gmail</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeResume}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <BackButton />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-4">
            <h1 className="text-2xl font-bold text-blue-700 mb-4">{selectedJob.title}</h1>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-2" />
                {selectedJob.company}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {selectedJob.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {selectedJob.type}
              </div>
            </div>

            <p className="text-gray-700 mb-6">{selectedJob.description}</p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Requirements:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {selectedJob.requirements.slice(0, 3).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
                {selectedJob.requirements.length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">+{selectedJob.requirements.length - 3} more requirements</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Benefits:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {selectedJob.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                {selectedJob.benefits.length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">+{selectedJob.benefits.length - 3} more benefits</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Application Form</h2>
            
            <StepIndicator />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    currentStep === 1 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors'
                  }`}
                >
                  Back
                </button>
                
                {currentStep < totalSteps ? (
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        if (currentStep < totalSteps) {
                          setCurrentStep(currentStep + 1);
                          window.scrollTo(0, 0);
                        }
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Skip
                    </button>
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
                    >
                      Next Step
                    </button>
                  </div>
                ) : (
                  <button 
                    type="submit" 
                    className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium"
                  >
                    Submit Application
                  </button>
                )}
              </div>
              
            </form>
          </div>
        </div>
      </div>
      
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={() => setToast({ ...toast, show: false })}
        type={toast.type}
      />
    </div>
  );
};

export default JobApplicationForm; 