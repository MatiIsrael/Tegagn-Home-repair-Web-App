import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useThemeLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    navigate(`/workers?${params.toString()}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      
      {/* Soft decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10">
        
        {/* Subtle category badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Addis Ababa Home Repair Marketplace</span>
        </div>

        {/* Main Headline styled like EthioAgriConnect */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          {t('heroTitle')}{' '}
          <span className="text-emerald-600 dark:text-emerald-400 block sm:inline">
            {t('heroHighlight')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
          {t('heroSubtitle')}
        </p>

        {/* Action Buttons matching screenshot */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/workers"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 text-center cursor-pointer"
          >
            {t('exploreMarketplace')}
          </Link>

          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-600 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 font-bold text-base transition-all duration-200 text-center cursor-pointer"
          >
            {t('getStarted')}
          </Link>
        </div>

        {/* Sleek Minimal Search Bar */}
        <div className="pt-4 max-w-xl mx-auto w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 ml-3 shrink-0" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
            >
              {t('findButton')}
            </button>
          </form>
        </div>

        {/* Trust Points */}
        <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('verifiedBadge')}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('zeroBrokerage')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('rapidResponse')}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
