import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FormInput } from '../components/common/FormInput';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // React State: Controlled inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleHint, setRoleHint] = useState<'customer' | 'worker' | 'admin'>('customer');
  const [rememberMe, setRememberMe] = useState(false);

  // React State: Validation errors & loading state
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email format regular expression variable
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation function with conditions
  const validateLogin = () => {
    const errs: { email?: string; password?: string } = {};

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

  // Event handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    // Simulate real client-side login transition
    setTimeout(() => {
      setIsSubmitting(false);
      if (roleHint === 'customer') {
        navigate('/customer/dashboard');
      } else if (roleHint === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/admin');
      }
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-center text-accent-500 mx-auto shadow-lg mb-4">
            <Wrench className="w-6 h-6 text-accent-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            Sign In to Tegagn
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Access your bookings, active job inquiries, or platform administration hub.
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-xl border-slate-200">
          
          {/* Persona selector tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold" role="tablist">
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
                      : 'text-slate-600 hover:text-navy-950 hover:bg-white/50'
                  }`}
                >
                  {role === 'customer' ? 'Customer' : 'Pro Worker'}
                </button>
              ))}
              <Link
                to="/admin/login"
                className="py-2 rounded-lg transition-all text-center capitalize cursor-pointer bg-slate-900 hover:bg-sky-950 text-sky-400 border border-sky-800/40 hover:border-sky-500/60 font-black shadow-xs flex items-center justify-center gap-1"
                title="Strictly for Platform Regulators & Administrators"
              >
                <span>Admin 🏛️</span>
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormInput
              label="Email Address"
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
              label="Password"
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
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-accent-600 focus:ring-accent-500 border-slate-300 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Password reset link will be sent via Django REST auth endpoint.")}
                className="font-semibold text-accent-600 hover:text-accent-700 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center font-bold shadow-md shadow-accent-500/20 mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In as {roleHint === 'customer' ? 'Customer' : roleHint === 'worker' ? 'Pro Worker' : 'Administrator'}
            </Button>
          </form>

          {/* Architecture notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-navy-50/60 p-3 rounded-xl text-xs text-navy-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Django JWT Auth Pipeline Ready</p>
              <p className="text-slate-500 mt-0.5">
                Target endpoint: <code>POST /api/v1/auth/token/</code> with email & password payload.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer links */}
        <div className="text-center text-sm text-slate-600 space-y-1">
          <p>Don't have an account yet?</p>
          <div className="flex items-center justify-center gap-3 font-bold text-xs text-accent-600">
            <Link to="/register/customer" className="hover:text-accent-700 underline">
              Customer Sign Up
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/register/worker" className="hover:text-accent-700 underline">
              Worker Sign Up
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
