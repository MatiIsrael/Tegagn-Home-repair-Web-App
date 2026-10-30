import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Phone, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Booking } from '../../types';
import { bookingService } from '../../services/api';

interface RebackModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onRebackSuccess?: () => void;
}

export const RebackModal: React.FC<RebackModalProps> = ({
  isOpen,
  onClose,
  booking,
  onRebackSuccess,
}) => {
  if (!isOpen || !booking) return null;

  const [selectedReason, setSelectedReason] = useState<string>(
    'Technician did not arrive within the promised arrival window (Overdue)'
  );
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refundResult, setRefundResult] = useState<{ transactionId: string; amount: number } | null>(null);

  const totalCost = (booking.estimatedCost || 242) + 10;
  const refundDestination = booking.paymentMethod || 'Mobile Money (Telebirr)';
  const customerPhone = booking.customerPhone || '+251 91 123 4567';

  const handleConfirmReback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullReason = customNotes.trim()
        ? `${selectedReason} - ${customNotes.trim()}`
        : selectedReason;

      const res = await bookingService.processRebackRefund(booking.id, {
        reason: fullReason,
        refundAmount: totalCost,
        refundAccount: customerPhone,
      });

      setIsSubmitting(false);
      setRefundResult({ transactionId: res.transactionId, amount: res.amount });

      if (onRebackSuccess) {
        onRebackSuccess();
      }
    } catch (err) {
      console.error('Reback refund failed', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white">
                100% Re-back Guarantee
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                Cancel order & return full payment to your account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {refundResult ? (
          <div className="p-6 sm:p-8 text-center space-y-4 sm:space-y-5 my-auto overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-widest block">
                Re-back Successful
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                ${refundResult.amount.toFixed(2)} Refund Processed
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                100% of your funds have been returned to your <strong className="text-slate-900 dark:text-white">{refundDestination}</strong> ({customerPhone}).
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Refund Ref:</span>
                <span className="font-bold text-slate-900 dark:text-white">{refundResult.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">Completed (Re-backed)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Policy:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Tegagn On-Time Guarantee</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Done & Return to My Orders
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmReback} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            
            {/* Policy Info Card */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 sm:gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold block">Tegagn Punctuality & Arrival Guarantee</span>
                <p className="text-[10px] sm:text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                  If your technician cannot reach your home within the scheduled arrival window, you are entitled to a full 100% instant refund with zero penalties.
                </p>
              </div>
            </div>

            {/* Refund Summary */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 sm:space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 gap-2">
                <span>Service Booking:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] text-right">
                  {booking.serviceDescription}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Technician:</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking.workerName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 gap-2">
                <span>Re-back Destination:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate text-right">
                  {refundDestination} ({customerPhone})
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">100% Refund Amount:</span>
                <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Reason for Re-back / Cancellation *
              </label>
              
              <div className="space-y-2 text-xs">
                {[
                  'Technician did not arrive within the promised arrival window (Overdue)',
                  'Technician called and said they are unable to come',
                  'Technician is unreachable / not answering phone',
                  'Emergency or change of schedule'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedReason === reason
                        ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rebackReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500 shrink-0"
                    />
                    <span className="leading-snug">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Share any additional details about the technician's delay..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-2.5 sm:py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Processing Re-back...' : 'Confirm & Re-back Refund'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
