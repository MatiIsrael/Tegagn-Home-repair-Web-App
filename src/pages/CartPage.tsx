import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Calendar, 
  MapPin,
  Phone, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { cartService, CartItem } from '../services/cartService';
import { authService, bookingService } from '../services/api';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Modal } from '../components/common/Modal';

export const CartPage: React.FC = () => {
  const { t } = useThemeLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(() => cartService.getItems());
  const storedUser = authService.getStoredUser();

  // Refresh items on cart changes
  useEffect(() => {
    const handleCartChange = () => {
      setItems(cartService.getItems());
    };
    window.addEventListener('tegagn_cart_changed', handleCartChange);
    return () => window.removeEventListener('tegagn_cart_changed', handleCartChange);
  }, []);

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00 AM - 12:00 PM',
    location: 'Bole Medhanialem, Addis Ababa',
    phone: storedUser?.phoneNumber || '+251 91 123 4567',
    notes: 'Please bring required PPR tools & parts.'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.hourlyRate * item.hours), 0);
  const inspectionFee = items.length > 0 ? 50 : 0;
  const total = subtotal + inspectionFee;

  const handleProceedToCheckout = () => {
    if (!storedUser) {
      navigate(`/login?redirect=${encodeURIComponent('/cart')}`);
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      // Create bookings for each item in cart
      for (const item of items) {
        await bookingService.createBooking({
          workerId: item.workerId,
          serviceDescription: `${item.serviceTitle} (${item.hours} hrs service)`,
          scheduledDate: checkoutData.date,
          scheduledTime: checkoutData.time,
          location: checkoutData.location,
          customerPhone: checkoutData.phone || '+251 91 123 4567',
        });
      }
      cartService.clearCart();
      setBookingConfirmed(true);
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your selected trade repair services and dispatch options
        </p>
      </div>

      {items.length === 0 ? (
        /* Empty Cart State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            You haven't added any repair services to your cart yet. Explore our verified professionals to get started.
          </p>
          <div className="mt-6">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Cart Grid Layout (Matching Image 2) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: List of Services */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.imageUrl}
                    alt={item.serviceTitle}
                    className="w-20 h-20 rounded-xl object-cover ring-1 ring-slate-100 dark:ring-slate-800 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {item.serviceTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {item.providerName}
                    </p>
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {item.hourlyRate} ETB/hr
                    </p>
                  </div>
                </div>

                {/* Right: Quantity / Hours Selector & Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  
                  {/* Quantity / Hours Stepper */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => cartService.updateHours(item.id, item.hours - 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      title="Decrease hours"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">
                      {item.hours}
                    </span>
                    <button
                      type="button"
                      onClick={() => cartService.updateHours(item.id, item.hours + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      title="Increase hours"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {(item.hourlyRate * item.hours).toFixed(2)} ETB
                    </span>
                  </div>

                  {/* Delete Trash Button */}
                  <button
                    type="button"
                    onClick={() => cartService.removeItem(item.id)}
                    className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary Card (Matching Image 2) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Items ({items.length})</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {subtotal.toFixed(2)} ETB
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Inspection Fee</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {inspectionFee.toFixed(2)} ETB
                  </span>
                </div>
                
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-2xl font-black text-amber-500">
                    {total.toFixed(2)} ETB
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-center"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/marketplace"
                  className="block w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all text-center cursor-pointer"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Verified Guarantee Pill */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/30 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Fair pricing & verified certified technician guarantee.</span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Checkout Modal */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Confirm Service Dispatch"
      >
        {bookingConfirmed ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Booking Confirmed!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Your service request has been sent to the technician. You can track progress in your Customer Dashboard.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setCheckoutModalOpen(false);
                  navigate('/customer/dashboard?tab=orders');
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm cursor-pointer shadow-xs"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setCheckoutModalOpen(false);
                  navigate('/marketplace');
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm cursor-pointer"
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmOrder} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Service Address in Addis Ababa
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={checkoutData.location}
                  onChange={(e) => setCheckoutData({ ...checkoutData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
                <span>Contact Phone Number *</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold normal-case">For technician call</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={checkoutData.phone}
                  onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                  placeholder="+251 91 123 4567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Scheduled Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    value={checkoutData.date}
                    onChange={(e) => setCheckoutData({ ...checkoutData, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                  <select
                    value={checkoutData.time}
                    onChange={(e) => setCheckoutData({ ...checkoutData, time: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                  >
                    <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between font-medium text-slate-600 dark:text-slate-400">
                <span>Total Services:</span>
                <span>{items.length} items</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount:</span>
                <span className="text-amber-500 text-sm">{total.toFixed(2)} ETB</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Order'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
