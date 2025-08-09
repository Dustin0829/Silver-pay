import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  improvementType: string;
}

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    improvementType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const improvementTypes = [
    { value: 'general', label: 'General Feedback' },
    { value: 'website', label: 'Website Improvements' },
    { value: 'service', label: 'Service Quality' },
    { value: 'process', label: 'Application Process' },
    { value: 'support', label: 'Customer Support' },
    { value: 'features', label: 'New Features' },
    { value: 'pricing', label: 'Pricing & Rates' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create email content
      const emailContent = `
        New Feedback Submission from CardConnectPH Website
        
        Name: ${formData.name}
        Email: ${formData.email}
        Improvement Type: ${improvementTypes.find(type => type.value === formData.improvementType)?.label}
        Subject: ${formData.subject}
        
        Message:
        ${formData.message}
        
        ---
        This message was sent from the CardConnectPH contact form.
      `;

      // Create mailto link with the specified email
      const mailtoLink = `mailto:cardconnectph@gmail.com?subject=CardConnectPH Feedback: ${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailContent)}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        improvementType: 'general'
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Circular Back Button */}
      <button 
        type="button" 
        onClick={() => navigate(-1)} 
        className="fixed top-4 left-4 z-30 flex items-center p-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 bg-white shadow" 
        aria-label="Back"
          >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We value your feedback! Help us improve CardConnectPH by sharing your thoughts, 
            suggestions, and ideas for what we can do better.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 h-fit">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">2/F Unit 3, PBE Building, 14 Balete Drive, Quezon City, Philippines</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">0285518750</p>
                  </div>
                </div>

                                 <div className="flex items-start">
                   <div className="flex-shrink-0">
                     <Mail className="h-6 w-6 text-blue-600" />
                   </div>
                   <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">cardconnectph@gmail.com</p>
                    <p className="text-gray-500 text-sm">For general inquiries and feedback</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Help Center</h3>
                    <p className="text-gray-600">support@teamscsolutions.com</p>
                    <p className="text-gray-500 text-sm">For technical support and assistance</p>
                   </div>
                 </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Why Your Feedback Matters</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    Helps us improve our services
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    Shapes future features and updates
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    Ensures better customer experience
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    Drives innovation in our platform
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us Your Feedback</h2>
              
                             {submitStatus === 'success' && (
                 <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                   <div className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                     <p className="text-green-800 font-medium">
                       Thank you for your feedback! Your email client should have opened with a pre-filled message. 
                       Please send the email to complete your feedback submission.
                     </p>
                   </div>
                 </div>
               )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-800 font-medium">
                      Sorry, there was an error sending your message. Please try again.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="improvementType" className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to improve? *
                  </label>
                  <select
                    id="improvementType"
                    name="improvementType"
                    value={formData.improvementType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {improvementTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Brief description of your feedback"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Please share your detailed feedback, suggestions, or ideas for improvement..."
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    * Required fields
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How quickly will you respond?</h3>
              <p className="text-gray-600">
                We typically respond to all feedback within 24-48 hours during business days. 
                For urgent matters, please call our support line.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Will my feedback be anonymous?</h3>
              <p className="text-gray-600">
                You can choose to remain anonymous in your feedback. However, providing your 
                contact information helps us follow up with you if needed.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens to my suggestions?</h3>
              <p className="text-gray-600">
                All feedback is reviewed by our team and shared with relevant departments. 
                We regularly implement customer suggestions to improve our services.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I track the status of my feedback?</h3>
              <p className="text-gray-600">
                Yes! We'll send you a confirmation email with a reference number. 
                You can use this to follow up on your feedback status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 