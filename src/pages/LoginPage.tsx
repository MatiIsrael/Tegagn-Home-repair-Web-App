import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { FormInput } from '../components/common/FormInput';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { authService } from '../services/api';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const { t } = useThemeLanguage();

  const storedUser = authService.getStoredUser();

  // Auto-redirect if already logged in (always remember)
  React.useEffect(() => {
    if (storedUser) {
      if (storedUser.role === 'worker') navigate('/worker/dashboard', { replace: true });
      else if (storedUser.role === 'admin') navigate('/admin', { replace: true });
      else navigate(redirectTarget || '/customer/dashboard', { replace: true });
    }
  }, [storedUser, navigate, redirectTarget]);

  if (storedUser) {
    const dashboardUrl = storedUser.role === 'worker' ? '/worker/dashboard' : storedUser.role === 'admin' ? '/admin' : '/customer/dashboard';
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-amber-200 dark:border-amber-800 dark:bg-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Already Signed In</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              You are currently logged in as <strong className="text-slate-900 dark:text-white">{storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : storedUser.email}</strong> (<span className="capitalize">{storedUser.role}</span>).
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Button
              variant="accent"
              size="lg"
              className="w-full justify-center font-bold"
              icon={<ArrowRight className="w-4 h-4" />}
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

  // Controlled inputs: prefill remembered email if saved
  const [email, setEmail] = useState(() => localStorage.getItem('tegagn_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [roleHint, setRoleHint] = useState<'customer' | 'worker' | 'admin'>('customer');
  const [rememberMe, setRememberMe] = useState(true);

  // Validation errors & loading state
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateLogin = () => {
    const errs: { email?: string; password?: string; general?: string } = {};

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authService.login(email.trim(), password, roleHint);
      setIsSubmitting(false);
      if (res.user.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTarget || '/customer/dashboard');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrors({ general: err.message || 'Authentication failed. Please verify credentials or register.' });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-center text-accent-500 mx-auto shadow-lg mb-4">
            <Wrench className="w-6 h-6 text-accent-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
            {t('signInTegagn')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          
          {/* Persona selector tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t('serviceCategory')}
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold" role="tablist">
              {(['customer', 'worker'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  role="tab"
                  aria-selected={roleHint === role}
                  onClick={() => setRoleHint(role)}
                  className={`py-2 rounded-lg transition-all capitalize cursor-pointer ${
                    roleHint === role
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-navy-950 hover:bg-white/50'
                  }`}
                >
                  {role === 'customer' ? t('customer') : t('proWorker')}
                </button>
              ))}
              <Link
                to="/admin/login"
                className="py-2 rounded-lg transition-all text-center capitalize cursor-pointer bg-slate-900 hover:bg-sky-950 text-sky-400 border border-sky-800/40 hover:border-sky-500/60 font-black shadow-xs flex items-center justify-center gap-1"
                title="Strictly for Platform Regulators & Administrators"
              >
                <span>{t('admin')} 🏛️</span>
              </Link>
            </div>
          </div>

          {errors.general && (
            <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormInput
              label={t('emailAddress')}
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email}
            />

            <FormInput
              label={t('password')}
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-accent-600 focus:ring-accent-500 border-slate-300 cursor-pointer"
                />
                <span>{t('rememberMe')}</span>
              </label>

              <button
                type="button"
                onClick={() => setInfoBanner("A password reset link will be sent to your registered email address.")}
                className="font-semibold text-accent-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {t('forgotPassword')}
              </button>
            </div>

            {infoBanner && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs rounded-xl flex items-center justify-between">
                <span>{infoBanner}</span>
                <button
                  type="button"
                  onClick={() => setInfoBanner(null)}
                  className="font-bold ml-2 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center font-bold shadow-md shadow-accent-500/20 mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {t('login')} ({roleHint === 'customer' ? t('customer') : roleHint === 'worker' ? t('proWorker') : t('administrator')})
            </Button>
          </form>
        </Card>

        {/* Footer links */}
        <div className="text-center text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <p>{t('dontHaveAccount')}</p>
          <div className="flex items-center justify-center gap-3 font-bold text-xs text-accent-600 dark:text-amber-400">
            <Link to="/register/customer" className="hover:underline">
              {t('customerHub')}
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/register/worker" className="hover:underline">
              {t('workerPortal')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
