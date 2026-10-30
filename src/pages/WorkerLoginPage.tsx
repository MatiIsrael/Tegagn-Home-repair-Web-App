import React, { useState, useEffect } from 'react';
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

  React.useEffect(() => {
    if (storedUser) {
      if (storedUser.role === 'worker') {
        navigate('/worker/dashboard', { replace: true });
      } else if (storedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    }
  }, [storedUser, navigate]);

  if (storedUser) {
    const dashboardUrl = storedUser.role === 'worker' ? '/worker/dashboard' : storedUser.role === 'admin' ? '/admin' : '/customer/dashboard';
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-amber-200 dark:border-amber-800 dark:bg-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20 shadow-xs">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Already Signed In</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              You are currently logged in as <strong className="text-slate-900 dark:text-white">{storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : storedUser.email}</strong>.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Button
              variant="accent"
              size="lg"
              className="w-full justify-center font-bold"
              onClick={() => navigate(dashboardUrl)}
            >
              Continue to Dashboard
            </Button>
            <button
              type="button"
              onClick={() => {
                authService.logout();
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer"
            >
              Sign Out to Switch Accounts
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const [email, setEmail] = useState(() => localStorage.getItem('tegagn_remembered_email') || '');
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
      await authService.login(email.trim(), password, 'worker');
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/worker/dashboard');
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials or register as a tradesperson.');
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
            <span>Technician & Tradesperson Portal</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Worker Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Access your job requests, manage rates, and showcase your trade portfolio.
          </p>
        </div>

        {/* Card */}
        <Card className="p-8 shadow-2xl border-slate-800 bg-slate-950 text-slate-100">
          
          {errorMessage && (
            <div className="mb-5 rounded-lg bg-rose-950/80 border border-rose-500/40 p-3 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="mb-5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs text-emerald-200 flex items-center gap-2">
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
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center font-bold shadow-lg shadow-amber-500/20 mt-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In to Worker Hub
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New tradesperson in Addis Ababa?{' '}
              <Link to="/worker/register" className="font-bold text-amber-400 hover:text-amber-300 hover:underline">
                Register as a Pro
              </Link>
            </p>
          </div>
        </Card>

        {/* Customer Portal Link */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Looking for repairs instead?{' '}
            <Link to="/customer/login" className="font-semibold text-slate-400 hover:text-amber-400 underline">
              Sign in as Customer
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
