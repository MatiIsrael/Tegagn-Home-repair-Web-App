import React from 'react';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export const Footer: React.FC = () => {
  const { t } = useThemeLanguage();

  return (
    <footer className="py-10 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-medium text-slate-600 dark:text-slate-400">
          {t('footerEmpower')}
        </p>
      </div>
    </footer>
  );
};
