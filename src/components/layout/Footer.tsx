import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Shield, CheckCircle2, Phone, Mail, MapPin, ArrowRight, Send } from 'lucide-react';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export const Footer: React.FC = () => {
  const { t } = useThemeLanguage();

  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 mt-auto border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-navy-800/80">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-800 text-accent-500 flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">{t('directConnection')}</h4>
              <p className="text-sm text-slate-400">
                {t('directConnectionDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-800 text-accent-500 flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">{t('transparentRates')}</h4>
              <p className="text-sm text-slate-400">
                {t('transparentRatesDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-800 text-accent-500 flex items-center justify-center shrink-0 shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">{t('essentialTrades')}</h4>
              <p className="text-sm text-slate-400">
                {t('essentialTradesDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Brand info */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-accent-500">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">{t('brandName')}</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              {t('footerDesc')}
            </p>

            {/* Direct Official Contact Information */}
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-accent-500 shrink-0" />
                <span className="font-medium">{t('locationLabel')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-500 shrink-0" />
                <a 
                  href="tel:+251917643789" 
                  className="font-medium text-slate-200 hover:text-accent-400 transition-colors"
                >
                  +251917643789
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-500 shrink-0" />
                <a 
                  href="mailto:matiisrael63@gmail.com" 
                  className="font-medium text-slate-200 hover:text-accent-400 transition-colors"
                >
                  matiisrael63@gmail.com
                </a>
              </div>
              {/* Telegram Official Feature Channel */}
              <div className="pt-1">
                <a
                  href="https://t.me/CocaCola_factory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs font-bold transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram: @CocaCola_factory</span>
                </a>
              </div>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {t('popularServices')}
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/workers?category=plumber" className="hover:text-accent-400 transition-colors">
                  {t('plumbing')}
                </Link>
              </li>
              <li>
                <Link to="/workers?category=electrician" className="hover:text-accent-400 transition-colors">
                  {t('electrical')}
                </Link>
              </li>
              <li>
                <Link to="/workers?category=construction" className="hover:text-accent-400 transition-colors">
                  {t('construction')}
                </Link>
              </li>
              <li>
                <Link to="/workers?category=painter" className="hover:text-accent-400 transition-colors">
                  {t('painting')}
                </Link>
              </li>
              <li>
                <Link to="/workers?category=carpenter" className="hover:text-accent-400 transition-colors">
                  {t('carpentry')}
                </Link>
              </li>
              <li>
                <Link to="/workers?category=cleaning" className="hover:text-accent-400 transition-colors">
                  {t('cleaning')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {t('marketplace')}
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/workers" className="hover:text-accent-400 transition-colors">
                  {t('findPros')}
                </Link>
              </li>
              <li>
                <Link to="/register?role=worker" className="hover:text-accent-400 transition-colors flex items-center gap-1 text-accent-400 font-medium">
                  <span>{t('register')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="hover:text-accent-400 transition-colors">
                  {t('customerHub')}
                </Link>
              </li>
              <li>
                <Link to="/worker/dashboard" className="hover:text-accent-400 transition-colors">
                  {t('workerPortal')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent-400 transition-colors">
                  {t('adminPortal')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Telegram Feature & Support Card */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {t('officialTelegram')}
            </h5>
            <div className="p-3.5 bg-navy-900/90 rounded-xl border border-navy-800 text-xs space-y-2.5 text-slate-300">
              <div className="flex items-center gap-2 text-white font-bold">
                <Send className="w-4 h-4 text-[#229ED9]" />
                <span>{t('joinOnTelegram')}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {t('telegramDesc')}
              </p>
              <a
                href="https://t.me/CocaCola_factory"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#229ED9] hover:bg-[#1e8ec5] text-white font-bold text-xs transition-colors"
              >
                <span>{t('openTelegram')}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t('brandName')} {t('homeServices')}. {t('allRightsReserved')}</p>
          <div className="flex flex-wrap items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">{t('privacyPolicy')}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('termsOfService')}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('platformGuidelines')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
