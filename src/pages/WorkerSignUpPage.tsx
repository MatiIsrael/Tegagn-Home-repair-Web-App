import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Award, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';
import { FormInput, FormTextarea } from '../components/common/FormInput';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface WorkerFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  trade?: string;
  tradeTitle?: string;
  hourlyRate?: string;
  experienceYears?: string;
  city?: string;
  serviceAreas?: string;
  bio?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
}

export const WorkerSignUpPage: React.FC = () => {
  const navigate = useNavigate();

  // React State: Form inputs controlled values
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    trade: 'plumber',
    tradeTitle: '',
    hourlyRate: '35',
    experienceYears: '5',
    city: 'Addis Ababa',
    serviceAreas: '',
    bio: '',
    certifications: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  // React State: Field validation errors dictionary
  const [errors, setErrors] = useState<WorkerFormErrors>({});
  // React State: Loading state while submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Array of trade craft options
  const tradeOptions = [
    { value: 'plumber', label: 'Plumbing Specialist' },
    { value: 'electrician', label: 'Electrical Work' },
    { value: 'construction', label: 'Construction & Masonry' },
    { value: 'painter', label: 'Painting & Finishing' },
    { value: 'carpenter', label: 'Carpentry & Woodwork' },
    { value: 'cleaning', label: 'Deep & Post-Repair Cleaning' },
    { value: 'hvac', label: 'HVAC & AC Technician' },
    { value: 'locksmith', label: 'Locksmith' },
    { value: 'roofer', label: 'Roofing Repairs' },
  ];

  // Validation function with clear conditions
  const validateWorkerForm = (): WorkerFormErrors => {
    const newErrors: WorkerFormErrors = {};
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_REGEX = /^[+]?[\d\s-]{9,15}$/;

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters.';
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters.';
    }

    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.phone.trim() || !PHONE_REGEX.test(formData.phone.trim())) {
      newErrors.phone = 'Valid phone number required for client calls.';
    }

    if (!formData.tradeTitle.trim() || formData.tradeTitle.trim().length < 4) {
      newErrors.tradeTitle = 'Headline must be at least 4 characters (e.g. Master Plumber).';
    }

    const rateNum = Number(formData.hourlyRate);
    if (isNaN(rateNum) || rateNum < 10 || rateNum > 300) {
      newErrors.hourlyRate = 'Standard hourly rate must be between $10 and $300.';
    }

    const expNum = Number(formData.experienceYears);
    if (isNaN(expNum) || expNum < 1 || expNum > 60) {
      newErrors.experienceYears = 'Experience must be between 1 and 60 years.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Operating city is required.';
    }

    if (!formData.serviceAreas.trim()) {
      newErrors.serviceAreas = 'Specify at least one coverage neighborhood.';
    }

    if (!formData.bio.trim() || formData.bio.trim().length < 20) {
      newErrors.bio = 'Bio must be at least 20 characters describing your trade experience.';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must agree to the Trade Professional Code of Conduct.';
    }

    return newErrors;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof WorkerFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateWorkerForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    // Simulate real client-side worker onboarding transition (mock data only)
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/worker/dashboard');
    }, 700);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-center text-accent-500 mx-auto shadow-lg mb-4">
            <Briefcase className="w-6 h-6 text-accent-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            Register as a Trade Professional
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Connect directly with homeowners, set your own rates, and receive scheduled booking requests.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 shadow-xl border-slate-200">
          
          {hasErrors && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Please correct the highlighted fields:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* 1. Personal & Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Personal & Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  type="text"
                  placeholder="Abebe"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={errors.firstName}
                />

                <FormInput
                  label="Last Name"
                  type="text"
                  placeholder="Tadesse"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="abebe@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email}
                />

                <FormInput
                  label="Contact Phone Number"
                  type="tel"
                  placeholder="+251 91 123 4567"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={errors.phone}
                />
              </div>
            </div>

            {/* 2. Trade Qualifications & Pricing */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Trade Craft, Rate & Coverage
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Trade Craft"
                  options={tradeOptions}
                  value={formData.trade}
                  onChange={(e) => handleInputChange('trade', e.target.value)}
                />

                <FormInput
                  label="Professional Title / Headline"
                  type="text"
                  placeholder="Master Plumber & Pipe Specialist"
                  required
                  value={formData.tradeTitle}
                  onChange={(e) => handleInputChange('tradeTitle', e.target.value)}
                  error={errors.tradeTitle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Standard Hourly Rate ($ USD / hr)"
                  type="number"
                  min="10"
                  max="300"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  error={errors.hourlyRate}
                />

                <FormInput
                  label="Years of Hands-on Experience"
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                  error={errors.experienceYears}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="City"
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={errors.city}
                />

                <FormInput
                  label="Service Neighborhoods (comma-separated)"
                  type="text"
                  placeholder="Bole, Kazanchis, Sarbet, CMC"
                  required
                  value={formData.serviceAreas}
                  onChange={(e) => handleInputChange('serviceAreas', e.target.value)}
                  error={errors.serviceAreas}
                />
              </div>

              <FormTextarea
                label="Trade Bio / Experience Summary"
                rows={3}
                placeholder="Highlight your key skills, notable past projects, and customer satisfaction approach..."
                required
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                error={errors.bio}
                helperText="Minimum 20 characters"
              />

              <FormInput
                label="Licenses or Trade Certificates (Optional)"
                type="text"
                placeholder="E.g. Master Plumber Level IV, OSHA Safety Certificate"
                value={formData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                leftIcon={<Award className="w-4 h-4" />}
              />
            </div>

            {/* 3. Security Credentials */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Account Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Min 8 characters"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password}
                />

                <FormInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    className={`mt-0.5 rounded focus:ring-accent-500 cursor-pointer ${
                      errors.termsAccepted ? 'border-rose-400' : 'border-slate-300 text-accent-600'
                    }`}
                  />
                  <span>
                    I agree to the <a href="#" className="text-accent-600 underline">Service Professional Code of Conduct</a>, quality workmanship guarantee, and marketplace terms.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-xs text-rose-600 mt-1 pl-6">{errors.termsAccepted}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center font-bold shadow-md shadow-accent-500/20"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Submit Worker Registration
            </Button>
          </form>

          {/* Quick switcher to Customer Sign Up */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Looking to hire a professional instead?</span>
            <Link to="/register/customer" className="font-bold text-accent-600 hover:text-accent-700">
              Sign up as a Customer &rarr;
            </Link>
          </div>
        </Card>

        {/* Existing account link */}
        <p className="text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-navy-950 hover:text-accent-600">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
};
