import React, { useState } from 'react';
import { 
  Star, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  ThumbsUp, 
  Sparkles,
  Briefcase
} from 'lucide-react';
import { Booking } from '../../types';
import { bookingService } from '../../services/api';

interface RateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSuccess: () => void;
}

const RATING_LABELS: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: 'Poor', desc: 'Work did not meet basic expectations', color: 'text-rose-500' },
  2: { label: 'Fair', desc: 'Acceptable but had several shortcomings', color: 'text-amber-500' },
  3: { label: 'Good', desc: 'Solid repair and acceptable service', color: 'text-amber-500' },
  4: { label: 'Very Good', desc: 'Thorough, high quality, and professional', color: 'text-emerald-500' },
  5: { label: 'Outstanding!', desc: 'Exceptional workmanship & highly recommended', color: 'text-amber-400' }
};

const QUICK_FEEDBACK_CHIPS = [
  '⚡ Arrived exactly on time',
  '🔧 Expert workmanship & tools',
  '💰 Fair and transparent price',
  '🧼 Cleaned up work area nicely',
  '🤝 Polite and respectful communication',
  '🛡️ Fixed the problem on first trip'
];

export const RateReviewModal: React.FC<RateReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess
}) => {
  const [rating, setRating] = useState<number>(booking.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(booking.reviewComment || '');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;

  const handleChipClick = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(prev => prev.filter(c => c !== chip));
      // Remove chip phrase from comment if present
      setComment(prev => prev.replace(chip, '').replace(/,\s*,/g, ',').trim());
    } else {
      setSelectedChips(prev => [...prev, chip]);
      setComment(prev => {
        if (!prev.trim()) return chip;
        return `${prev.trim()}, ${chip}`;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalComment = comment.trim() || 'Great professional workmanship and prompt repair.';
      await bookingService.submitReview(booking.id, rating, finalComment);
      setSubmittedNotice(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmittedNotice(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit review', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedNotice ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Thank You for Your Review!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Your verified rating helps other homeowners find trustworthy technicians across Addis Ababa.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Header: Technician details */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg ring-1 ring-amber-500/20 shrink-0">
                <Briefcase className="w-6 h-6 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                  Rate {booking.workerName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {booking.workerTrade} • {booking.serviceDescription}
                </p>
              </div>
            </div>

            {/* Interactive Golden Stars */}
            <div className="text-center py-2 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Tap Stars to Rate
              </span>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= currentDisplayRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      title={`${star} star`}
                    >
                      <Star
                        className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                          isActive
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Rating Label */}
              <div className="h-6">
                <span className={`text-sm font-black ${RATING_LABELS[currentDisplayRating]?.color || 'text-slate-900'}`}>
                  {currentDisplayRating} / 5 — {RATING_LABELS[currentDisplayRating]?.label}
                </span>
                <span className="text-xs text-slate-400 block text-[11px]">
                  {RATING_LABELS[currentDisplayRating]?.desc}
                </span>
              </div>
            </div>

            {/* Quick 1-Tap Feedback Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                Quick Feedback (Tap to add):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_FEEDBACK_CHIPS.map((chip, i) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Detailed Feedback (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share any specific details about the repair quality, arrival time, or equipment used...`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Star className="w-4 h-4 fill-slate-950" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
