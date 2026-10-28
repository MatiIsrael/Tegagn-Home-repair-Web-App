import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search,
  X
} from 'lucide-react';
import { WorkerProfile, WorkerFilterParams } from '../types';
import { workerService } from '../services/api';
import { WorkerCard } from '../components/workers/WorkerCard';
import { EmptyState } from '../components/common/EmptyState';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const WorkersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useThemeLanguage();
  
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<WorkerFilterParams>(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    sortBy: 'rating_desc',
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

  // Updates filter state and reflects parameters in browser URL
  const updateFilters = useCallback((newFilters: WorkerFilterParams) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category && newFilters.category !== 'all') params.set('category', newFilters.category);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Clears all active filters
  const handleResetFilters = useCallback(() => {
    updateFilters({
      search: '',
      category: 'all',
      sortBy: 'rating_desc',
    });
  }, [updateFilters]);

  // Fetch workers matching search and category
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

  const quickCategories = [
    { label: t('allTrades'), slug: 'all' },
    { label: t('plumbing'), slug: 'plumber' },
    { label: t('electrical'), slug: 'electrician' },
    { label: t('construction'), slug: 'construction' },
    { label: t('painting'), slug: 'painter' },
    { label: t('carpentry'), slug: 'carpenter' },
    { label: t('cleaning'), slug: 'cleaning' },
  ];

  const activeCategoryTitle = useMemo(() => {
    if (!filters.category || filters.category === 'all') return t('directoryTitle');
    const match = quickCategories.find(c => c.slug === filters.category);
    return match ? `${match.label} - ${t('brandName')}` : t('directoryTitle');
  }, [filters.category, quickCategories, t]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeCategoryTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('directorySubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-4 py-1.5 rounded-full shadow-2xs">
            {t('showing')} <strong className="text-amber-600 dark:text-amber-400 font-extrabold">{workers.length}</strong> {t('availablePros')}
          </span>
        </div>
      </div>

      {/* Clean Top Search Bar & Category Tabs */}
      <div className="space-y-4">
        
        {/* Search input */}
        <div className="max-w-xl">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-amber-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => updateFilters({ ...filters, search: '' })}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-500/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Workers Grid (Full Width, without sidebar filter) */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-busy="true" aria-label="Loading workers">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
          <EmptyState
            icon={<Users className="w-10 h-10 text-slate-400" />}
            title={t('noWorkersFound')}
            description={t('noWorkersDesc')}
            actionLabel={t('resetAllFilters')}
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
