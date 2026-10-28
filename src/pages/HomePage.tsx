import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  Shield, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
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

      {/* 2. HOW IT WORKS SECTION */}
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

          <div className="mt-12 text-center">
            <Link to="/workers">
              <Button variant="accent" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" className="font-bold px-8 shadow-lg shadow-accent-500/20">
                {t('findPros')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
