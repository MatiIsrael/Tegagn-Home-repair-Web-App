import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Scale, 
  CheckCircle2,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import { authService } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const storedUser = authService.getStoredUser();

  React.useEffect(() => {
    if (storedUser && storedUser.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [storedUser, navigate]);

  // Controlled form state
  const [email, setEmail] = useState(storedUser?.role === 'admin' ? storedUser.email : (localStorage.getItem('tegagn_remembered_email') || ''));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Status & error handling state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Official administrative email is required.');
      return;
    }
    if (!password) {
      setErrorMessage('Security credentials password is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.login(email.trim(), password, 'admin');
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 600);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Authentication rejected. Verify administrative credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-6">
        
        {/* Government / Authority Crest */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-800 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/20 mb-4 ring-4 ring-brand-100 dark:ring-slate-800">
            <Scale className="w-7 h-7 text-white" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-200 dark:border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Platform Governance & Market Oversight</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Administrator Gateway
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Dispute mediation, worker-customer transaction oversight, and price controls.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          
          {errorMessage && (
            <div className="mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3.5 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Identity verified. Loading control center...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Regulatory Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tegagn.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password Key
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <span>Keep terminal session active</span>
              </label>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              variant="navy"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center font-bold shadow-lg shadow-navy-950/20 mt-2 bg-gradient-to-r from-navy-950 to-slate-900 hover:from-slate-900 hover:to-navy-950"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In to Admin Center
            </Button>
          </form>

          {/* Compliance notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>End-to-end encrypted administrative audit session</span>
          </div>
        </Card>

        {/* Back to Home Link */}
        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline">
            &larr; Return to Marketplace Home
          </Link>
        </div>

      </div>
    </div>
  );
};
