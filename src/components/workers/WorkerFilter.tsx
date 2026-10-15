import React from 'react';
import { Search, Filter, RotateCcw, X } from 'lucide-react';
import { WorkerFilterParams } from '../../types';

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
  // Array of trade categories including all 6 core marketplace trades
  const categories = [
    { value: 'all', label: 'All Trade Crafts' },
    { value: 'plumber', label: 'Plumbing' },
    { value: 'electrician', label: 'Electrical Work' },
    { value: 'construction', label: 'Construction & Masonry' },
    { value: 'painter', label: 'Painting' },
    { value: 'carpenter', label: 'Carpentry' },
    { value: 'cleaning', label: 'Cleaning & Sanitation' },
    { value: 'hvac', label: 'HVAC Specialists' },
    { value: 'locksmith', label: 'Locksmiths' },
    { value: 'roofer', label: 'Roofing Repairs' },
  ];

  // Variables & Conditions: calculate how many filters are currently active
  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.category && filters.category !== 'all' ? 1 : 0,
    filters.minRating ? 1 : 0,
    filters.maxHourlyRate && filters.maxHourlyRate < 100 ? 1 : 0,
    filters.isAvailable ? 1 : 0,
    filters.isVerified ? 1 : 0,
  ].reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-navy-950 font-bold">
          <Filter className="w-4 h-4 text-accent-600" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 text-xs font-bold border border-accent-200">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-accent-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-5">
        
        {/* Controlled Keyword Search Input */}
        <div>
          <label htmlFor="filter-keywords" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Search Keywords
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="filter-keywords"
              type="text"
              placeholder="Name, skill, or location..."
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="w-full text-sm pl-9 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Controlled Category Dropdown */}
        <div>
          <label htmlFor="filter-category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Service Category
          </label>
          <select
            id="filter-category"
            value={filters.category || 'all'}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white cursor-pointer font-medium text-slate-800"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max Hourly Rate Range Slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="filter-price" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Max Hourly Rate
            </label>
            <span className="text-xs font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
              ${filters.maxHourlyRate || 100}/hr
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
            <span>$20</span>
            <span>$60</span>
            <span>$100/hr</span>
          </div>
        </div>

        {/* Minimum Rating Selector Buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Minimum Rating
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
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
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
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
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
            <span className="text-xs font-semibold text-slate-800">Available for Work Now</span>
          </label>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
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
            <span className="text-xs font-semibold text-slate-800">Verified Professionals Only</span>
          </label>
        </div>

        {/* Sort By Dropdown */}
        <div className="pt-2 border-t border-slate-100">
          <label htmlFor="filter-sort" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Sort Results By
          </label>
          <select
            id="filter-sort"
            value={filters.sortBy || 'rating_desc'}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-medium text-slate-800 cursor-pointer"
          >
            <option value="rating_desc">Highest Rated First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="experience_desc">Most Experienced First</option>
          </select>
        </div>

      </div>
    </div>
  );
};
