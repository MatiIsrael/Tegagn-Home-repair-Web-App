import React, { useState, useRef, useEffect } from 'react';
import { Globe, Moon, Sun, Check } from 'lucide-react';
import { useThemeLanguage, Language } from '../../context/ThemeLanguageContext';

interface LanguageThemeControlsProps {
  className?: string;
}

export const LanguageThemeControls: React.FC<LanguageThemeControlsProps> = ({ className = '' }) => {
  const { lang, setLang, theme, toggleTheme } = useThemeLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; full: string; native: string }[] = [
    { code: 'en', label: 'EN', full: 'English', native: 'English' },
    { code: 'am', label: 'አማ', full: 'Amharic', native: 'አማርኛ' },
    { code: 'om', label: 'ORO', full: 'Afaan Oromoo', native: 'Afaan Oromoo' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  return (
    <div className={`flex items-center gap-2 relative ${className}`} ref={dropdownRef}>
      
      {/* Globe Icon Button to open Language Selection Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-500 shadow-xs transition-all cursor-pointer"
          aria-label="Select Language"
          aria-expanded={dropdownOpen}
          title="Select Language / ቋንቋ ይምረጡ"
        >
          <Globe className="w-4 h-4 stroke-[2.2] text-amber-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
            {currentLang.label}
          </span>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              Select Language
            </div>
            <div className="mt-1 space-y-0.5">
              {languages.map((l) => {
                const isSelected = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLang(l.code);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{l.native}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{l.full}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Night / Light Mode Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
        className="p-2 rounded-full text-slate-800 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs"
        aria-label="Toggle Night Mode"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 fill-amber-400/20 stroke-[2]" />
        ) : (
          <Moon className="w-4 h-4 stroke-[2]" />
        )}
      </button>

    </div>
  );
};
