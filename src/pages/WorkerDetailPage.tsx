import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Briefcase, 
  Calendar, 
  Award, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ShieldAlert,
  Send
} from 'lucide-react';
import { WorkerProfile } from '../types';
import { workerService } from '../services/api';
import { RatingStars } from '../components/common/RatingStars';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { FormInput, FormTextarea } from '../components/common/FormInput';
import { WorkerReviews } from '../components/workers/WorkerReviews';

export const WorkerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(searchParams.get('action') === 'book');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '10:00 AM',
    serviceDescription: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      workerService.getWorkerById(id)
        .then((data) => setWorker(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const validateBooking = () => {
    const errs: Record<string, string> = {};
    const PHONE_REGEX = /^[+]?[\d\s-]{9,15}$/;

    if (!bookingForm.date) {
      errs.date = 'Appointment date is required.';
    } else {
      const selected = new Date(bookingForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errs.date = 'Date cannot be in the past.';
      }
    }

    if (!bookingForm.time.trim()) {
      errs.time = 'Preferred arrival time is required.';
    }

    if (!bookingForm.serviceDescription.trim() || bookingForm.serviceDescription.trim().length < 15) {
      errs.serviceDescription = 'Please describe the problem in at least 15 characters.';
    }

    if (!bookingForm.customerName.trim() || bookingForm.customerName.trim().length < 2) {
      errs.customerName = 'Full name is required.';
    }

    if (!bookingForm.customerPhone.trim() || !PHONE_REGEX.test(bookingForm.customerPhone.trim())) {
      errs.customerPhone = 'Valid phone number required for technician confirmation.';
    }

    if (!bookingForm.customerAddress.trim()) {
      errs.customerAddress = 'Service location / street address is required.';
    }

    return errs;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBooking();
    if (Object.keys(errs).length > 0) {
      setBookingErrors(errs);
      return;
    }

    // Frontend foundation: display confirmation banner ready for Django POST /api/v1/bookings/
    setBookingErrors({});
    setBookingSubmitted(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
          <div className="h-64 bg-slate-200 rounded-3xl" />
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-20 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Worker Not Found</h2>
        <p className="text-slate-500 mb-6">
          The requested service professional profile could not be found or may have been unlisted.
        </p>
        <Link to="/workers">
          <Button variant="primary">Return to Workers Directory</Button>
        </Link>
      </div>
    );
  }

  const { user } = worker;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/workers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to all professionals</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Card */}
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative shrink-0">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
                />
                {worker.isVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow text-brand-600"
                    title="Verified Professional"
                  >
                    <CheckCircle className="w-6 h-6 fill-brand-600 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="trade">{worker.trade}</Badge>
                  {worker.isAvailable ? (
                    <Badge variant="available" size="sm">Available for Hire</Badge>
                  ) : (
                    <Badge variant="busy" size="sm">Currently Booked</Badge>
                  )}
                  {worker.isVerified && (
                    <Badge variant="verified" size="sm">ID & Background Verified</Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm font-medium text-slate-600 mt-1">
                  {worker.tradeTitle}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{worker.city}</span>
                </div>

                {/* Rating line */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-sm">
                  <RatingStars rating={worker.rating} reviewsCount={worker.reviewsCount} size="md" />
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 text-xs font-medium">
                    <strong className="text-slate-900">{worker.completedJobs}</strong> verified jobs
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 text-xs font-medium">
                    <strong className="text-slate-900">{worker.experienceYears}</strong> years in trade
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* About & Bio */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About the Professional</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {worker.bio}
            </p>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Service Areas in City
              </h3>
              <div className="flex flex-wrap gap-2">
                {worker.serviceAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium"
                  >
                    📍 {area}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Skills & Specializations */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Skills & Trade Specialties</h2>
            <div className="flex flex-wrap gap-2.5">
              {worker.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-50 border border-brand-200/60 text-brand-800 text-xs font-semibold"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>

            {/* Certifications */}
            {worker.certifications && worker.certifications.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-600" />
                  <span>Trade Licenses & Certifications</span>
                </h3>
                <ul className="space-y-2">
                  {worker.certifications.map((cert, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Work Portfolio */}
          {worker.portfolio && worker.portfolio.length > 0 && (
            <Card className="p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Recent Completed Projects</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {worker.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="group border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <div className="p-3.5">
                      <h4 className="font-semibold text-sm text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Reviews Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Verified Client Reviews</h2>
            <WorkerReviews
              reviews={worker.reviews || []}
              overallRating={worker.rating}
              totalReviews={worker.reviewsCount}
            />
          </div>

        </div>

        {/* Right Sidebar: Booking & Contact Action Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          
          <Card className="p-6 shadow-md border-slate-200 space-y-6">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Standard Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900">${worker.hourlyRate}</span>
                  <span className="text-sm text-slate-500">/ hour</span>
                </div>
              </div>

              {worker.isAvailable ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Open for work
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  Currently busy
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Response time: Usually within 1 hour</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Transparent billing: No upfront booking fees</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Satisfaction guarantee with Tegagn dispute resolution</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-lg shadow-brand-500/25"
                icon={<Calendar className="w-4 h-4" />}
                onClick={() => setIsBookingModalOpen(true)}
              >
                Schedule & Book Now
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${user.phoneNumber || '+251911234567'}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-center" icon={<Phone className="w-3.5 h-3.5" />}>
                    Call Pro
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  icon={<Mail className="w-3.5 h-3.5" />}
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Send Message
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Direct connection without third-party commission gouging.
            </p>
          </Card>

          {/* Safety & Trust Box */}
          <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-semibold text-slate-800">Tegagn Trust Standard</h4>
            <p>
              Workers undergo identity verification before taking requests on our marketplace. Always confirm repair requirements before work begins.
            </p>
          </div>

        </div>

      </div>

      {/* Booking / Service Request Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingSubmitted(false);
        }}
        title={`Book ${user.firstName} ${user.lastName}`}
        maxWidth="lg"
      >
        {bookingSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Service Request Created!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your service request for <strong>{bookingForm.serviceDescription || 'Home repair service'}</strong> has been registered. The worker will review and confirm availability.
            </p>
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs text-center max-w-sm mx-auto">
              ✓ Booking notification sent to technician. You can track status anytime.
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/customer/dashboard">
                <Button variant="accent">
                  Go to Customer Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingSubmitted(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs text-slate-700">
              <span>Trade: <strong>{worker.trade}</strong></span>
              <span>Rate: <strong>${worker.hourlyRate}/hr</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Preferred Date"
                type="date"
                required
                value={bookingForm.date}
                onChange={(e) => {
                  setBookingForm({ ...bookingForm, date: e.target.value });
                  if (bookingErrors.date) setBookingErrors(prev => ({ ...prev, date: '' }));
                }}
                error={bookingErrors.date}
              />

              <FormInput
                label="Preferred Time"
                type="text"
                placeholder="E.g. 10:00 AM"
                required
                value={bookingForm.time}
                onChange={(e) => {
                  setBookingForm({ ...bookingForm, time: e.target.value });
                  if (bookingErrors.time) setBookingErrors(prev => ({ ...prev, time: '' }));
                }}
                error={bookingErrors.time}
              />
            </div>

            <FormTextarea
              label="Describe the issue / job required"
              rows={3}
              placeholder="E.g. Leaking pipe under bathroom sink, water turns off slowly..."
              required
              value={bookingForm.serviceDescription}
              onChange={(e) => {
                setBookingForm({ ...bookingForm, serviceDescription: e.target.value });
                if (bookingErrors.serviceDescription) setBookingErrors(prev => ({ ...prev, serviceDescription: '' }));
              }}
              error={bookingErrors.serviceDescription}
              helperText="Min 15 characters"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Your Full Name"
                type="text"
                placeholder="John Doe"
                required
                value={bookingForm.customerName}
                onChange={(e) => {
                  setBookingForm({ ...bookingForm, customerName: e.target.value });
                  if (bookingErrors.customerName) setBookingErrors(prev => ({ ...prev, customerName: '' }));
                }}
                error={bookingErrors.customerName}
              />

              <FormInput
                label="Your Contact Phone"
                type="tel"
                placeholder="+251 91 123 4567"
                required
                value={bookingForm.customerPhone}
                onChange={(e) => {
                  setBookingForm({ ...bookingForm, customerPhone: e.target.value });
                  if (bookingErrors.customerPhone) setBookingErrors(prev => ({ ...prev, customerPhone: '' }));
                }}
                error={bookingErrors.customerPhone}
              />
            </div>

            <FormInput
              label="Job Location / Street Address"
              type="text"
              placeholder="Neighborhood, building / house number"
              required
              value={bookingForm.customerAddress}
              onChange={(e) => {
                setBookingForm({ ...bookingForm, customerAddress: e.target.value });
                if (bookingErrors.customerAddress) setBookingErrors(prev => ({ ...prev, customerAddress: '' }));
              }}
              error={bookingErrors.customerAddress}
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<Send className="w-4 h-4" />}>
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
