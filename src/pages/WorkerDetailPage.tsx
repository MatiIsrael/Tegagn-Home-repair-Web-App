import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
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
  Send,
  Lock,
  LogIn,
  UserPlus,
  Camera,
  Navigation,
  ExternalLink,
  X
} from 'lucide-react';
import { WorkerProfile } from '../types';
import { workerService, authService, bookingService } from '../services/api';
import { RatingStars } from '../components/common/RatingStars';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { FormInput, FormTextarea } from '../components/common/FormInput';
import { WorkerReviews } from '../components/workers/WorkerReviews';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const WorkerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useThemeLanguage();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth state for customer booking gating
  const [storedUser, setStoredUser] = useState(() => authService.getStoredUser());
  const isCustomerLoggedIn = Boolean(storedUser && storedUser.role === 'customer');

  useEffect(() => {
    const handleAuthChange = () => setStoredUser(authService.getStoredUser());
    window.addEventListener('tegagn_auth_changed', handleAuthChange);
    return () => window.removeEventListener('tegagn_auth_changed', handleAuthChange);
  }, []);
  
  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(searchParams.get('action') === 'book');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '10:00 AM',
    serviceDescription: '',
    customerName: storedUser?.firstName ? `${storedUser.firstName}${storedUser.lastName ? ` ${storedUser.lastName}` : ''}`.trim() : '',
    customerPhone: storedUser?.phoneNumber || '',
    customerAddress: 'Bole, Addis Ababa',
    lat: 9.0084,
    lng: 38.7891,
    images: [] as string[]
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setBookingForm(prev => ({
            ...prev,
            images: [...prev.images, result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setBookingForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBookingForm(prev => ({
            ...prev,
            lat: parseFloat(position.coords.latitude.toFixed(4)),
            lng: parseFloat(position.coords.longitude.toFixed(4))
          }));
        },
        () => {
          setBookingForm(prev => ({ ...prev, lat: 9.0084, lng: 38.7891 }));
        }
      );
    }
  };

  const handleInitiateBooking = () => {
    const currentStoredUser = authService.getStoredUser();
    if (!currentStoredUser || currentStoredUser.role !== 'customer') {
      const returnUrl = `/workers/${id}?action=book`;
      navigate(`/customer/login?redirect=${encodeURIComponent(returnUrl)}&notice=booking_required`);
      return;
    }
    setIsBookingModalOpen(true);
  };

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
    const currentStoredUser = authService.getStoredUser();
    if (!currentStoredUser || currentStoredUser.role !== 'customer') {
      const returnUrl = `/workers/${id}?action=book`;
      navigate(`/customer/login?redirect=${encodeURIComponent(returnUrl)}&notice=booking_required`);
      return;
    }

    const errs = validateBooking();
    if (Object.keys(errs).length > 0) {
      setBookingErrors(errs);
      return;
    }

    setBookingErrors({});

    if (worker) {
      bookingService.createBooking({
        customerId: currentStoredUser.id,
        customerName: bookingForm.customerName,
        customerPhone: bookingForm.customerPhone,
        workerId: worker.id,
        workerName: `${worker.user.firstName} ${worker.user.lastName}`,
        workerTrade: worker.tradeTitle,
        serviceDescription: bookingForm.serviceDescription,
        scheduledDate: bookingForm.date,
        scheduledTime: bookingForm.time,
        location: bookingForm.customerAddress,
        gpsCoordinates: {
          lat: bookingForm.lat,
          lng: bookingForm.lng,
          label: bookingForm.customerAddress
        },
        images: bookingForm.images,
        estimatedCost: worker.hourlyRate * 2,
        notes: bookingForm.serviceDescription,
      });
    }

    setBookingSubmitted(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('noWorkersFound')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {t('noWorkersDesc')}
        </p>
        <Link to="/workers">
          <Button variant="primary">{t('backToPros')}</Button>
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('backToPros')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Card */}
          <Card className="p-6 sm:p-8 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative shrink-0">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md"
                />
                {worker.isVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow text-brand-600"
                    title={t('verifiedPro')}
                  >
                    <CheckCircle className="w-6 h-6 fill-brand-600 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="trade">{t(worker.trade)}</Badge>
                  {worker.isAvailable ? (
                    <Badge variant="available" size="sm">{t('openForWork')}</Badge>
                  ) : (
                    <Badge variant="busy" size="sm">{t('currentlyBusy')}</Badge>
                  )}
                  {worker.isVerified && (
                    <Badge variant="verified" size="sm">{t('verifiedPro')}</Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                  {worker.tradeTitle}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-amber-400 shrink-0" />
                  <span>{worker.city}</span>
                </div>

                {/* Rating line */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-sm">
                  <RatingStars rating={worker.rating} reviewsCount={worker.reviewsCount} size="md" />
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                    <strong className="text-slate-900 dark:text-white">{worker.completedJobs}</strong> {t('verifiedJobs')}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                    <strong className="text-slate-900 dark:text-white">{worker.experienceYears}</strong> {t('yearsInTrade')}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* About & Bio */}
          <Card className="p-6 sm:p-8 space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('aboutProfessional')}</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {worker.bio}
            </p>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {t('serviceAreasCity')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {worker.serviceAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    📍 {area}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Skills & Specializations */}
          <Card className="p-6 sm:p-8 space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('skillsTradeSpecialties')}</h2>
            <div className="flex flex-wrap gap-2.5">
              {worker.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-50 dark:bg-slate-800 border border-brand-200/60 dark:border-slate-700 text-brand-800 dark:text-amber-400 text-xs font-semibold"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>

            {/* Certifications */}
            {worker.certifications && worker.certifications.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                  <span>{t('tradeLicenses')}</span>
                </h3>
                <ul className="space-y-2">
                  {worker.certifications.map((cert, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
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
            <Card className="p-6 sm:p-8 space-y-4 dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('recentCompletedProjects')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {worker.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <div className="p-3.5">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Reviews Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('verifiedClientReviews')}</h2>
            <WorkerReviews
              reviews={worker.reviews || []}
              overallRating={worker.rating}
              totalReviews={worker.reviewsCount}
            />
          </div>

        </div>

        {/* Right Sidebar: Booking & Contact Action Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          
          <Card className="p-6 shadow-md border-slate-200 dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{t('standardRate')}</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{worker.hourlyRate} ETB</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/ hr</span>
                </div>
              </div>

              {worker.isAvailable ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {t('openForWork')}
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {t('currentlyBusy')}
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-600 dark:text-amber-400 shrink-0" />
                <span>{t('responseTime')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-brand-600 dark:text-amber-400 shrink-0" />
                <span>{t('transparentBilling')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand-600 dark:text-amber-400 shrink-0" />
                <span>{t('satisfactionGuarantee')}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="accent"
                size="lg"
                className="w-full justify-center shadow-lg font-bold"
                icon={<Calendar className="w-4 h-4" />}
                onClick={handleInitiateBooking}
              >
                {t('scheduleBookNow')}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${user.phoneNumber || '+251917643789'}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-center" icon={<Phone className="w-3.5 h-3.5" />}>
                    {t('callPro')}
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  icon={<Mail className="w-3.5 h-3.5" />}
                  onClick={handleInitiateBooking}
                >
                  {t('sendMessage')}
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              {t('directConnectionWithout')}
            </p>
          </Card>

        </div>

      </div>

      {/* Booking / Service Request Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingSubmitted(false);
        }}
        title={`${t('bookAppointmentWith')} ${user.firstName} ${user.lastName}`}
        maxWidth="lg"
      >
        {!isCustomerLoggedIn ? (
          <div className="py-6 px-2 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('customerSignInRequired')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You can freely browse all professionals. To submit a service request or book <strong>{user.firstName} {user.lastName}</strong>, please sign in with your customer account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link 
                to={`/customer/login?redirect=${encodeURIComponent(`/workers/${worker.id}?action=book`)}&notice=booking_required`}
                className="w-full sm:w-auto"
              >
                <Button variant="accent" size="md" icon={<LogIn className="w-4 h-4" />} className="w-full justify-center font-bold">
                  {t('signInToCustomerHub')}
                </Button>
              </Link>
              <Link 
                to={`/customer/register?redirect=${encodeURIComponent(`/workers/${worker.id}?action=book`)}`}
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="md" icon={<UserPlus className="w-4 h-4" />} className="w-full justify-center font-semibold">
                  {t('createCustomerAccount')}
                </Button>
              </Link>
            </div>
          </div>
        ) : bookingSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('serviceRequestCreated')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Your service request for <strong>{bookingForm.serviceDescription || 'Home repair service'}</strong> has been registered. The worker will review and confirm availability.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/customer/dashboard">
                <Button variant="accent">
                  {t('goToDashboard')}
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingSubmitted(false);
                }}
              >
                {t('close')}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>{t('serviceCategory')}: <strong>{t(worker.trade)}</strong></span>
              <span>{t('rate')}: <strong>{worker.hourlyRate} ETB/hr</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label={t('preferredDate')}
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
                label={t('preferredTime')}
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
              label={t('describeIssueJob')}
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
                label={t('fullName')}
                type="text"
                placeholder="Abebe Bikila"
                required
                value={bookingForm.customerName}
                onChange={(e) => {
                  setBookingForm({ ...bookingForm, customerName: e.target.value });
                  if (bookingErrors.customerName) setBookingErrors(prev => ({ ...prev, customerName: '' }));
                }}
                error={bookingErrors.customerName}
              />

              <FormInput
                label={t('yourContactPhone')}
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
              label={t('jobLocation')}
              type="text"
              placeholder="Bole, Addis Ababa"
              required
              value={bookingForm.customerAddress}
              onChange={(e) => {
                setBookingForm({ ...bookingForm, customerAddress: e.target.value });
                if (bookingErrors.customerAddress) setBookingErrors(prev => ({ ...prev, customerAddress: '' }));
              }}
              error={bookingErrors.customerAddress}
            />

            {/* GPS Location & Map Integration */}
            <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-sky-800 dark:text-sky-300 font-bold uppercase tracking-wider block">
                    Exact GPS Pin for Worker Navigation:
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    📍 Lat: {bookingForm.lat}° N, Lng: {bookingForm.lng}° E
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Auto-Detect</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${bookingForm.lat},${bookingForm.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                  >
                    <ExternalLink className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    <span>Open Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Photo Upload for Problem */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Photos of the Issue (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Shows damage clearly</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">
                  <Camera className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                  <span>Take or Upload Photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {bookingForm.images.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ {bookingForm.images.length} photo(s) attached
                  </span>
                )}
              </div>

              {bookingForm.images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                  {bookingForm.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700 bg-slate-100 shadow-sm">
                      <img src={imgUrl} alt={`Issue ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingModalOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" variant="accent" icon={<Send className="w-4 h-4" />}>
                {t('submitRequest')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
