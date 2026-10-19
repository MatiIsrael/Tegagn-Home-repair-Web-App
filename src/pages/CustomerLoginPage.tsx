import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Home, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { authService } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/customer/dashboard';
  const isBookingRequired = searchParams.get('notice') === 'booking_required' || searchParams.has('redirect');

  const storedUser = authService.getStoredUser();
  const [email, setEmail] = useState(storedUser?.role === 'customer' ? storedUser.email : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.login(email.trim(), password, 'customer');
      setLoginSuccess(true);
      setTimeout(() => {
        navigate(redirectTarget);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials or register a new customer account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSampleCustomer = () => {
    setEmail('bethlehem@gmail.com');
    setPassword('customer123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/20 mb-4 ring-4 ring-brand-100">
            <Home className="w-7 h-7 text-white" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Customer Portal Login</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back Home
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Sign in to track your repairs, browse worker posts, react with likes & comments, and book verified professionals.
          </p>
        </div>

        {/* Card */}
        <Card className="p-8 shadow-xl border-slate-200 bg-white">
          
          {isBookingRequired && (
            <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-amber-950">Customer Sign-In Required for Booking</p>
                <p className="text-amber-800 mt-1 leading-relaxed">
                  Please log in with your customer account to request and book this professional. You will be redirected right back to complete your service request.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Authenticated! Redirecting to booking...</span>
            </div>
          )}

          {/* Real Database Credentials Callout */}
          <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Verified Database Customer:</span>
              <span className="font-mono text-brand-700 font-bold">bethlehem@gmail.com</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="font-mono text-slate-700">customer123</span>
            </div>
            <button
              type="button"
              onClick={fillSampleCustomer}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full justify-center font-bold shadow-lg shadow-brand-500/20"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Sign In to Customer Hub
              </Button>
            </div>

          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              New to Tegagn? Create your homeowner account.
            </p>
            <Link 
              to={`/customer/register${redirectTarget !== '/customer/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`} 
              className="inline-block text-xs font-bold text-brand-600 hover:text-brand-700 underline"
            >
              Register Customer Account →
            </Link>
          </div>

        </Card>

        {/* Alternate portal links */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <Link to="/worker/login" className="text-slate-600 hover:text-brand-600 font-semibold transition-colors">
            🔧 Worker Portal Login
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/admin/login" className="text-slate-600 hover:text-sky-600 font-semibold transition-colors">
            🏛️ Government Admin Portal
          </Link>
        </div>

      </div>
    </div>
  );
};
