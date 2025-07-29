import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { MapPin, Clock, Building, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const jobPositions = [
  {
    id: 1,
    title: 'Credit Card Sales Officer',
    company: 'SilverCard',
    location: 'Quezon City, Philippines',
    type: 'Full-time',
    description: 'We are looking for a dynamic Credit Card Sales Officer to join our team and help expand our customer base.',
    detailedDescription: 'As a Credit Card Sales Officer at SilverCard, you will play a crucial role in our growth strategy by acquiring new customers and promoting our credit card products. You will work with a dynamic team of sales professionals to achieve targets and provide exceptional service to potential clients.',
    requirements: [
      'High school graduate or equivalent',
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
      'Competitive salary',
      'Performance-based bonuses',
      'Health and dental insurance',
      'Paid vacation and sick leave',
      'Opportunity for career growth'
    ]
  },
  {
    id: 2,
    title: 'Bank Application Processor',
    company: 'SilverCard',
    location: 'Quezon City, Philippines',
    type: 'Part-time',
    description: 'Join our processing team to handle credit card applications and ensure smooth operations.',
    detailedDescription: 'As a Bank Application Processor, you will be responsible for reviewing and processing credit card applications accurately and efficiently. This role is critical in maintaining our service standards and ensuring compliance with banking regulations while delivering a positive customer experience.',
    requirements: [
      'High school graduate or equivalent',
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
      'Flexible work hours',
      'Competitive hourly rate',
      'Opportunity to learn banking operations',
      'Work-from-home options available'
    ]
  },
  {
    id: 3,
    title: 'Admin Staff',
    company: 'SilverCard',
    location: 'Quezon City, Philippines',
    type: 'Full-time',
    description: 'Support our operations team with administrative tasks and ensure smooth day-to-day operations.',
    detailedDescription: 'The Administrative Staff position is vital to the smooth functioning of our office operations. You will provide comprehensive administrative support to various departments, handle correspondence, maintain records, and assist with daily operational needs to keep our organization running efficiently.',
    requirements: [
      'High school graduate or equivalent',
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
      'Stable work environment',
      'Comprehensive benefits package',
      'Opportunity to develop administrative skills'
    ]
  },
  {
    id: 4,
    title: 'Data Encoder',
    company: 'SilverCard',
    location: 'Quezon City, Philippines',
    type: 'Full-time',
    description: 'Join our data management team to ensure accurate and timely data entry for our operations.',
    detailedDescription: 'Our Data Encoder position is perfect for detail-oriented individuals who excel at managing information. You will be responsible for accurately entering and maintaining data in our systems, ensuring information integrity, and supporting operational reporting needs with precise data management.',
    requirements: [
      'High school graduate or equivalent',
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
      'Stable work environment',
      'Competitive salary',
      'Opportunity to work with diverse data'
    ]
  }
];

const JobApplication: React.FC = () => {
  const navigate = useNavigate();
  const [expandedJobs, setExpandedJobs] = React.useState<number[]>([]);

  const handleApply = (jobId: number) => {
    navigate(`/jobs/apply/${jobId}`);
  };

  const toggleJobDetails = (jobId: number) => {
    setExpandedJobs(prev => 
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const isJobExpanded = (jobId: number) => expandedJobs.includes(jobId);

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Career Opportunities</h1>
      <p className="text-gray-700 mb-8">Join our team and be part of SilverCard's mission to provide exceptional financial services. Explore our current openings below.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobPositions.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-blue-700 mb-2">{job.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {job.company}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.type}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{job.description}</p>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Key Requirements:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {(isJobExpanded(job.id) ? job.requirements : job.requirements.slice(0, 3)).map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
              {!isJobExpanded(job.id) && job.requirements.length > 3 && (
                <p className="text-xs text-gray-500 mt-1">+{job.requirements.length - 3} more requirements</p>
              )}
            </div>

            {isJobExpanded(job.id) && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Job Description:</h3>
                <p className="text-sm text-gray-700">{job.detailedDescription}</p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                onClick={() => toggleJobDetails(job.id)}
                className="w-full border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
              >
                {isJobExpanded(job.id) ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    See less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    See more
                  </>
                )}
              </button>

              <button 
                onClick={() => handleApply(job.id)}
                className="w-full bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center justify-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobApplication; 