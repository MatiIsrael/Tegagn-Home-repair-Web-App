import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  CheckCircle2, 
  Shield, 
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/common/Button';
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
    <div className="pb-16 sm:pb-24">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-16 pb-24 lg:pt-28 lg:pb-36 border-b border-navy-800">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-accent-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            
            {/* Category tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-800/90 border border-navy-700 text-accent-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
              <Shield className="w-4 h-4 text-accent-500" />
              <span>Addis Ababa Home Repair Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              {t('heroTitle')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                {t('heroHighlight')}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>

            {/* Clean Unified Search Bar */}
            <div className="pt-2">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto"
                aria-label="Search professionals"
              >
                <div className="flex-1 flex items-center px-4 py-2">
                  <Search className="w-5 h-5 text-accent-600 dark:text-amber-400 shrink-0 mr-3" />
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="shrink-0 font-bold px-8 shadow-md"
                >
                  {t('findButton')}
                </Button>
              </form>
            </div>

            {/* Direct Action Link */}
            <div className="pt-2">
              <Link to="/workers">
                <Button 
                  variant="outline" 
                  size="md" 
                  icon={<ArrowRight className="w-4 h-4" />} 
                  iconPosition="right"
                  className="border-navy-700 hover:bg-navy-800 text-slate-200 hover:text-white"
                >
                  {t('findPros')}
                </Button>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-navy-800/70 text-xs text-slate-300 max-w-2xl mx-auto">
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

    </div>
  );
};
