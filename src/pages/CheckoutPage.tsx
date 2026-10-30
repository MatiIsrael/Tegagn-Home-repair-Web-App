import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Banknote, 
  ShieldCheck, 
  Info, 
  Clock, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { cartService, CartItem } from '../services/cartService';
import { authService, bookingService } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = authService.getStoredUser();

  const [items, setItems] = useState<CartItem[]>(() => cartService.getItems());
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Credit/Debit Card' | 'Bank Transfer' | 'Cash on Delivery'>('Mobile Money');
  const [mobileProvider, setMobileProvider] = useState<'Telebirr' | 'CBE Birr' | 'M-Pesa'>('Telebirr');
  const [phoneNumber, setPhoneNumber] = useState(storedUser?.phoneNumber || '+251 912 345 678');
  const [streetAddress, setStreetAddress] = useState('123 Main Street');
  const [city, setCity] = useState('Addis Ababa');

  // Card details
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Bank Transfer
  const [bankName, setBankName] = useState('Commercial Bank of Ethiopia (CBE)');
  const [bankTxRef, setBankTxRef] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If cart is empty, redirect to cart
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Pricing calculations (Matching reference Image 2)
  const productSubtotal = items.reduce((sum, item) => sum + (item.hourlyRate * item.hours), 0);
  const deliveryFee = 10;
  const platformFee = Number((productSubtotal * 0.07).toFixed(2));
  const totalAmount = productSubtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const selectedPaymentTitle = paymentMethod === 'Mobile Money' 
        ? `Mobile Money (${mobileProvider})` 
        : paymentMethod;

      const fullAddress = `${streetAddress.trim()}, ${city.trim()}`;
      const now = new Date();
      const arrivalDeadline = new Date(now.getTime() + 45 * 60 * 1000).toISOString();

      // Create booking for each cart item with Completed payment status
      for (const item of items) {
        await bookingService.createBooking({
          workerId: item.workerId,
          workerName: item.providerName,
          workerTrade: item.trade,
          serviceDescription: `${item.serviceTitle} (${item.hours} hrs service)`,
          scheduledDate: now.toISOString().split('T')[0],
          scheduledTime: '10:00 AM - 12:00 PM',
          location: fullAddress,
          customerPhone: phoneNumber,
          estimatedCost: item.hourlyRate * item.hours,
          paymentMethod: selectedPaymentTitle,
          paymentStatus: 'Completed', // Payment is finished during checkout!
          paymentDetails: {
            methodTitle: selectedPaymentTitle,
            mobileProvider: paymentMethod === 'Mobile Money' ? mobileProvider : undefined,
            phoneOrAccount: paymentMethod === 'Mobile Money' ? phoneNumber : bankTxRef || 'Direct',
            subtotal: item.hourlyRate * item.hours,
            deliveryFee: 10,
            platformFee: Number(((item.hourlyRate * item.hours) * 0.07).toFixed(2)),
            totalAmount: (item.hourlyRate * item.hours) + 10,
            transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
            paidAt: now.toISOString(),
          },
          rebackGuarantee: {
            deadlineMinutes: 45,
            acceptedAt: now.toISOString(),
            arrivalDeadline,
            isOverdue: false,
          }
        });
      }

      // Clear the cart
      cartService.clearCart();

      // Immediately navigate directly into "My Orders" tab on Customer Dashboard!
      navigate('/customer/dashboard?tab=orders');
    } catch (err) {
      console.error('Order placement failed', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      
      {/* Top Breadcrumb / Back button */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Re-back Guarantee Escrow</span>
        </div>
      </div>

      {/* Main Page Title (Matching Screenshot 2: Checkout) */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Finalize your service location and payment method to dispatch verified professionals
        </p>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column (7 cols): Order Items, Delivery Address, Payment Method */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* 1. Order Items (Matching Screenshot 2) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Order Items
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.serviceTitle}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-1 ring-slate-100 dark:ring-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.serviceTitle}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {item.providerName.startsWith('by ') ? item.providerName : `by ${item.providerName}`}
                          </span>
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-mono">
                          {item.hours} × ${item.hourlyRate.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono shrink-0">
                      ${(item.hourlyRate * item.hours).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Delivery Address (Matching Screenshot 2) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Delivery Address</span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="123 Main Street, House #402"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Addis Ababa"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
                      <span>Phone Number *</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold normal-case">For Technician</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251 912 345 678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method (Exact 4 options from Screenshot 2) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Payment Method
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select Payment Method
                </p>
              </div>

              <div className="space-y-3">
                
                {/* Option 1: Mobile Money */}
                <div
                  onClick={() => setPaymentMethod('Mobile Money')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === 'Mobile Money'
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <input
                      type="radio"
                      name="checkoutPayment"
                      checked={paymentMethod === 'Mobile Money'}
                      onChange={() => setPaymentMethod('Mobile Money')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0"
                    />
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Mobile Money
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Telebirr, M-Pesa, HelloCash, CBE Birr
                      </p>
                    </div>
                  </div>

                  {paymentMethod === 'Mobile Money' && (
                    <div className="mt-3.5 pt-3.5 border-t border-emerald-100 dark:border-emerald-900/30 pl-7 sm:pl-8 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {(['Telebirr', 'CBE Birr', 'M-Pesa'] as const).map((prov) => (
                          <button
                            key={prov}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setMobileProvider(prov); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              mobileProvider === prov
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {prov}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+251 912 345 678"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Instant payment with 100% Re-back Guarantee if technician cannot arrive on time.</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Option 2: Credit/Debit Card */}
                <div
                  onClick={() => setPaymentMethod('Credit/Debit Card')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === 'Credit/Debit Card'
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <input
                      type="radio"
                      name="checkoutPayment"
                      checked={paymentMethod === 'Credit/Debit Card'}
                      onChange={() => setPaymentMethod('Credit/Debit Card')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0"
                    />
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Credit/Debit Card
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Visa, Mastercard
                      </p>
                    </div>
                  </div>

                  {paymentMethod === 'Credit/Debit Card' && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 pl-7 sm:pl-8 space-y-2.5">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Card Number"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 3: Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('Bank Transfer')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === 'Bank Transfer'
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <input
                      type="radio"
                      name="checkoutPayment"
                      checked={paymentMethod === 'Bank Transfer'}
                      onChange={() => setPaymentMethod('Bank Transfer')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0"
                    />
                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Bank Transfer
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Upload payment receipt / Transaction reference
                      </p>
                    </div>
                  </div>

                  {paymentMethod === 'Bank Transfer' && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 pl-7 sm:pl-8 space-y-2.5 text-xs">
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium"
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>

                {/* Option 4: Cash on Delivery / Completion */}
                <div
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <input
                      type="radio"
                      name="checkoutPayment"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0"
                    />
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Cash on Delivery
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Pay when you receive / After repair inspection
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Payment Summary (Matching Screenshot 2) */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5 lg:sticky lg:top-24">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Payment Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
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
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Platform Fee (7%)</span>
                    </div>
                    <span className="font-bold font-mono">${platformFee.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 italic">
                    This fee supports platform operations and is deducted from worker revenue
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order Button (Matching Screenshot 2) */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 text-center transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] sm:text-[11px] text-slate-400 text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>

              {/* Escrow Guarantee Pill */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Re-back Guarantee Included</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Your payment is secured in Tegagn Escrow. If the technician does not arrive within the 45-minute arrival window, your money is 100% refunded immediately.
                </p>
              </div>

            </div>
          </div>

        </div>
      </form>

    </div>
  );
};
