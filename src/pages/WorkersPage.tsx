import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  SlidersHorizontal, 
  X
} from 'lucide-react';
import { WorkerProfile, WorkerFilterParams } from '../types';
import { workerService } from '../services/api';
import { WorkerCard } from '../components/workers/WorkerCard';
import { WorkerFilter } from '../components/workers/WorkerFilter';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const WorkersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useThemeLanguage();
  
  // React State: Raw list of workers fetched from mock dataset
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  // React State: Controls loading shimmer UI state
  const [loading, setLoading] = useState(true);
  // React State: Mobile filter drawer toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // React State: Controlled filter parameters initialized from URL query params
  const [filters, setFilters] = useState<WorkerFilterParams>(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    maxHourlyRate: searchParams.get('maxHourlyRate') ? Number(searchParams.get('maxHourlyRate')) : undefined,
    isAvailable: searchParams.get('isAvailable') === 'true' ? true : undefined,
    isVerified: searchParams.get('isVerified') === 'true' ? true : undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'rating_desc',
  }));

  // Sync state when URL search parameters change externally
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    if (categoryParam !== null || searchParam !== null) {
      setFilters(prev => ({
        ...prev,
        category: categoryParam || prev.category,
        search: searchParam !== null ? searchParam : prev.search,
      }));
    }
  }, [searchParams]);

  // Function: Updates filter state and reflects parameters in the browser URL
  const updateFilters = useCallback((newFilters: WorkerFilterParams) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category && newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString());
    if (newFilters.maxHourlyRate) params.set('maxHourlyRate', newFilters.maxHourlyRate.toString());
    if (newFilters.isAvailable) params.set('isAvailable', 'true');
    if (newFilters.isVerified) params.set('isVerified', 'true');
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Function: Clears all active filters to baseline default values
  const handleResetFilters = useCallback(() => {
    const resetValues: WorkerFilterParams = {
      search: '',
      category: 'all',
      minRating: undefined,
      maxHourlyRate: undefined,
      isAvailable: undefined,
      isVerified: undefined,
      sortBy: 'rating_desc',
    };
    updateFilters(resetValues);
  }, [updateFilters]);

  // Effect: Fetch/Filter workers
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      workerService.getWorkers(filters)
        .then((data) => {
          if (!isCancelled) {
            setWorkers(data);
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  // Array of quick category filter pills
  const quickCategories = [
    { label: t('allTrades'), slug: 'all' },
    { label: t('plumbing'), slug: 'plumber' },
    { label: t('electrical'), slug: 'electrician' },
    { label: t('construction'), slug: 'construction' },
    { label: t('painting'), slug: 'painter' },
    { label: t('carpentry'), slug: 'carpenter' },
    { label: t('cleaning'), slug: 'cleaning' },
  ];

  // Active filter chips for easy one-click removal
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.search) {
      chips.push({
        key: 'search',
        label: `"${filters.search}"`,
        onRemove: () => updateFilters({ ...filters, search: '' }),
      });
    }

    if (filters.category && filters.category !== 'all') {
      const match = quickCategories.find(c => c.slug === filters.category);
      chips.push({
        key: 'category',
        label: `${t('serviceCategory')}: ${match ? match.label : filters.category}`,
        onRemove: () => updateFilters({ ...filters, category: 'all' }),
      });
    }

    if (filters.minRating) {
      chips.push({
        key: 'rating',
        label: `★ ${filters.minRating}+`,
        onRemove: () => updateFilters({ ...filters, minRating: undefined }),
      });
    }

    if (filters.maxHourlyRate && filters.maxHourlyRate < 100) {
      chips.push({
        key: 'price',
        label: `≤ ${filters.maxHourlyRate} ETB/hr`,
        onRemove: () => updateFilters({ ...filters, maxHourlyRate: undefined }),
      });
    }

    if (filters.isAvailable) {
      chips.push({
        key: 'available',
        label: t('availableNow'),
        onRemove: () => updateFilters({ ...filters, isAvailable: undefined }),
      });
    }

    if (filters.isVerified) {
      chips.push({
        key: 'verified',
        label: t('verifiedOnly'),
        onRemove: () => updateFilters({ ...filters, isVerified: undefined }),
      });
    }

    return chips;
  }, [filters, updateFilters, quickCategories, t]);

  // Derived title for active category
  const activeCategoryTitle = useMemo(() => {
    if (!filters.category || filters.category === 'all') return t('directoryTitle');
    const match = quickCategories.find(c => c.slug === filters.category);
    return match ? `${match.label} - ${t('brandName')}` : t('directoryTitle');
  }, [filters.category, quickCategories, t]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
            {activeCategoryTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('directorySubtitle')}
          </p>
        </div>

        {/* Count and Mobile Filter Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {t('showing')} <strong className="text-navy-950 dark:text-white">{workers.length}</strong> {t('availablePros')}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden"
            icon={<SlidersHorizontal className="w-4 h-4 text-accent-500" />}
          >
            {t('filters')} {activeChips.length > 0 && `(${activeChips.length})`}
          </Button>
        </div>
      </div>

      {/* Quick Trade Category Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Trade categories">
        {quickCategories.map((c) => {
          const isSelected = (filters.category || 'all') === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => updateFilters({ ...filters, category: c.slug })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-navy-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm ring-2 ring-navy-900/20 dark:ring-amber-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Active Filter Chips Bar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-300">{t('activeFilters')}</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-navy-950 dark:text-white font-semibold shadow-2xs"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="text-slate-400 hover:text-accent-600 cursor-pointer p-0.5 rounded"
                aria-label={`Remove filter: ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={handleResetFilters}
            className="ml-auto text-xs font-bold text-accent-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            {t('clearAll')}
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar Filters + Worker Listing */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar Filter */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-24">
          <WorkerFilter
            filters={filters}
            onChange={updateFilters}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="md:hidden col-span-12">
            <WorkerFilter
              filters={filters}
              onChange={(f) => {
                updateFilters(f);
                setMobileFilterOpen(false);
              }}
              onReset={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        )}

        {/* Workers List Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          
          {/* Loading Shimmer State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading workers">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-12 bg-slate-50 dark:bg-slate-800 rounded-xl" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : workers.length === 0 ? (
            /* Empty State */
            <EmptyState
              icon={<Users className="w-10 h-10 text-slate-400" />}
              title={t('noWorkersFound')}
              description={t('noWorkersDesc')}
              actionLabel={t('resetAllFilters')}
              onAction={handleResetFilters}
            />
          ) : (
            /* Results Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
