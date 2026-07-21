import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import { Eye, EyeOff, LogIn, AlertCircle, Key } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@king24x7.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = (email || '').trim().toLowerCase().replace(/×/g, 'x').replace(/%c3%97/gi, 'x');

    try {
      const res = await axiosInstance.post('/api/admin/auth/login', { email: cleanEmail, password });
      const { token, user } = res.data;
      if (token) {
        login(user, token);
        navigate('/');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (emailVal, passVal) => {
    setEmail(emailVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2d] to-[#2b2b40] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#B3732A] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#B3732A]/30">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Kings TV Admin</h1>
          <p className="text-gray-400 mt-1 text-sm">Sign in to manage your platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email / Username</label>
              <input
                type="text"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] transition-all text-sm font-medium"
                placeholder="admin@king24x7.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] transition-all text-sm font-medium"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full py-3 bg-[#B3732A] hover:bg-[#9c6323] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#B3732A]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials Bar */}
          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2 font-medium flex items-center justify-center gap-1">
              <Key size={13} className="text-[#B3732A]" /> Demo Credentials (Click to fill):
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@king24x7.com', 'admin123')}
                className="px-3 py-1 bg-amber-50 text-[#B3732A] border border-amber-200/60 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                admin@king24x7.com
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@kingstv.com', 'admin123')}
                className="px-3 py-1 bg-amber-50 text-[#B3732A] border border-amber-200/60 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                admin@kingstv.com
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} Kings TV. All rights reserved.
        </p>
      </div>
    </div>
  );
}
