import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  X, 
  Sparkles, 
  Eye, 
  ShoppingCart, 
  Check, 
  Clock, 
  MapPin, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { WorkerProfile, WorkerFilterParams } from '../types';
import { workerService } from '../services/api';
import { cartService } from '../services/cartService';
import { EmptyState } from '../components/common/EmptyState';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export function getTradeImage(trade: string): string {
  const t = trade.toLowerCase();
  if (t.includes('plumb')) return 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600';
  if (t.includes('elec')) return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600';
  if (t.includes('carp') || t.includes('wood')) return 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600';
  if (t.includes('paint')) return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600';
  if (t.includes('clean')) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
  if (t.includes('build') || t.includes('mason') || t.includes('tile')) return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600';
  return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600';
}

export function getServiceTitle(worker: WorkerProfile): string {
  const t = worker.trade.toLowerCase();
  if (t.includes('plumb')) return 'Pipe Leak & Sanitary Drain Clearing';
  if (t.includes('elec')) return 'Circuit Breaker & Electrical Wiring';
  if (t.includes('carp') || t.includes('wood')) return 'Cabinet Woodwork & Door Framing';
  if (t.includes('paint')) return 'Interior Wall Painting & Waterproofing';
  if (t.includes('clean')) return 'Home Deep Cleaning & Sanitization';
  if (t.includes('build') || t.includes('mason') || t.includes('tile')) return 'Ceramic Tile Laying & Masonry Repair';
  return `${worker.tradeTitle} Services`;
}

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

  // Toast notification state
  const [addedToast, setAddedToast] = useState<{ title: string; show: boolean }>({ title: '', show: false });

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
    { label: 'All', slug: 'all' },
    { label: 'Plumbing', slug: 'plumber' },
    { label: 'Electrical', slug: 'electrician' },
    { label: 'Carpentry', slug: 'carpenter' },
    { label: 'Painting', slug: 'painter' },
    { label: 'Construction', slug: 'construction' },
    { label: 'Cleaning', slug: 'cleaning' },
    { label: 'Other', slug: 'other' },
  ];

  const handleAddToCart = (worker: WorkerProfile) => {
    const serviceTitle = getServiceTitle(worker);
    const imageUrl = getTradeImage(worker.trade);
    
    cartService.addItem({
      id: `cart-${worker.id}`,
      workerId: worker.id,
      serviceTitle,
      providerName: `by ${worker.user.firstName} ${worker.user.lastName}`,
      trade: worker.trade,
      hourlyRate: worker.hourlyRate,
      imageUrl,
      city: worker.city,
    });

    setAddedToast({ title: serviceTitle, show: true });
    setTimeout(() => {
      setAddedToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleAiSearch = () => {
    if (!filters.search) {
      updateFilters({ ...filters, search: 'leak repair' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      {/* Toast Notification for Add to Cart */}
      {addedToast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Added to Cart!</p>
            <p className="text-[11px] text-slate-300 truncate max-w-xs">{addedToast.title}</p>
          </div>
          <Link
            to="/cart"
            className="ml-2 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
          >
            <span>View Cart</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* 1. Marketplace Title (Matching Image 1) */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Marketplace
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Browse verified trade repair services and book directly at transparent rates
        </p>
      </div>

      {/* 2. Search Bar with AI Search Button (Matching Image 1) */}
      <div className="max-w-4xl">
        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-1.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          <Search className="w-5 h-5 text-slate-400 ml-3 pointer-events-none shrink-0" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
            placeholder="Search services... (try: 'pipe leak fix' or 'electrical rewiring')"
            className="w-full pl-3 pr-2 py-2 text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, search: '' })}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer mr-1"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleAiSearch}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Search</span>
          </button>
        </div>
      </div>

      {/* 3. Category Filter Pills (Matching Image 1 with amber active state) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
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
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 4. Products / Services Grid (Matching Image 1 layout with amber accents) */}
      <div className="pt-2">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" aria-busy="true">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs animate-pulse">
                <div className="h-44 bg-slate-200 dark:bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
                  <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : workers.length === 0 ? (
          <EmptyState
            title="No Services Found"
            description="No repair services matched your search query or trade filter."
            actionLabel="Reset Filters"
            onAction={() => updateFilters({ search: '', category: 'all', sortBy: 'rating_desc' })}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {workers.map((worker) => {
              const serviceTitle = getServiceTitle(worker);
              const imageUrl = getTradeImage(worker.trade);

              return (
                <div
                  key={worker.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Top Image Banner (Matching Image 1) */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={serviceTitle}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs border border-slate-200/60 dark:border-slate-700/60">
                        {worker.trade}
                      </span>
                    </div>
                  </div>

                  {/* Body Details (Matching Image 1: Title, By Provider, Description, Available, Price) */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {serviceTitle}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        by {worker.user.firstName} {worker.user.lastName}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                        {worker.bio || `Professional ${worker.tradeTitle} certified for high quality residential repair.`}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Available: Today ({worker.city})</span>
                      </p>

                      {/* Price (In Tegagn Amber Color) */}
                      <p className="text-lg font-black text-amber-500">
                        {worker.hourlyRate} ETB<span className="text-xs font-semibold text-slate-400">/hr</span>
                      </p>
                    </div>

                    {/* Action Buttons: View Details & Add to Cart (Matching Image 1) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        to={`/workers/${worker.id}`}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(worker)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer text-center"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
