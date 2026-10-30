import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Banknote, 
  ShieldCheck, 
  Info,
  Clock
} from 'lucide-react';
import { Booking } from '../../types';
import { bookingService } from '../../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSuccess?: (updatedBooking: Booking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}) => {
  if (!isOpen || !booking) return null;

  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Credit/Debit Card' | 'Bank Transfer' | 'Cash on Delivery'>('Mobile Money');
  const [mobileProvider, setMobileProvider] = useState<'Telebirr' | 'CBE Birr' | 'M-Pesa'>('Telebirr');
  const [phoneNumber, setPhoneNumber] = useState(booking.customerPhone || '+251 91 123 4567');
  const [streetAddress, setStreetAddress] = useState(booking.location || '123 Main Street, Bole Atlas');
  const [city, setCity] = useState('Addis Ababa');
  
  // Card inputs
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Bank Transfer
  const [bankName, setBankName] = useState('Commercial Bank of Ethiopia (CBE)');
  const [bankTxRef, setBankTxRef] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Pricing calculations (matching Screenshot 2: Subtotal $242 + Delivery $10 = Total $252)
  const productSubtotal = booking.estimatedCost || 242;
  const deliveryFee = 10;
  const platformFee = Number(((productSubtotal * 0.07)).toFixed(2)) || 16.94;
  const totalAmount = productSubtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const updated = await bookingService.completePayment(booking.id, {
        method: paymentMethod,
        provider: paymentMethod === 'Mobile Money' ? mobileProvider : undefined,
        phoneOrAccount: paymentMethod === 'Mobile Money' ? phoneNumber : bankTxRef || 'Direct',
        subtotal: productSubtotal,
        deliveryFee,
        platformFee,
        totalAmount,
      });

      setIsProcessing(false);
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        if (updated && onPaymentSuccess) {
          onPaymentSuccess(updated);
        }
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Payment error', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Checkout
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Finalize payment method & confirm booking service order
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successNotice ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Payment Completed & Protected!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Your payment of <strong className="text-emerald-600 dark:text-emerald-400">${totalAmount.toFixed(2)}</strong> via {paymentMethod} is secured in Tegagn Escrow with 100% Re-back Guarantee.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (7 cols): Order Items, Address, Payment Method */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Order Items */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Order Items
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {booking.serviceDescription}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          by <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.workerName}</span> ({booking.workerTrade})
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          1 × ${productSubtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono shrink-0">
                      ${productSubtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 2. Delivery Address */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Delivery Address</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="123 Main Street"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Addis Ababa"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+251 912 345 678"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method (Exact 4 options from Screenshot 2) */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Payment Method
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select Payment Method
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    
                    {/* Option 1: Mobile Money */}
                    <div
                      onClick={() => setPaymentMethod('Mobile Money')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'Mobile Money'
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'Mobile Money'}
                          onChange={() => setPaymentMethod('Mobile Money')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Mobile Money
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Telebirr, M-Pesa, HelloCash, CBE Birr
                          </p>
                        </div>
                      </div>

                      {paymentMethod === 'Mobile Money' && (
                        <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30 pl-7 space-y-2.5">
                          <div className="flex items-center gap-2">
                            {(['Telebirr', 'CBE Birr', 'M-Pesa'] as const).map((prov) => (
                              <button
                                key={prov}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setMobileProvider(prov); }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  mobileProvider === prov
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {prov}
                              </button>
                            ))}
                          </div>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-2.5" />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+251 91 123 4567"
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                            <span>Instant payment with 100% Re-back Guarantee if worker doesn't arrive.</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Credit/Debit Card */}
                    <div
                      onClick={() => setPaymentMethod('Credit/Debit Card')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'Credit/Debit Card'
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'Credit/Debit Card'}
                          onChange={() => setPaymentMethod('Credit/Debit Card')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Credit/Debit Card
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Visa, Mastercard
                          </p>
                        </div>
                      </div>

                      {paymentMethod === 'Credit/Debit Card' && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 pl-7 space-y-2">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card Number"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <input
                              type="text"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="CVV"
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 3: Bank Transfer */}
                    <div
                      onClick={() => setPaymentMethod('Bank Transfer')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'Bank Transfer'
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'Bank Transfer'}
                          onChange={() => setPaymentMethod('Bank Transfer')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Bank Transfer
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Upload payment receipt / Transaction reference
                          </p>
                        </div>
                      </div>

                      {paymentMethod === 'Bank Transfer' && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 pl-7 space-y-2 text-xs">
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option>Commercial Bank of Ethiopia (CBE) - 100028471928</option>
                            <option>Awash Bank - 01320492817200</option>
                            <option>Dashen Bank - 5019284719283</option>
                          </select>
                          <input
                            type="text"
                            value={bankTxRef}
                            onChange={(e) => setBankTxRef(e.target.value)}
                            placeholder="Enter Transaction Reference (e.g. FT26301A9)"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>

                    {/* Option 4: Cash on Delivery / Completion */}
                    <div
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'Cash on Delivery'
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'Cash on Delivery'}
                          onChange={() => setPaymentMethod('Cash on Delivery')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Cash on Delivery
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Pay when you receive / After repair inspection
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column (5 cols): Payment Summary (Matching Screenshot 2) */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Payment Summary
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Product Subtotal</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        ${productSubtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Delivery Fee</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        ${deliveryFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          <span>Platform Fee (7%)</span>
                        </div>
                        <span className="font-bold font-mono">${platformFee.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                        This fee supports platform operations and is deducted from worker revenue
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Total Amount
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Place Order Button (Matching Screenshot 2) */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 text-center transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing Payment...' : 'Place Order'}
                    </button>
                    <p className="text-[11px] text-slate-400 text-center">
                      By placing this order, you agree to our terms and conditions
                    </p>
                  </div>

                  {/* Escrow & Re-back Guarantee Notice */}
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Re-back Guarantee Included</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      If the technician cannot arrive at your home within the designated time window, your funds are returned instantly to your account.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
};
