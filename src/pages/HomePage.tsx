import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Wrench, 
  Zap, 
  HardHat, 
  Paintbrush, 
  Hammer, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Shield, 
  UserCheck, 
  Briefcase, 
  HelpCircle,
  Info
} from 'lucide-react';
import { PLACEHOLDER_WORKERS } from '../data/mockData';
import { WorkerCard } from '../components/workers/WorkerCard';
import { Button } from '../components/common/Button';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useThemeLanguage();
  const [serviceCategory, setServiceCategory] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (serviceCategory && serviceCategory !== 'all') {
      params.set('category', serviceCategory);
    }
    if (locationQuery.trim()) {
      params.set('search', locationQuery.trim());
    }
    navigate(`/workers?${params.toString()}`);
  };

  // The core home services with dynamic translations
  const coreServices = [
    {
      id: 'srv-plumbing',
      slug: 'plumber',
      title: t('plumbing'),
      description: 'Leak detection, pipe repairs, faucet installation, water heaters & drain snaking.',
      icon: <Wrench className="w-6 h-6 text-accent-500" />,
      popular: ['Leak Repair', 'Pipe Replacement', 'Water Heater', 'Toilet Installation'],
    },
    {
      id: 'srv-electrical',
      slug: 'electrician',
      title: t('electrical'),
      description: 'Breaker panels, wiring diagnostics, lighting fixtures & short-circuit resolution.',
      icon: <Zap className="w-6 h-6 text-accent-500" />,
      popular: ['Short Circuit Fix', 'Breaker Box', 'Lighting Setup', 'Wiring Inspection'],
    },
    {
      id: 'srv-construction',
      slug: 'construction',
      title: t('construction'),
      description: 'Masonry repairs, structural plastering, tile installation, brickwork & home extensions.',
      icon: <HardHat className="w-6 h-6 text-accent-500" />,
      popular: ['Tile Setting', 'Wall Plaster', 'Masonry Repair', 'Concrete Patching'],
    },
    {
      id: 'srv-painting',
      slug: 'painter',
      title: t('painting'),
      description: 'Interior & exterior wall painting, waterproof coatings, surface sanding & trim refinishing.',
      icon: <Paintbrush className="w-6 h-6 text-accent-500" />,
      popular: ['Interior Walls', 'Exterior Coating', 'Ceiling Paint', 'Waterproofing'],
    },
    {
      id: 'srv-carpentry',
      slug: 'carpenter',
      title: t('carpentry'),
      description: 'Custom cabinetry, door & lock framing, furniture repair, shelving & woodwork.',
      icon: <Hammer className="w-6 h-6 text-accent-500" />,
      popular: ['Custom Cabinets', 'Door Framing', 'Hardwood Trim', 'Furniture Repair'],
    },
    {
      id: 'srv-cleaning',
      slug: 'cleaning',
      title: t('cleaning'),
      description: 'Deep house cleaning, post-repair dust removal, window cleaning & sanitation.',
      icon: <Sparkles className="w-6 h-6 text-accent-500" />,
      popular: ['Post-Repair Cleanup', 'Deep Home Cleaning', 'Floor Scrubbing', 'Sanitization'],
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-navy-800">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-accent-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Category tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-800/90 border border-navy-700 text-accent-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
              <Shield className="w-4 h-4 text-accent-500" />
              <span>Addis Ababa Home Repair Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              {t('heroTitle')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                {t('heroHighlight')}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>

            {/* Service & Location Search Form */}
            <div className="pt-4">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row gap-2.5 max-w-2xl mx-auto"
                aria-label="Service and location search form"
              >
                {/* Service Dropdown */}
                <div className="flex-1 flex items-center px-3.5 py-1.5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                  <Search className="w-5 h-5 text-accent-600 dark:text-amber-400 shrink-0 mr-3" />
                  <div className="w-full text-left">
                    <label htmlFor="service-select" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('popularServices')}
                    </label>
                    <select
                      id="service-select"
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">{t('allTrades')}...</option>
                      <option value="plumber" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">{t('plumbing')}</option>
                      <option value="electrician" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">{t('electrical')}</option>
                      <option value="construction" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">{t('construction')}</option>
                      <option value="painter" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">{t('painting')}</option>
                      <option value="carpenter" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">{t('carpentry')}</option>
                      <option value="cleaning" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">{t('cleaning')}</option>
                    </select>
                  </div>
                </div>

                {/* Location Input */}
                <div className="flex-1 flex items-center px-3.5 py-1.5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                  <MapPin className="w-5 h-5 text-accent-600 dark:text-amber-400 shrink-0 mr-3" />
                  <div className="w-full text-left">
                    <label htmlFor="location-input" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('locationLabel')}
                    </label>
                    <input
                      id="location-input"
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder={t('searchPlaceholder')}
                      className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit CTA Button */}
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="shrink-0 font-bold px-7"
                >
                  {t('findButton')}
                </Button>
              </form>
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
              <span className="text-slate-400 font-medium">Popular:</span>
              {[
                { label: 'Plumbing / ቧንቧ', cat: 'plumber' },
                { label: 'Electrician / ኤሌክትሪክ', cat: 'electrician' },
                { label: 'Carpentry / አናፂ', cat: 'carpenter' },
                { label: 'Tile & Masonry / ግንባታ', cat: 'construction' },
                { label: 'Painting / ቀለም ቅብ', cat: 'painter' },
                { label: 'Cleaning / ፅዳት', cat: 'cleaning' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setServiceCategory(item.cat);
                    navigate(`/workers?category=${item.cat}`);
                  }}
                  className="px-2.5 py-1 rounded-full bg-navy-800/80 hover:bg-navy-700 text-slate-200 hover:text-white border border-navy-700 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Trust Points Under Hero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-navy-800/70 text-xs text-slate-300 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-500" />
                <span>{t('verifiedBadge')}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-500" />
                <span>{t('zeroBrokerage')}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-500" />
                <span>{t('rapidResponse')}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CORE SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 dark:bg-slate-800 text-accent-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Specialized Crafts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 dark:text-white tracking-tight">
            {t('popularServices')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
            Select a service category to discover local professionals equipped for both emergency repairs and routine installations.
          </p>
        </div>

        {/* 6 Core Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreServices.map((service) => (
            <Link
              key={service.id}
              to={`/workers?category=${service.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-accent-500 dark:hover:border-amber-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-navy-50 dark:bg-slate-800 border border-navy-100 dark:border-slate-700 flex items-center justify-center group-hover:bg-accent-500/10 group-hover:border-accent-500/30 transition-colors mb-5">
                  {service.icon}
                </div>

                <h3 className="text-xl font-bold text-navy-950 dark:text-white group-hover:text-accent-600 dark:group-hover:text-amber-400 transition-colors">
                  {service.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Popular service tags */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {service.popular.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-navy-900 dark:text-slate-200 group-hover:text-accent-600 dark:group-hover:text-amber-400">
                <span>View {service.title}</span>
                <span className="text-accent-500 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED WORKER CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-100 dark:bg-slate-800 text-navy-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Info className="w-3.5 h-3.5 text-accent-600 dark:text-amber-400" />
              <span>{t('verifiedLocalPros')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
              {t('featuredProsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {t('featuredProsSubtitle')}
            </p>
          </div>

          <Link to="/workers">
            <Button variant="outline" size="md" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              {t('findPros')}
            </Button>
          </Link>
        </div>

        {/* Worker Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLACEHOLDER_WORKERS.slice(0, 6).map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="bg-navy-950 text-white py-16 sm:py-24 border-y border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-800 text-accent-400 text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-accent-500" />
              <span>{t('simpleProcess')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              {t('howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-navy-900/80 p-6 rounded-2xl border border-navy-800 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-md shadow-accent-500/20">
                  1
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('step1Title')}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {t('step1Desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-navy-800/80 text-[11px] text-accent-400 font-semibold">
                {t('step1Badge')}
              </div>
            </div>

            <div className="bg-navy-900/80 p-6 rounded-2xl border border-navy-800 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-md shadow-accent-500/20">
                  2
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('step2Title')}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {t('step2Desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-navy-800/80 text-[11px] text-accent-400 font-semibold">
                {t('step2Badge')}
              </div>
            </div>

            <div className="bg-navy-900/80 p-6 rounded-2xl border border-navy-800 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-md shadow-accent-500/20">
                  3
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('step3Title')}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {t('step3Desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-navy-800/80 text-[11px] text-accent-400 font-semibold">
                {t('step3Badge')}
              </div>
            </div>

            <div className="bg-navy-900/80 p-6 rounded-2xl border border-navy-800 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-md shadow-accent-500/20">
                  4
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('step4Title')}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {t('step4Desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-navy-800/80 text-[11px] text-accent-400 font-semibold">
                {t('step4Badge')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS FOR CUSTOMERS AND WORKERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 dark:bg-slate-800 text-accent-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>{t('marketplaceValue')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 dark:text-white tracking-tight">
            {t('designedForBoth')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
            {t('designedForBothSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card: Benefits for Customers */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-navy-50 dark:bg-slate-800 text-navy-900 dark:text-white flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-accent-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-navy-950 dark:text-white">{t('benefitsCustomers')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('benefitsCustomersSub')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-navy-950 dark:text-white">{t('benefitCust1Title')}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {t('benefitCust1Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-navy-950 dark:text-white">{t('benefitCust2Title')}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {t('benefitCust2Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-navy-950 dark:text-white">{t('benefitCust3Title')}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {t('benefitCust3Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link to="/workers">
                <Button variant="navy" size="md" className="w-full justify-center">
                  {t('findPros')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Card: Benefits for Workers */}
          <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-10 border border-navy-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-navy-900 text-accent-400 flex items-center justify-center border border-navy-800">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t('benefitsWorkers')}</h3>
                  <p className="text-xs text-slate-400">{t('benefitsWorkersSub')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{t('benefitWork1Title')}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      {t('benefitWork1Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-4 text-accent-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{t('benefitWork2Title')}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      {t('benefitWork2Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{t('benefitWork3Title')}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      {t('benefitWork3Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-navy-800">
              <Link to="/register?role=worker">
                <Button variant="accent" size="md" className="w-full justify-center">
                  {t('register')}
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. CALL-TO-ACTION (CTA) SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl p-8 sm:p-14 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl border border-navy-800 relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl text-center lg:text-left relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-400">
              {t('getStartedToday')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {t('ctaTitle')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {t('ctaSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 relative z-10 w-full sm:w-auto">
            <Link to="/workers" className="w-full sm:w-auto">
              <Button variant="accent" size="lg" className="w-full justify-center font-bold">
                {t('findPros')}
              </Button>
            </Link>
            <Link to="/register?role=worker" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full justify-center border-slate-600 text-white hover:bg-white/10 font-bold">
                {t('register')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
