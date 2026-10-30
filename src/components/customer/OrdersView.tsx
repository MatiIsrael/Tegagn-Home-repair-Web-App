import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2,
  AlertTriangle, 
  Phone, 
  CreditCard, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Booking } from '../../types';
import { bookingService } from '../../services/api';
import { CheckoutModal } from './CheckoutModal';
import { RebackModal } from './RebackModal';

interface OrdersViewProps {
  bookings: Booking[];
  onRefresh: () => void;
  onBrowseMarketplace: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  bookings,
  onRefresh,
  onBrowseMarketplace,
}) => {
  const [activeCheckoutBooking, setActiveCheckoutBooking] = useState<Booking | null>(null);
  const [activeRebackBooking, setActiveRebackBooking] = useState<Booking | null>(null);

  // Live timer tick for arrival windows
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateRemainingSeconds = (booking: Booking): number => {
    if (!booking.rebackGuarantee?.arrivalDeadline) return 45 * 60;
    const deadline = new Date(booking.rebackGuarantee.arrivalDeadline).getTime();
    const remaining = Math.floor((deadline - Date.now()) / 1000);
    return remaining;
  };

  const handleSimulateExpired = async (bookingId: string) => {
    await bookingService.simulateArrivalWindowExpired(bookingId);
    onRefresh();
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 w-full max-w-full overflow-hidden">
      
      {/* Page Header (Matching Image 1: My Orders) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Orders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Track technician arrival, complete escrow payments, and access 100% Re-back Guarantee protection.
          </p>
        </div>

        {/* Protection Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 self-start sm:self-auto shrink-0 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Re-back Guarantee Active</span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto" />
          <p className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
            You don't have any orders yet
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book verified plumbing, electrical, and repair professionals from our marketplace.
          </p>
          <button
            type="button"
            onClick={onBrowseMarketplace}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm cursor-pointer transition-colors"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {bookings.map((booking) => {
            const subtotal = booking.estimatedCost || 242;
            const deliveryFee = 10;
            const totalCost = subtotal + deliveryFee;
            const remainingSeconds = calculateRemainingSeconds(booking);
            const isOverdue = booking.rebackGuarantee?.isOverdue || remainingSeconds <= 0;

            const minutes = Math.max(0, Math.floor(remainingSeconds / 60));
            const seconds = Math.max(0, remainingSeconds % 60);

            return (
              <div
                key={booking.id}
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden"
              >
                
                {/* 1. Header (Matching Screenshot 1) */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-base font-black text-slate-900 dark:text-white block">
                      1 item
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                      from <strong className="text-slate-900 dark:text-white">{booking.workerName}</strong> ({booking.workerTrade})
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ordered on {booking.scheduledDate || 'October 29, 2026'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{booking.location || 'Addis Ababa'}</span>
                    </p>
                  </div>

                  {/* Right Header: Status Badge & Red Cancel Order Button */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto shrink-0">
                    <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      booking.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : booking.status === 'accepted'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        : booking.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {booking.status === 'accepted' ? 'Accepted' : booking.status}
                    </span>

                    {/* Red Cancel Order Button */}
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => setActiveRebackBooking(booking)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Cancel Order & Claim 100% Re-back Refund"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Middle Row: Service Item & Cost (Matching Screenshot 1 Gray Bar) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl px-3.5 sm:px-4 py-3 my-3 sm:my-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {booking.serviceDescription}
                    </span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">× 1</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono shrink-0">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* 3. Re-backing Arrival Guarantee Banner (When Accepted or In Progress) */}
                {(booking.status === 'accepted' || booking.status === 'pending') && (
                  <div className={`p-3 sm:p-4 rounded-xl border my-3 sm:my-4 transition-all ${
                    isOverdue
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                      : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isOverdue ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="text-xs font-black uppercase tracking-wider">
                              {isOverdue ? '⚠️ Arrival Time Window Expired' : '⏱️ 45-Min Guaranteed Arrival Window'}
                            </span>
                            {!isOverdue && (
                              <span className="text-[11px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-200/70 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200">
                                {minutes}m {seconds.toString().padStart(2, '0')}s remaining
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                            {isOverdue
                              ? 'Technician did not reach your location within the agreed time. You are eligible for an immediate 100% Re-back Refund.'
                              : 'Technician has accepted your booking and is en route. If they cannot reach your home within the window, you receive a 100% full refund.'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons for Re-back / Simulation */}
                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center pt-1 md:pt-0">
                        {isOverdue ? (
                          <button
                            type="button"
                            onClick={() => setActiveRebackBooking(booking)}
                            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Claim 100% Re-back Refund</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSimulateExpired(booking.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-[10px] font-bold text-amber-800 dark:text-amber-300 cursor-pointer"
                            title="Simulate 45 minutes elapsed to test the overdue re-back refund flow"
                          >
                            ⚡ Test: Simulate Timeout
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Bottom Row (Matching Screenshot 1: 3 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Column 1: Payment */}
                  <div>
                    <span className="text-[11px] sm:text-xs font-medium text-slate-400 block">
                      Payment
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5 truncate">
                      {booking.paymentMethod || 'Mobile Money'}
                    </span>
                  </div>

                  {/* Column 2: Payment Status */}
                  <div>
                    <span className="text-[11px] sm:text-xs font-medium text-slate-400 block">
                      Payment Status
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {booking.paymentStatus === 'Completed' ? (
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Completed</span>
                        </span>
                      ) : booking.paymentStatus === 'Refunded' ? (
                        <span className="text-xs sm:text-sm font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <RotateCcw className="w-4 h-4 shrink-0" />
                          <span>Refunded (Re-backed)</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400">
                            Pending
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveCheckoutBooking(booking)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                          >
                            Finish Payment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Total Cost */}
                  <div>
                    <span className="text-[11px] sm:text-xs font-medium text-slate-400 block">
                      Total Cost
                    </span>
                    <span className="text-sm sm:text-base md:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Checkout Modal */}
      {activeCheckoutBooking && (
        <CheckoutModal
          isOpen={Boolean(activeCheckoutBooking)}
          onClose={() => setActiveCheckoutBooking(null)}
          booking={activeCheckoutBooking}
          onPaymentSuccess={() => {
            onRefresh();
          }}
        />
      )}

      {/* Re-back Guarantee Modal */}
      {activeRebackBooking && (
        <RebackModal
          isOpen={Boolean(activeRebackBooking)}
          onClose={() => setActiveRebackBooking(null)}
          booking={activeRebackBooking}
          onRebackSuccess={() => {
            onRefresh();
          }}
        />
      )}

    </div>
  );
};
