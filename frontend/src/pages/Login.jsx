import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { Calendar, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Logged in as ${user.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.customMessage || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">EventForce</span>
        </div>
        <p className="text-center text-sm text-gray-600">
          Event Management System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-lg sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eventforce.com"
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Panel */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 text-center mb-2.5">
              Select Demo Account to Auto-fill:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@eventforce.com')}
                className="py-1.5 px-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('coordinator@eventforce.com')}
                className="py-1.5 px-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-center"
              >
                Coordinator
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('staff@eventforce.com')}
                className="py-1.5 px-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition-colors text-center"
              >
                Staff
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-2.5">
              Demo password: <code className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded">Admin@123</code>
            </p>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2026 EventForce &bull; Developed by <strong className="text-gray-700 font-semibold">AI Warriors</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
