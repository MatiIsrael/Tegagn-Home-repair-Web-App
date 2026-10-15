import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Calendar, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  Edit3, 
  AlertCircle
} from 'lucide-react';
import { PLACEHOLDER_WORKER_REQUESTS, PLACEHOLDER_WORKERS } from '../data/mockData';
import { Booking, BookingStatus } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const WorkerDashboard: React.FC = () => {
  const currentWorker = PLACEHOLDER_WORKERS[0]; // Abebe Tadesse
  const [requests, setRequests] = useState<Booking[]>(PLACEHOLDER_WORKER_REQUESTS);
  const [isAvailable, setIsAvailable] = useState(currentWorker.isAvailable);

  const handleUpdateStatus = (bookingId: string, newStatus: BookingStatus) => {
    setRequests(prev =>
      prev.map(r => (r.id === bookingId ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-5">
          <img
            src={currentWorker.user.avatarUrl}
            alt={currentWorker.user.firstName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-brand-500"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 uppercase">
                {currentWorker.trade} Pro
              </span>
              {currentWorker.isVerified && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {currentWorker.user.firstName} {currentWorker.user.lastName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {currentWorker.tradeTitle} • ${currentWorker.hourlyRate}/hr
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Toggle */}
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
              isAvailable
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {isAvailable ? 'Status: Accepting Jobs' : 'Status: Paused / Busy'}
          </button>

          <Link to="/worker/services">
            <Button variant="accent" size="md" className="font-bold">
              Service Catalog
            </Button>
          </Link>

          <Link to="/worker/profile/edit">
            <Button variant="outline" size="md" icon={<Edit3 className="w-4 h-4 text-white" />} className="border-slate-700 text-white hover:bg-slate-800">
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">$1,840</div>
            <div className="text-xs font-medium text-slate-500">Estimated Earnings (Month)</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{currentWorker.completedJobs}</div>
            <div className="text-xs font-medium text-slate-500">Total Jobs Completed</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">4.9 / 5.0</div>
            <div className="text-xs font-medium text-slate-500">From 84 Client Reviews</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{requests.length}</div>
            <div className="text-xs font-medium text-slate-500">Active / Pending Inquiries</div>
          </div>
        </Card>
      </div>

      {/* Incoming Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Incoming Job Requests & Schedule
          </h2>
          <span className="text-xs text-slate-500">
            Respond promptly to maintain high platform ranking
          </span>
        </div>

        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} padding="md" className="space-y-4 border-l-4 border-l-brand-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400">#{req.id}</span>
                  {req.status === 'pending' ? (
                    <Badge variant="pending">Action Required: New Request</Badge>
                  ) : req.status === 'accepted' ? (
                    <Badge variant="accepted">Accepted / Scheduled</Badge>
                  ) : (
                    <Badge variant="completed">Completed</Badge>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-700">
                  Est. Payout: <span className="text-emerald-600 text-sm font-extrabold">${req.estimatedCost}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <h3 className="font-bold text-base text-slate-900">
                    {req.serviceDescription}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <strong>Client:</strong> {req.customerName}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3.5 h-3.5 text-brand-600" />
                      {req.customerPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      {req.scheduledDate} at {req.scheduledTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {req.location}
                    </span>
                  </div>

                  {req.notes && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <strong>Client Notes:</strong> {req.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-2">
                  <Link to={`/bookings/${req.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>

                  {req.status === 'pending' ? (
                    <>
                      <Button
                        variant="accent"
                        size="sm"
                        icon={<Check className="w-4 h-4" />}
                        onClick={() => handleUpdateStatus(req.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                        icon={<X className="w-4 h-4" />}
                        onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                      >
                        Decline
                      </Button>
                    </>
                  ) : req.status === 'accepted' ? (
                    <>
                      <Button
                        variant="navy"
                        size="sm"
                        icon={<Check className="w-4 h-4 text-emerald-400" />}
                        onClick={() => handleUpdateStatus(req.id, 'completed')}
                      >
                        Mark Done
                      </Button>
                      <a href={`tel:${req.customerPhone}`}>
                        <Button variant="outline" size="sm" icon={<Phone className="w-3.5 h-3.5" />}>
                          Call
                        </Button>
                      </a>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Django REST Architecture Box */}
      <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 text-xs text-brand-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Django REST API Worker Endpoints Integration</h4>
          <p className="mt-0.5">
            This dashboard communicates with Django via <code>GET /api/v1/worker/bookings/</code> and status updates via <code>PATCH /api/v1/bookings/{'{id}'}/status/</code>.
          </p>
        </div>
      </div>

    </div>
  );
};
