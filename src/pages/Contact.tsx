import React, { useState } from 'react';
import { Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Placeholder: send email logic here
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-8 text-gray-700">Have questions or need support? Fill out the form below or reach us through our social media channels.</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={5} required />
        </div>
        <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors">Send Message</button>
        {submitted && <p className="text-green-600 mt-4">Thank you for contacting us! We'll get back to you soon.</p>}
      </form>
      <div className="flex items-center space-x-6">
        <a href="https://facebook.com/silverpay" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900"><Facebook className="h-6 w-6" /></a>
        <a href="https://twitter.com/silverpay" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><Twitter className="h-6 w-6" /></a>
        <a href="https://instagram.com/silverpay" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700"><Instagram className="h-6 w-6" /></a>
        <a href="https://linkedin.com/company/silverpay" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Linkedin className="h-6 w-6" /></a>
      </div>
    </div>
  );
};

export default Contact; 