import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ArrowLeft, 
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Edit,
  Tag,
  Layers
} from 'lucide-react';
import { WorkerServiceItem } from '../types';
import { workerCatalogService } from '../services/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { FormInput, FormTextarea } from '../components/common/FormInput';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';

export const ServiceManagementPage: React.FC = () => {
  const [services, setServices] = useState<WorkerServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'paused'>('all');

  const [newServiceForm, setNewServiceForm] = useState({
    title: '',
    category: 'plumber' as const,
    priceType: 'fixed' as const,
    price: '',
    durationEstimate: '1 - 2 hours',
    description: '',
  });

  useEffect(() => {
    workerCatalogService.getServices('worker-101')
      .then((data) => setServices(data))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = (id: string) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});

  const validateNewService = () => {
    const errs: Record<string, string> = {};
    if (!newServiceForm.title.trim() || newServiceForm.title.trim().length < 5) {
      errs.title = 'Service title must be at least 5 characters.';
    }

    const priceNum = Number(newServiceForm.price);
    if (!newServiceForm.price || isNaN(priceNum) || priceNum <= 0) {
      errs.price = 'Please enter a valid price (greater than $0).';
    }

    if (!newServiceForm.durationEstimate.trim()) {
      errs.durationEstimate = 'Estimated duration is required.';
    }

    if (!newServiceForm.description.trim() || newServiceForm.description.trim().length < 15) {
      errs.description = 'Please describe what is included in at least 15 characters.';
    }

    return errs;
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateNewService();
    if (Object.keys(errs).length > 0) {
      setServiceErrors(errs);
      return;
    }

    const created: WorkerServiceItem = {
      id: `srv-${Date.now()}`,
      workerId: 'worker-101',
      title: newServiceForm.title.trim(),
      category: newServiceForm.category,
      priceType: newServiceForm.priceType,
      price: Number(newServiceForm.price),
      durationEstimate: newServiceForm.durationEstimate.trim(),
      description: newServiceForm.description.trim(),
      isActive: true,
    };
    setServices([created, ...services]);
    setIsAddModalOpen(false);
    setServiceErrors({});
    setNewServiceForm({
      title: '',
      category: 'plumber',
      priceType: 'fixed',
      price: '',
      durationEstimate: '1 - 2 hours',
      description: '',
    });
  };

  const filteredServices = services.filter(s => {
    if (filterActive === 'active') return s.isActive;
    if (filterActive === 'paused') return !s.isActive;
    return true;
  });

  const activeCount = services.filter(s => s.isActive).length;
  const pausedCount = services.filter(s => !s.isActive).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/worker/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Worker Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Service Catalog Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Define specific repair packages, flat rates, and service options displayed on your public profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold shadow-md shadow-accent-500/20"
          >
            Add New Service
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6 text-accent-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-navy-950">{services.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Services in Catalog</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-navy-950">{activeCount}</div>
            <div className="text-xs font-medium text-slate-500">Active & Bookable</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-navy-950">{pausedCount}</div>
            <div className="text-xs font-medium text-slate-500">Paused / Off-Season</div>
          </div>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          {(['all', 'active', 'paused'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterActive(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                filterActive === tab
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab === 'all' ? `All Services (${services.length})` : tab === 'active' ? `Active (${activeCount})` : `Paused (${pausedCount})`}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline-block">
          Changes reflect immediately on your public worker profile
        </span>
      </div>

      {/* Services List Area */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-slate-400" />}
          title="No services found"
          description={filterActive === 'all' 
            ? "You haven't published any repair service packages yet. Add common jobs like 'Faucet Replacement' or 'Water Heater Maintenance' to receive direct bookings."
            : `No ${filterActive} services found in your catalog.`}
          actionLabel="Add Your First Service"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <Card key={service.id} padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="trade">{service.category}</Badge>
                  {service.isActive ? (
                    <Badge variant="available" size="sm">Active</Badge>
                  ) : (
                    <Badge variant="busy" size="sm">Paused</Badge>
                  )}
                  {service.priceType === 'fixed' && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Flat Rate
                    </span>
                  )}
                  {service.priceType === 'hourly' && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Hourly
                    </span>
                  )}
                  {service.priceType === 'starting_at' && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Starting At
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-navy-950">
                  {service.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">
                  {service.description}
                </p>

                {service.durationEstimate && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est. Time: {service.durationEstimate}</span>
                  </div>
                )}
              </div>

              {/* Price & Action controls */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Pricing</span>
                  <span className="text-xl font-black text-navy-950">${service.price}</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {service.priceType === 'hourly' ? '/hr' : ' est.'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(service.id)}
                    className="p-1.5 text-slate-500 hover:text-navy-950 rounded-lg hover:bg-slate-100 transition-colors"
                    title={service.isActive ? "Pause Service" : "Activate Service"}
                  >
                    {service.isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}



      {/* Add New Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Service Offering"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateService} className="space-y-4">
          <FormInput
            label="Service Title"
            type="text"
            placeholder="E.g. Under-Sink Faucet & Pipe Replacement"
            required
            value={newServiceForm.title}
            onChange={(e) => {
              setNewServiceForm({ ...newServiceForm, title: e.target.value });
              if (serviceErrors.title) setServiceErrors(prev => ({ ...prev, title: '' }));
            }}
            error={serviceErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pricing Model"
              options={[
                { value: 'fixed', label: 'Flat Fixed Rate' },
                { value: 'hourly', label: 'Hourly Rate' },
                { value: 'starting_at', label: 'Starting At (Quote on inspect)' },
              ]}
              value={newServiceForm.priceType}
              onChange={(e) => setNewServiceForm({ ...newServiceForm, priceType: e.target.value as any })}
            />

            <FormInput
              label="Price ($ USD)"
              type="number"
              min="10"
              max="2000"
              placeholder="E.g. 75"
              required
              value={newServiceForm.price}
              onChange={(e) => {
                setNewServiceForm({ ...newServiceForm, price: e.target.value });
                if (serviceErrors.price) setServiceErrors(prev => ({ ...prev, price: '' }));
              }}
              leftIcon={<DollarSign className="w-4 h-4" />}
              error={serviceErrors.price}
            />
          </div>

          <FormInput
            label="Typical Duration Estimate"
            type="text"
            placeholder="E.g. 1 - 2 hours"
            value={newServiceForm.durationEstimate}
            onChange={(e) => {
              setNewServiceForm({ ...newServiceForm, durationEstimate: e.target.value });
              if (serviceErrors.durationEstimate) setServiceErrors(prev => ({ ...prev, durationEstimate: '' }));
            }}
            error={serviceErrors.durationEstimate}
            helperText="Provides homeowners with clear expectations on arrival."
          />

          <FormTextarea
            label="Service Scope & What's Included"
            rows={3}
            placeholder="Describe what parts of the task are included, diagnostic inspection, and warranty terms..."
            required
            value={newServiceForm.description}
            onChange={(e) => {
              setNewServiceForm({ ...newServiceForm, description: e.target.value });
              if (serviceErrors.description) setServiceErrors(prev => ({ ...prev, description: '' }));
            }}
            error={serviceErrors.description}
            helperText="Min 15 characters"
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" icon={<Plus className="w-4 h-4" />}>
              Add to Catalog
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
