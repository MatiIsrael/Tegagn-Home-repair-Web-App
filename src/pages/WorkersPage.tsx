import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  SlidersHorizontal, 
  AlertCircle, 
  X, 
  RotateCcw, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { WorkerProfile, WorkerFilterParams, TradeCategory } from '../types';
import { workerService } from '../services/api';
import { WorkerCard } from '../components/workers/WorkerCard';
import { WorkerFilter } from '../components/workers/WorkerFilter';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const WorkersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  // Effect: Fetch/Filter workers with a subtle simulated async transition for loading state demonstration
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
    }, 150); // 150ms simulated client-side query latency

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  // Array of quick category filter pills
  const quickCategories: { label: string; slug: string }[] = [
    { label: 'All Trades', slug: 'all' },
    { label: 'Plumbing', slug: 'plumber' },
    { label: 'Electrical', slug: 'electrician' },
    { label: 'Construction', slug: 'construction' },
    { label: 'Painting', slug: 'painter' },
    { label: 'Carpentry', slug: 'carpenter' },
    { label: 'Cleaning', slug: 'cleaning' },
  ];

  // Variables & Conditions: Active filter chips for easy one-click removal
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
        label: `Trade: ${match ? match.label : filters.category}`,
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
        label: `≤ $${filters.maxHourlyRate}/hr`,
        onRemove: () => updateFilters({ ...filters, maxHourlyRate: undefined }),
      });
    }

    if (filters.isAvailable) {
      chips.push({
        key: 'available',
        label: 'Available Now',
        onRemove: () => updateFilters({ ...filters, isAvailable: undefined }),
      });
    }

    if (filters.isVerified) {
      chips.push({
        key: 'verified',
        label: 'Verified Only',
        onRemove: () => updateFilters({ ...filters, isVerified: undefined }),
      });
    }

    return chips;
  }, [filters, updateFilters]);

  // Derived variable for category title
  const activeCategoryTitle = useMemo(() => {
    if (!filters.category || filters.category === 'all') return 'All Service Professionals';
    const match = quickCategories.find(c => c.slug === filters.category);
    return match ? `${match.label} Professionals` : 'Specialized Professionals';
  }, [filters.category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            {activeCategoryTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare local plumbers, electricians, builders, painters, carpenters, and cleaners with transparent hourly pricing.
          </p>
        </div>

        {/* Count and Mobile Filter Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Showing <strong className="text-navy-950">{workers.length}</strong> available pros
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden"
            icon={<SlidersHorizontal className="w-4 h-4 text-accent-500" />}
          >
            Filters {activeChips.length > 0 && `(${activeChips.length})`}
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
                  ? 'bg-navy-900 text-white shadow-sm ring-2 ring-navy-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Active Filter Chips Bar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-600">Active Filters:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-navy-950 font-semibold shadow-2xs"
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
            className="ml-auto text-xs font-bold text-accent-600 hover:text-accent-700 underline cursor-pointer"
          >
            Clear All
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
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-12 bg-slate-50 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : workers.length === 0 ? (
            /* Empty State */
            <EmptyState
              icon={<Users className="w-10 h-10 text-slate-400" />}
              title="No service professionals match your criteria"
              description="Try broadening your price range, searching for another trade craft, or clearing current filters."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            /* Results Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} isSample={true} />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
