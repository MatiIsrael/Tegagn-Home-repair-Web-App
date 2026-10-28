import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Users
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const HomePage: React.FC = () => {
  const { t } = useThemeLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8">
        
        {/* Soft warm decorative background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10">
          
          {/* Category badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t('heroBadge')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {t('heroTitle')}{' '}
            <span className="text-amber-500 dark:text-amber-400 block sm:inline">
              {t('heroHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            {t('heroSubtitle')}
          </p>

          {/* Two Prominent Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/workers"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-base shadow-md hover:shadow-lg shadow-amber-500/20 transition-all duration-200 text-center cursor-pointer"
            >
              {t('exploreMarketplace')}
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-2 border-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 font-bold text-base transition-all duration-200 text-center cursor-pointer"
            >
              {t('getStarted')}
            </Link>
          </div>

        </div>
      </section>

      {/* 2. THREE FEATURE CARDS SECTION (Matching Image 2) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Verified & Local */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 border border-amber-200/60 dark:border-amber-800/50">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('card1Title')}
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('card1Desc')}
              </p>
            </div>
          </div>

          {/* Card 2: Fair Prices */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 border border-amber-200/60 dark:border-amber-800/50">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('card2Title')}
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('card2Desc')}
              </p>
            </div>
          </div>

          {/* Card 3: Support Community */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 border border-amber-200/60 dark:border-amber-800/50">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('card3Title')}
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('card3Desc')}
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
