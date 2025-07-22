import React from 'react';

const jobPositions = [
  { title: 'Sales Agent', description: 'Responsible for acquiring new clients and managing relationships.' },
  { title: 'Customer Support Specialist', description: 'Assist customers with inquiries and resolve issues.' },
  { title: 'Marketing Coordinator', description: 'Plan and execute marketing campaigns for SilverCard.' },
  { title: 'Software Engineer', description: 'Develop and maintain SilverCard web applications.' },
  { title: 'Compliance Officer', description: 'Ensure all operations comply with regulations and company policies.' },
];

const JobApplication: React.FC = () => {
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Placeholder: send resume logic here
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
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
          <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors">Send Resume</button>
          {submitted && <p className="text-green-600 mt-4">Thank you for your interest! We'll get back to you soon.</p>}
        </form>
      </div>
    </div>
  );
};

export default JobApplication; 