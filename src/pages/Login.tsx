import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import BackButton from '../components/BackButton';
import { useLoading } from '../context/LoadingContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShowToast(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-0 bg-gradient-to-br from-white-900 to-blue-700 flex items-center justify-center px-2 sm:px-4 py-8">
      <BackButton />
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-4 sm:p-6">
        <div className="text-center mb-8">
          <LogIn className="h-12 w-12 text-blue-700 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600">Authorized Personel Only</h2>
          <p className="text-gray-600 mt-2">Access your SilverCard dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/" className="text-blue-700 hover:text-blue-800 text-sm">
            ← Back to Home
          </Link>
        </div>
              </div>
        <Toast 
          message="This is for admin only" 
          show={showToast} 
          onClose={() => setShowToast(false)}
          type="error"
        />
      </div>
  );
};

export default Login;