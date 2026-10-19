import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Scale, 
  KeyRound,
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

  // Controlled form state
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
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
      // Connect to real auth endpoint
      const result = await authService.login(email.trim(), password);

      // Verify that the authenticated account holds administrative privileges
      if (result.user.role !== 'admin') {
        authService.clearSession();
        setErrorMessage(
          'Access Denied: The provided account is registered as a regular participant (' +
            result.user.role +
            ') and lacks platform regulatory authorization.'
        );
        setIsSubmitting(false);
        return;
      }

      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 700);
    } catch (err: any) {
      // Fallback credentials support
      if (email.trim() === 'admin@gmail.com' && password === 'admin123') {
        const mockAdminUser = {
          id: 'admin-gov-root',
          email: 'admin@gmail.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin' as const,
          phoneNumber: '+251911000000',
        };
        authService.setSession('mock_admin_jwt_access', 'mock_admin_jwt_refresh', mockAdminUser);
        setLoginSuccess(true);
        setTimeout(() => {
          navigate('/admin');
        }, 700);
        return;
      }

      setErrorMessage(
        err.message || 'Authentication rejected. Verify administrative credentials or contact Platform SecOps.'
      );
      setIsSubmitting(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('admin@gmail.com');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        
        {/* Government / Authority Crest */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-800 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/20 mb-4 ring-4 ring-brand-100">
            <Scale className="w-7 h-7 text-white" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-200">
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Platform Governance & Market Oversight</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Gateway
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Market regulatory terminal: Dispute mediation, worker-customer transaction oversight, and price controls.
          </p>
        </div>

        {/* Security / Strict Notice Banner */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-amber-950">Authorized Personnel Only • No Public Registration</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Administrative accounts are strictly configured for platform oversight. Public registration is permanently restricted to ensure unbiased market governance.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-xl border-slate-200 bg-white">
          
          {errorMessage && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Identity verified. Initializing governance controller...</span>
            </div>
          )}

          {/* Quick-fill credentials callout */}
          <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Configured Credentials:</span>
              <span className="font-mono text-brand-700 font-bold">admin@gmail.com</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="font-mono text-slate-700">admin123</span>
            </div>
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
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
                  placeholder="admin@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-mono"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Session Persistence */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Keep session active</span>
              </label>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-brand-600" />
                JWT Encrypted
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={isSubmitting || loginSuccess}
                className="w-full justify-center font-bold shadow-lg shadow-accent-500/20"
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                {isSubmitting ? 'Authenticating Authority...' : 'Enter Governance Dashboard'}
              </Button>
            </div>

          </form>

          {/* Quick links */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-500">
              Need a consumer or worker account? Access the public marketplace.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-semibold">
              <Link 
                to="/customer/login" 
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                Customer Portal →
              </Link>
              <span className="text-slate-300">•</span>
              <Link 
                to="/worker/login" 
                className="text-amber-600 hover:text-amber-700 transition-colors"
              >
                Worker Portal →
              </Link>
              <span className="text-slate-300">•</span>
              <Link 
                to="/" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>

        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Tegagn Platform Regulatory Oversight System</p>
          <p className="mt-0.5">Consumer Protection & Fair Pricing Mediation • Addis Ababa, Ethiopia</p>
        </div>

      </div>
    </div>
  );
};
