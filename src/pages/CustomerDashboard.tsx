import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  CheckCircle, 
  Star
} from 'lucide-react';
import { PLACEHOLDER_CUSTOMER_BOOKINGS, PLACEHOLDER_WORKERS } from '../data/mockData';
import { Booking, BookingStatus } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const CustomerDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(PLACEHOLDER_CUSTOMER_BOOKINGS);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history' | 'saved'>('active');
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress');
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="accepted">Pro Confirmed</Badge>;
      case 'pending':
        return <Badge variant="pending">Awaiting Pro Response</Badge>;
      case 'in_progress':
        return <Badge variant="trade">Work In Progress</Badge>;
      case 'completed':
        return <Badge variant="completed">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="cancelled">Cancelled</Badge>;
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b))
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewModalBooking(null);
      setReviewSubmitted(false);
      setComment('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-950 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, Bethlehem Assefa 👋
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Track your home repairs, manage upcoming appointments, and communicate with your hired trade professionals.
          </p>
        </div>

        <Link to="/workers">
          <Button variant="primary" size="lg" icon={<Plus className="w-5 h-5" />} className="shadow-lg shadow-brand-500/20">
            Book New Repair
          </Button>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{activeBookings.length}</div>
            <div className="text-xs font-medium text-slate-500">Active Bookings</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{historyBookings.length}</div>
            <div className="text-xs font-medium text-slate-500">Completed Jobs</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">3 Saved</div>
            <div className="text-xs font-medium text-slate-500">Favorite Professionals</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              selectedTab === 'active'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Active Service Requests ({activeBookings.length})
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              selectedTab === 'history'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Past Service History ({historyBookings.length})
          </button>
          <button
            onClick={() => setSelectedTab('saved')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              selectedTab === 'saved'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Saved Pros
          </button>
        </nav>
      </div>

      {/* TAB CONTENT: ACTIVE BOOKINGS */}
      {selectedTab === 'active' && (
        <div className="space-y-4">
          {activeBookings.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No active bookings right now</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Need a plumber, electrician, or carpenter? Browse our verified list of local professionals.
              </p>
              <div className="mt-4">
                <Link to="/workers">
                  <Button variant="primary" size="sm">Find a Professional</Button>
                </Link>
              </div>
            </Card>
          ) : (
            activeBookings.map((b) => (
              <Card key={b.id} padding="md" className="space-y-4 border-l-4 border-l-brand-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400">#{b.id}</span>
                    <Badge variant="trade">{b.workerTrade}</Badge>
                    {getStatusBadge(b.status)}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Est. Cost: <span className="text-slate-900 font-bold text-sm">${b.estimatedCost}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <h3 className="font-bold text-base text-slate-900">
                      {b.serviceDescription}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <strong className="text-slate-800">Pro:</strong> {b.workerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        {b.scheduledDate} at {b.scheduledTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        {b.location}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-wrap md:justify-end gap-2 pt-2 md:pt-0">
                    <Link to={`/bookings/${b.id}`}>
                      <Button variant="accent" size="sm">
                        Booking Details
                      </Button>
                    </Link>
                    <Link to={`/workers/${b.workerId}`}>
                      <Button variant="outline" size="sm">
                        View Worker
                      </Button>
                    </Link>
                    {b.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORY */}
      {selectedTab === 'history' && (
        <div className="space-y-4">
          {historyBookings.map((b) => (
            <Card key={b.id} padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">#{b.id}</span>
                  <Badge variant="trade">{b.workerTrade}</Badge>
                  {getStatusBadge(b.status)}
                </div>
                <span className="text-xs text-slate-400">{b.scheduledDate}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{b.serviceDescription}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Completed by <strong>{b.workerName}</strong> • Paid ${b.estimatedCost}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/bookings/${b.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                  {b.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      onClick={() => setReviewModalBooking(b)}
                    >
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB CONTENT: SAVED PROS */}
      {selectedTab === 'saved' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLACEHOLDER_WORKERS.slice(0, 2).map((w) => (
            <Card key={w.id} padding="sm" className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={w.user.avatarUrl}
                  alt={w.user.firstName}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{w.user.firstName} {w.user.lastName}</h4>
                  <p className="text-xs text-slate-500">{w.tradeTitle}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-900">${w.hourlyRate}/hr</span>
                <Link to={`/workers/${w.id}`}>
                  <Button variant="outline" size="sm">Book Again</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewModalBooking}
        onClose={() => setReviewModalBooking(null)}
        title={`Review for ${reviewModalBooking?.workerName}`}
      >
        {reviewSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">Thank you for your review!</h4>
            <p className="text-xs text-slate-500">Your feedback helps fellow homeowners choose the right technician.</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Your Review & Experience
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details on timeliness, repair quality, and professional demeanor..."
                className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setReviewModalBooking(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Post Review
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
