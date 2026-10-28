import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormInput } from '../components/common/FormInput';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { authService } from '../services/api';

interface CustomerFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  neighborhood?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
}

export const CustomerSignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/customer/dashboard';

  // React State: Controlled form inputs stored in a single state object
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Addis Ababa',
    neighborhood: 'Bole',
    password: '',
    confirmPassword: '',
    termsAccepted: true,
  });

  // React State: Specific field-level error messages
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  // React State: Form submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  // Regular expression variable for standard email validation
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Function: Validates all form fields and returns an errors object
  const validateForm = (): CustomerFormErrors => {
    const newErrors: CustomerFormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    // Email format validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password requirements (simple & clear: minimum 6 characters)
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    // Password matching check
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  // Event handler for controlled input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear error for this field if user starts fixing it
    if (errors[field as keyof CustomerFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Event handler: Form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.registerCustomer({
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phone.trim(),
        password: formData.password,
        city: formData.city,
        neighborhood: formData.neighborhood,
      });
      setIsSubmitting(false);
      navigate(redirectTarget);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrors(prev => ({ ...prev, email: err.message || 'Registration failed.' }));
    }
  };

  // Variables: determine if any validation errors are present
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-center text-accent-500 mx-auto shadow-lg mb-4">
            <User className="w-6 h-6 text-accent-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            Create Your Customer Account
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Book trusted local trade professionals for plumbing, electrical, carpentry, masonry, painting, and cleaning.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 shadow-xl border-slate-200">
          
          {hasErrors && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Please correct the highlighted errors below:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                type="text"
                placeholder="e.g. Bethlehem"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={errors.firstName}
              />

              <FormInput
                label="Last Name"
                type="text"
                placeholder="e.g. Assefa"
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
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email}
              />

              <FormInput
                label="Mobile Phone"
                type="tel"
                placeholder="+251 91 123 4567"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone}
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
                label="Neighborhood / Subcity"
                type="text"
                placeholder="E.g. Bole, Kazanchis, CMC"
                required
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                error={errors.neighborhood}
              />
            </div>

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
                helperText="Must contain at least one letter and one number"
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
                  I agree to the Tegagn <a href="#" className="text-accent-600 underline">Terms of Service</a> and marketplace privacy policy.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-xs text-rose-600 mt-1 pl-6">{errors.termsAccepted}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center font-bold mt-2 shadow-md shadow-accent-500/20"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Register as Customer
            </Button>
          </form>

          {/* Quick switcher to Worker Sign Up */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Are you a service professional?</span>
            <Link to="/register/worker" className="font-bold text-accent-600 hover:text-accent-700">
              Sign up as a Trade Worker &rarr;
            </Link>
          </div>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link 
            to={`/customer/login${redirectTarget !== '/customer/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`} 
            className="font-bold text-navy-950 hover:text-accent-600"
          >
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
};
