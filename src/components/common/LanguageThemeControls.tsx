import React from 'react';
import { Globe, Moon, Sun } from 'lucide-react';
import { useThemeLanguage, Language } from '../../context/ThemeLanguageContext';

interface LanguageThemeControlsProps {
  className?: string;
}

export const LanguageThemeControls: React.FC<LanguageThemeControlsProps> = ({ className = '' }) => {
  const { lang, setLang, theme, toggleTheme } = useThemeLanguage();

  const languages: { code: Language; label: string; full: string }[] = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'am', label: 'አማ', full: 'አማርኛ' },
    { code: 'om', label: 'ORO', full: 'Afaan Oromoo' },
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Language Selector Pill Container - Replicating screenshot layout */}
      <div className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 shadow-xs transition-colors">
        {/* Golden Globe Icon */}
        <div className="pl-2 pr-0.5 text-amber-500 flex items-center justify-center">
          <Globe className="w-4 h-4 stroke-[2.2]" />
        </div>

        {/* Language Options */}
        <div className="flex items-center gap-0.5">
          {languages.map((l) => {
            const isActive = lang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                title={l.full}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#d4a017] text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Night Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
        className="p-1.5 rounded-full text-slate-800 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
        aria-label="Toggle Night Mode"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 fill-amber-400/20 stroke-[2]" />
        ) : (
          <Moon className="w-5 h-5 stroke-[2]" />
        )}
      </button>
    </div>
  );
};
