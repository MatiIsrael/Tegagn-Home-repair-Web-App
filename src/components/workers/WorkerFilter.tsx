import React from 'react';
import { Search, Filter, RotateCcw, X } from 'lucide-react';
import { WorkerFilterParams } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface WorkerFilterProps {
  filters: WorkerFilterParams;
  onChange: (newFilters: WorkerFilterParams) => void;
  onReset: () => void;
}

export const WorkerFilter: React.FC<WorkerFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const { t } = useThemeLanguage();

  // Array of trade categories including all core marketplace trades
  const categories = [
    { value: 'all', label: t('allTradeCrafts') },
    { value: 'plumber', label: t('plumbing') },
    { value: 'electrician', label: t('electrical') },
    { value: 'construction', label: t('construction') },
    { value: 'painter', label: t('painting') },
    { value: 'carpenter', label: t('carpentry') },
    { value: 'cleaning', label: t('cleaning') },
    { value: 'hvac', label: t('hvac') },
    { value: 'locksmith', label: t('locksmith') },
    { value: 'roofer', label: t('roofer') },
  ];

  // Calculate how many filters are currently active
  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.category && filters.category !== 'all' ? 1 : 0,
    filters.minRating ? 1 : 0,
    filters.maxHourlyRate && filters.maxHourlyRate < 100 ? 1 : 0,
    filters.isAvailable ? 1 : 0,
    filters.isVerified ? 1 : 0,
  ].reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-navy-950 dark:text-white font-bold">
          <Filter className="w-4 h-4 text-accent-600 dark:text-amber-400" />
          <span>{t('filters')}</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-50 dark:bg-slate-800 text-accent-700 dark:text-amber-400 text-xs font-bold border border-accent-200 dark:border-slate-700">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-accent-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('reset')}</span>
          </button>
        )}
      </div>

      <div className="space-y-5">
        
        {/* Controlled Keyword Search Input */}
        <div>
          <label htmlFor="filter-keywords" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t('searchKeywords')}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="filter-keywords"
              type="text"
              placeholder={t('searchKeywordsPlaceholder')}
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="w-full text-sm pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Controlled Category Dropdown */}
        <div>
          <label htmlFor="filter-category" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t('serviceCategory')}
          </label>
          <select
            id="filter-category"
            value={filters.category || 'all'}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full text-sm px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-slate-800 cursor-pointer font-medium text-slate-800 dark:text-slate-100"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value} className="dark:bg-slate-900">
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max Hourly Rate Range Slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="filter-price" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('maximumHourlyRate')}
            </label>
            <span className="text-xs font-bold text-accent-600 dark:text-amber-400 bg-accent-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-accent-200 dark:border-slate-700">
              {filters.maxHourlyRate || 100} ETB/hr
            </span>
          </div>
          <input
            id="filter-price"
            type="range"
            min="20"
            max="100"
            step="5"
            value={filters.maxHourlyRate || 100}
            onChange={(e) => onChange({ ...filters, maxHourlyRate: Number(e.target.value) })}
            className="w-full accent-accent-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>20 ETB</span>
            <span>60 ETB</span>
            <span>100 ETB/hr</span>
          </div>
        </div>

        {/* Minimum Rating Selector Buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t('minimumRating')}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[4.0, 4.5, 4.8, 4.9].map((val) => {
              const isSelected = filters.minRating === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      minRating: isSelected ? undefined : val,
                    })
                  }
                  className={`text-xs py-1.5 px-2 rounded-lg border font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent-500 border-accent-500 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                  aria-pressed={isSelected}
                >
                  ★ {val}+
                </button>
              );
            })}
          </div>
        </div>

        {/* Availability & Verification Toggles */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.isAvailable || false}
              onChange={(e) =>
                onChange({
                  ...filters,
                  isAvailable: e.target.checked ? true : undefined,
                })
              }
              className="w-4 h-4 rounded text-accent-600 focus:ring-accent-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-semibold">{t('availableWorkNow')}</span>
          </label>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.isVerified || false}
              onChange={(e) =>
                onChange({
                  ...filters,
                  isVerified: e.target.checked ? true : undefined,
                })
              }
              className="w-4 h-4 rounded text-accent-600 focus:ring-accent-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-semibold">{t('verifiedProsOnly')}</span>
          </label>
        </div>

        {/* Sort By Dropdown */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label htmlFor="filter-sort" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t('sortBy')}
          </label>
          <select
            id="filter-sort"
            value={filters.sortBy || 'rating_desc'}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            <option value="rating_desc" className="dark:bg-slate-900">{t('highestRating')}</option>
            <option value="price_asc" className="dark:bg-slate-900">{t('lowestPrice')}</option>
            <option value="price_desc" className="dark:bg-slate-900">{t('highestPrice')}</option>
            <option value="experience_desc" className="dark:bg-slate-900">{t('mostExperienced')}</option>
          </select>
        </div>

      </div>
    </div>
  );
};
