import React from 'react';
import emailjs from 'emailjs-com';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { Upload, FileText, X } from 'lucide-react';

const jobPositions = [
  { title: 'Sales Agent', description: 'Responsible for acquiring new clients and managing relationships.' },
  { title: 'Customer Support Specialist', description: 'Assist customers with inquiries and resolve issues.' },
  { title: 'Marketing Coordinator', description: 'Plan and execute marketing campaigns for SilverCard.' },
  { title: 'Software Engineer', description: 'Develop and maintain SilverCard web applications.' },
  { title: 'Compliance Officer', description: 'Ensure all operations comply with regulations and company policies.' },
];

const JobApplication: React.FC = () => {
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [resume, setResume] = React.useState<File | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, DOCX, or TXT file.');
        e.target.value = '';
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume) {
      alert('Please upload your resume.');
      return;
    }

    try {
      // Create email content with resume attachment info
      const emailContent = `
        New Job Application from SilverCard Website
        
        Name: ${form.name}
        Email: ${form.email}
        
        Message/Cover Letter:
        ${form.message}
        
        Resume: ${resume.name} (${(resume.size / 1024 / 1024).toFixed(2)} MB)
        
        ---
        This application was sent from the SilverCard careers page.
        Note: The resume file should be attached to this email.
      `;

      // Create mailto link with the specified email
      const mailtoLink = `mailto:silvercard.202504@gmail.com?subject=Job Application: ${encodeURIComponent(form.name)} - ${encodeURIComponent(resume.name)}&body=${encodeURIComponent(emailContent)}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
      setResume(null);
    } catch (error) {
      alert('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Job Openings</h1>
      <p className="text-gray-700 mb-8">Join our team! Explore our current job openings and send us your resume to be part of SilverCard.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {jobPositions.map((job, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-2">{job.description}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Send Your Resume</h2>
        <p className="mb-6 text-gray-700">Interested in joining SilverCard? Fill out the form below and send us your resume or a brief cover letter. Our team will get in touch with you soon!</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Message / Cover Letter</label>
            <textarea name="message" value={form.message} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={5} required />
          </div>

          {/* Resume Upload Section */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Upload Resume *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
              {!resume ? (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload your resume</p>
                  <p className="text-xs text-gray-500 mb-4">PDF, DOC, DOCX, or TXT files up to 5MB</p>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeChange}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resume.name}</p>
                      <p className="text-xs text-gray-500">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
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

          <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors">Send Application</button>
          {submitted && <p className="text-green-600 mt-4">Thank you for your interest! We'll get back to you soon.</p>}
        </form>
      </div>
    </div>
  );
};

export default JobApplication; 