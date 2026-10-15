import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Layers,
  FileCheck
} from 'lucide-react';
import { PLACEHOLDER_CATEGORIES } from '../data/mockData';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const AdminDashboard: React.FC = () => {
  // Verification queue state
  const [pendingWorkers, setPendingWorkers] = useState([
    {
      id: 'app-01',
      name: 'Solomon Negash',
      trade: 'HVAC & AC Service',
      experience: '7 years',
      city: 'Addis Ababa (Bole)',
      submittedAt: '2026-10-14',
      documents: ['National ID', 'HVAC Technical Certificate Level 4'],
      status: 'pending',
    },
    {
      id: 'app-02',
      name: 'Kassahun Tilahun',
      trade: 'Electrician',
      experience: '5 years',
      city: 'Addis Ababa (Yeka)',
      submittedAt: '2026-10-15',
      documents: ['National ID', 'Electrical Safety Board License'],
      status: 'pending',
    },
    {
      id: 'app-03',
      name: 'Genet Alemu',
      trade: 'Painting & Finishing',
      experience: '4 years',
      city: 'Addis Ababa (Arada)',
      submittedAt: '2026-10-15',
      documents: ['National ID', 'Vocational Training Certificate'],
      status: 'pending',
    }
  ]);

  const handleVerify = (id: string) => {
    setPendingWorkers(prev => prev.filter(w => w.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingWorkers(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Marketplace Administration Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tegagn Platform Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Worker verification queue, marketplace category governance, and activity monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            PostgreSQL & Django Gateway: Healthy
          </span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Pros</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">184</div>
          <span className="text-xs text-emerald-600 font-medium">+12 approved this month</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Clients</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">1,290</div>
          <span className="text-xs text-emerald-600 font-medium">+86 new customers</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Repairs</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">3,410</div>
          <span className="text-xs text-slate-500 font-medium">98.4% satisfaction score</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Volume</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">$182,400</div>
          <span className="text-xs text-emerald-600 font-medium">+18% growth month-over-month</span>
        </Card>
      </div>

      {/* Main Grid: Worker Verification Queue + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Verification Queue (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Worker Credential Verification Queue ({pendingWorkers.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">Requires manual badge validation</span>
          </div>

          {pendingWorkers.length === 0 ? (
            <Card className="text-center py-12 text-slate-500">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">Verification queue is completely clear!</p>
              <p className="text-xs mt-1">All registered trade professionals have been processed.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingWorkers.map((w) => (
                <Card key={w.id} padding="md" className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{w.name}</h3>
                        <Badge variant="trade">{w.trade}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {w.experience} experience • {w.city} • Applied on {w.submittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleVerify(w.id)}
                      >
                        Approve & Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                        icon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleReject(w.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-600">Submitted Documents:</span>
                    {w.documents.map((doc, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] flex items-center gap-1">
                        📄 {doc}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Categories Governance (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Active Trade Categories
            </h2>
          </div>

          <Card className="divide-y divide-slate-100 p-0 overflow-hidden">
            {PLACEHOLDER_CATEGORIES.map((cat) => (
              <div key={cat.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{cat.name}</span>
                  <span className="text-slate-400">{cat.slug}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-brand-600 block">{cat.workerCount} Pros</span>
                  <span className="text-emerald-600 text-[10px]">Active</span>
                </div>
              </div>
            ))}
          </Card>
        </div>

      </div>

      {/* Backend Integration Note */}
      <Card className="p-4 bg-slate-900 text-slate-300 border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 text-white font-bold">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Django Admin & REST Integration Plan</span>
        </div>
        <p className="text-slate-400">
          In production, this admin portal connects to custom Django endpoints (such as <code>/api/v1/admin/workers/verify/</code>) alongside the default Django Admin panel (<code>/admin/</code>) on PostgreSQL.
        </p>
      </Card>

    </div>
  );
};
