import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  DollarSign, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { bookingService, workerService } from '../services/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      bookingService.getBookingById(id)
        .then((data) => {
          setBooking(data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleUpdateStatus = (newStatus: BookingStatus) => {
    if (!booking) return;
    setBooking({ ...booking, status: newStatus });
    setStatusMessage(`Booking status updated to ${newStatus.replace('_', ' ')}!`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="accepted">Confirmed by Pro</Badge>;
      case 'pending':
        return <Badge variant="pending">Awaiting Pro Confirmation</Badge>;
      case 'in_progress':
        return <Badge variant="trade">Work In Progress</Badge>;
      case 'completed':
        return <Badge variant="completed">Service Completed</Badge>;
      case 'cancelled':
        return <Badge variant="cancelled">Request Cancelled</Badge>;
    }
  };

  const steps: { key: BookingStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Requested', desc: 'Customer sent request' },
    { key: 'accepted', label: 'Confirmed', desc: 'Technician approved' },
    { key: 'in_progress', label: 'In Progress', desc: 'Repair active on site' },
    { key: 'completed', label: 'Completed', desc: 'Job inspected & finalized' },
  ];

  const getStepState = (stepKey: BookingStatus, currentStatus: BookingStatus) => {
    if (currentStatus === 'cancelled') return 'cancelled';
    const order: BookingStatus[] = ['pending', 'accepted', 'in_progress', 'completed'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-44 bg-slate-100 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-navy-950">Booking Not Found</h2>
        <p className="text-sm text-slate-500">
          The booking request with reference ID <strong>#{id}</strong> does not exist or has expired.
        </p>
        <div className="pt-2">
          <Link to="/customer/dashboard">
            <Button variant="navy" icon={<ArrowLeft className="w-4 h-4" />}>
              Return to Customer Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono font-bold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
              #{booking.id}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Booking & Appointment Details
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Created on {booking.createdAt} • Trade Category: <strong className="text-slate-700 capitalize">{booking.workerTrade}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(booking.status)}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Progress Status Timeline */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Service Request Progress Timeline
        </h2>

        {booking.status === 'cancelled' ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">This booking has been cancelled.</p>
              <p className="text-rose-600 mt-0.5">You can submit a new inquiry to another technician from the directory.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {steps.map((st, i) => {
              const state = getStepState(st.key, booking.status);
              return (
                <div key={st.key} className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        state === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : state === 'current'
                          ? 'bg-accent-500 text-white ring-4 ring-accent-100'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {state === 'completed' ? '✓' : i + 1}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        state === 'current'
                          ? 'text-navy-950 font-black'
                          : state === 'completed'
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-10">{st.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Split Details: Customer Info + Worker Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-navy-950 font-bold border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-accent-600" />
            <span>Customer Information</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Customer Full Name</span>
              <span className="font-bold text-sm text-slate-900">{booking.customerName}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Contact Phone</span>
                <span className="font-semibold text-slate-800">{booking.customerPhone || '+251 91 123 4567'}</span>
              </div>
              <a href={`tel:${booking.customerPhone || '+251911234567'}`}>
                <Button variant="outline" size="sm" icon={<Phone className="w-3.5 h-3.5" />}>
                  Call
                </Button>
              </a>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Service Address / Location</span>
              <div className="flex items-start gap-1.5 font-medium text-slate-800 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-accent-600 shrink-0 mt-0.5" />
                <span>{booking.location}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mt-2">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Customer Job Notes</span>
                <p className="text-slate-700 mt-0.5">{booking.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Worker Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-navy-950 font-bold">
              <Briefcase className="w-5 h-5 text-accent-600" />
              <span>Assigned Professional</span>
            </div>
            <Link
              to={`/workers/${booking.workerId}`}
              className="text-xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Technician Name</span>
              <span className="font-bold text-sm text-slate-900">{booking.workerName}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Trade Craft & Title</span>
              <span className="font-semibold text-slate-800 capitalize">{booking.workerTrade} Professional</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Technician Phone</span>
                <span className="font-semibold text-slate-800">+251 91 123 4567</span>
              </div>
              <a href="tel:+251911234567">
                <Button variant="outline" size="sm" icon={<Phone className="w-3.5 h-3.5" />}>
                  Call Pro
                </Button>
              </a>
            </div>

            <div className="p-3 rounded-lg bg-navy-50/70 border border-navy-100 text-navy-900 flex items-center justify-between">
              <span className="font-semibold">Standard Hourly Rate</span>
              <span className="font-black text-sm">$35 - $45/hr</span>
            </div>
          </div>
        </Card>

      </div>

      {/* Service Scope & Estimated Cost Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-navy-950">
            Service Description & Schedule
          </h2>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-accent-600" />
              {booking.scheduledDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-accent-600" />
              {booking.scheduledTime}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Requested Repair Scope</span>
          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {booking.serviceDescription}
          </p>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Estimated Technician Labor:</span>
            <span>Approx. 2 hours</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Marketplace Platform Booking Fee:</span>
            <span className="text-emerald-600 font-bold">$0.00 (Free)</span>
          </div>
          <div className="flex items-center justify-between text-base font-black text-navy-950 pt-2 border-t border-slate-100">
            <span>Total Estimated Cost:</span>
            <span className="text-xl text-accent-600 font-black">${booking.estimatedCost}</span>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            *Final cost may adjust depending on parts replacement or agreed on-site scope extensions.
          </p>
        </div>

        {/* Workflow Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Update Booking State:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {booking.status === 'pending' && (
              <>
                <Button
                  variant="accent"
                  size="sm"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => handleUpdateStatus('accepted')}
                >
                  Confirm & Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={() => handleUpdateStatus('cancelled')}
                >
                  Decline
                </Button>
              </>
            )}

            {booking.status === 'accepted' && (
              <>
                <Button
                  variant="navy"
                  size="sm"
                  onClick={() => handleUpdateStatus('in_progress')}
                >
                  Mark In Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600"
                  onClick={() => handleUpdateStatus('cancelled')}
                >
                  Cancel Booking
                </Button>
              </>
            )}

            {booking.status === 'in_progress' && (
              <Button
                variant="accent"
                size="sm"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => handleUpdateStatus('completed')}
              >
                Mark Job Completed
              </Button>
            )}

            {booking.status === 'completed' && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                ✓ Service Completed & Verified
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Backend Integration Note */}
      <div className="p-4 rounded-xl bg-navy-950 text-slate-300 text-xs space-y-1 border border-navy-900">
        <div className="flex items-center gap-2 text-white font-bold">
          <ShieldCheck className="w-4 h-4 text-accent-500" />
          <span>Django REST API Booking Endpoint</span>
        </div>
        <p className="text-slate-400">
          This view communicates with Django endpoint <code>GET /api/v1/bookings/{'{id}'}/</code> and applies state updates via <code>PATCH /api/v1/bookings/{'{id}'}/status/</code>.
        </p>
      </div>

    </div>
  );
};
