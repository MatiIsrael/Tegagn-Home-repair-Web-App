import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, User, Briefcase, Mail, Lock, Phone, MapPin, AlertCircle, LogOut, ArrowRight } from 'lucide-react';
import { FormInput } from '../components/common/FormInput';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { authService } from '../services/api';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storedUser = authService.getStoredUser();

  const dashboardUrl = storedUser?.role === 'worker'
    ? '/worker/dashboard'
    : storedUser?.role === 'admin'
    ? '/admin'
    : '/customer/dashboard';

  // Automatically route logged-in users directly to their dashboard
  useEffect(() => {
    if (storedUser) {
      navigate(dashboardUrl, { replace: true });
    }
  }, [storedUser, navigate, dashboardUrl]);

  const [role, setRole] = useState<'customer' | 'worker'>(
    searchParams.get('role') === 'worker' ? 'worker' : 'customer'
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    trade: 'plumber',
    city: 'Addis Ababa',
    experienceYears: '3',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Email and password are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (role === 'worker') {
        await authService.registerWorker({
          email: formData.email.trim(),
          firstName: formData.firstName.trim() || 'Pro',
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phone.trim() || '+251 91 123 4567',
          trade: formData.trade,
          city: formData.city,
          experienceYears: Number(formData.experienceYears) || 3,
          password: formData.password,
        });
        navigate('/worker/dashboard');
      } else {
        await authService.registerCustomer({
          email: formData.email.trim(),
          firstName: formData.firstName.trim() || 'Customer',
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phone.trim() || '+251 91 123 4567',
          password: formData.password,
        });
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tradeOptions = [
    { value: 'plumber', label: 'Plumbing Specialist' },
    { value: 'electrician', label: 'Electrician' },
    { value: 'carpenter', label: 'Carpenter & Woodwork' },
    { value: 'painter', label: 'Painter & Decorator' },
    { value: 'builder', label: 'Mason / General Builder' },
    { value: 'hvac', label: 'HVAC & AC Service' },
    { value: 'locksmith', label: 'Locksmith' },
    { value: 'roofer', label: 'Roofer' },
  ];

  if (storedUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-amber-200 dark:border-amber-800 dark:bg-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20 shadow-xs">
            <User className="w-8 h-8" />
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
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out to Register Another Account</span>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-center text-accent-500 mx-auto shadow-lg mb-4">
            <Wrench className="w-6 h-6 text-accent-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            Create Your Tegagn Account
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Join thousands of homeowners and independent trade professionals.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/register/customer"
            className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
              role === 'customer'
                ? 'border-accent-500 bg-accent-50/50 text-navy-950 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              role === 'customer' ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-navy-950">Customer</div>
              <div className="text-xs text-slate-500">I want to hire pros</div>
            </div>
          </Link>

          <Link
            to="/register/worker"
            className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
              role === 'worker'
                ? 'border-accent-500 bg-accent-50/50 text-navy-950 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              role === 'worker' ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-navy-950">Trade Pro</div>
              <div className="text-xs text-slate-500">I offer repair services</div>
            </div>
          </Link>
        </div>

        {/* Register Card */}
        <Card className="p-8 shadow-xl border-slate-200">
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                type="text"
                placeholder="Abebe"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />

              <FormInput
                label="Last Name"
                type="text"
                placeholder="Tadesse"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="abebe@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <FormInput
                label="Phone Number"
                type="tel"
                placeholder="+251 91 123 4567"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            {/* Worker-specific Fields */}
            {role === 'worker' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Professional Trade Credentials
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Primary Trade Craft"
                    options={tradeOptions}
                    value={formData.trade}
                    onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                  />

                  <FormInput
                    label="Years of Trade Experience"
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  />
                </div>

                <FormInput
                  label="City / Primary Service Region"
                  type="text"
                  placeholder="E.g. Addis Ababa (Bole, Kazanchis)"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                required
                id="terms"
                className="mt-1 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <label htmlFor="terms" className="text-xs text-slate-600">
                I agree to the <a href="#" className="text-brand-600 underline">Terms of Service</a>, marketplace code of conduct, and privacy policy.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-md shadow-brand-500/20"
            >
              Complete Registration as {role === 'customer' ? 'Customer' : 'Service Professional'}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};
