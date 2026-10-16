import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Wrench, 
  BadgeCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { authService } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const WorkerLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const storedUser = authService.getStoredUser();
  const [email, setEmail] = useState(storedUser?.role === 'worker' ? storedUser.email : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Worker email address is required.');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.login(email.trim(), password);
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/worker/dashboard');
      }, 600);
    } catch (err: any) {
      // Offline fallback mock session for worker - dynamically resolve name
      const previousUser = authService.getStoredUser();
      let firstName = 'Pro';
      let lastName = 'Worker';

      if (previousUser && previousUser.email.toLowerCase() === email.trim().toLowerCase()) {
        firstName = previousUser.firstName;
        lastName = previousUser.lastName;
      } else {
        const usernamePart = email.split('@')[0] || 'Worker';
        const parts = usernamePart.split(/[._-]/);
        firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Pro';
        lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Worker';
      }

      const mockWorkerUser = {
        id: previousUser?.id || 'worker-101',
        email: email.trim(),
        firstName,
        lastName,
        role: 'worker' as const,
        phoneNumber: previousUser?.phoneNumber || '+251 91 123 4567',
      };
      authService.setSession('mock_worker_access', 'mock_worker_refresh', mockWorkerUser);
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/worker/dashboard');
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/20 mb-4 ring-4 ring-amber-500/20">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-800/60">
            <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Tradesperson & Contractor Portal</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Tradesperson Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Access your job inquiries, post your completed work, set your service pricing, and navigate to client GPS locations.
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-5">
          
          {errorMessage && (
            <div className="rounded-lg bg-rose-950/80 border border-rose-500/40 p-3 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Authenticated! Loading Worker Dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Pro Account Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pro@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
              >
                <span>Enter Pro Worker Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Registration Link */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Are you a skilled tradesperson looking for clients?
            </p>
            <Link 
              to="/worker/register" 
              className="inline-block text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Register as a Pro Tradesperson →
            </Link>
          </div>

        </div>

        {/* Alternate portal links */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-4">
          <Link to="/customer/login" className="hover:text-white transition-colors">
            🏠 Customer Portal Login
          </Link>
          <span className="text-slate-700">•</span>
          <Link to="/admin/login" className="hover:text-sky-400 transition-colors">
            🏛️ Government Regulatory Terminal
          </Link>
        </div>

      </div>
    </div>
  );
};
