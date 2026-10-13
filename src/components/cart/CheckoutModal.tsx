import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Plus,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  sanitizeInput,
  isValidPhone,
  isValidPincode,
  checkoutRateLimiter,
} from '../../utils/security';
import { apiClient } from '../../utils/apiClient';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    addresses,
    addAddress,
    placeOrder,
    currentUser,
    setIsProfileOpen,
  } = useApp();

  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('upi');
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    street: '',
    city: 'Sonipat',
    state: 'Haryana',
    pincode: '131001',
    type: 'home' as const,
    isDefault: false,
  });
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!isCheckoutOpen) return null;

  const currentSelectedAddr =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = sanitizeInput(newAddr.fullName);
    const cleanPhone = sanitizeInput(newAddr.phone);
    const cleanStreet = sanitizeInput(newAddr.street);
    const cleanCity = sanitizeInput(newAddr.city);
    const cleanState = sanitizeInput(newAddr.state);
    const cleanPincode = sanitizeInput(newAddr.pincode);

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter a valid full name (at least 2 characters).');
      return;
    }
    if (!isValidPhone(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!cleanStreet || cleanStreet.length < 5) {
      setErrorMsg('Please provide a complete street address.');
      return;
    }
    if (!isValidPincode(cleanPincode)) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    addAddress({
      fullName: cleanName,
      phone: cleanPhone,
      street: cleanStreet,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      type: newAddr.type,
      isDefault: newAddr.isDefault,
    });
    setIsAddingNewAddr(false);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmOrder = async () => {
    setErrorMsg(null);
    if (!currentSelectedAddr) {
      setErrorMsg('Please select or add a delivery address to proceed.');
      return;
    }

    const rateCheck = checkoutRateLimiter.check();
    if (!rateCheck.allowed) {
      setErrorMsg(rateCheck.message || 'Too many checkout attempts. Please wait.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const order = placeOrder(currentSelectedAddr, paymentMethod);

      if (paymentMethod === 'cod') {
        setCompletedOrder(order);
        setStep('success');
        setIsProcessingPayment(false);
        return;
      }

      // Online payment initialization
      const paymentOrderRes = await apiClient.createPaymentOrder(order.id, order.total);

      if (!paymentOrderRes.success) {
        setCompletedOrder(order);
        setStep('success');
        setIsProcessingPayment(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      interface RazorpayResponse {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
      }

      type RazorpayConstructor = new (options: Record<string, unknown>) => {
        open: () => void;
        on: (event: string, callback: () => void) => void;
      };

      const RazorpayClass = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;

      if (scriptLoaded && RazorpayClass) {
        const options = {
          key: paymentOrderRes.keyId,
          amount: paymentOrderRes.amount,
          currency: paymentOrderRes.currency || 'INR',
          name: 'Velneer Luxe Care',
          description: `Order #${order.id}`,
          order_id: paymentOrderRes.razorpayOrderId,
          prefill: {
            name: currentSelectedAddr.fullName,
            email: currentUser?.email || 'customer@velneer.com',
            contact: currentSelectedAddr.phone,
          },
          theme: {
            color: '#173F30',
          },
          handler: async (response: RazorpayResponse) => {
            const verifyRes = await apiClient.verifyPayment({
              orderId: order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setCompletedOrder((verifyRes.order as Order) || order);
              setStep('success');
            } else {
              setErrorMsg('Payment verification failed. Please contact support.');
            }
            setIsProcessingPayment(false);
          },
          modal: {
            ondismiss: () => {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new RazorpayClass(options);
        rzp.open();
      } else {
        const verifyRes = await apiClient.verifyPayment({
          orderId: order.id,
          razorpayPaymentId: `pay_sandbox_${Date.now()}`,
          razorpayOrderId: paymentOrderRes.razorpayOrderId,
        });
        setCompletedOrder((verifyRes.order as Order) || order);
        setStep('success');
        setIsProcessingPayment(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during order confirmation.';
      setErrorMsg(message);
      setIsProcessingPayment(false);
    }
  };

  const shippingFee = cartSubtotal > 0 && cartSubtotal < 499 ? 40 : 0;

  // Close on ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCheckoutOpen) {
        setIsCheckoutOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckoutOpen, setIsCheckoutOpen]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCheckoutOpen]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCheckoutOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-[#D7E0D6]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#D7E0D6] bg-[#E9EBDD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#173F30]/10 text-[#173F30] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#173F30]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2E342D] leading-tight">
                  Secure Checkout
                </h3>
                <span className="text-[10px] text-[#6B7068]">
                  Velneer Express Checkout
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#D7E0D6] text-[#6B7068] hover:text-[#2E342D] transition-colors cursor-pointer"
              title="Close Checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">

        {step === 'success' && completedOrder ? (
          /* Order Placed Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-extrabold text-[#2E342D]">
              Order Confirmed!
            </h2>
            <p className="text-sm text-[#6B7068] max-w-md mx-auto">
              Thank you for ordering with Velneer. We have received your order{' '}
              <strong className="text-[#173F30]">#{completedOrder.id}</strong>.
            </p>

            <div className="bg-[#E9EBDD] border border-[#D7E0D6] rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#D8C8B3]">Tracking Number:</span>
                <span className="font-mono font-semibold text-[#2E342D]">
                  {completedOrder.trackingNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8C8B3]">Deliver To:</span>
                <span className="font-semibold text-[#2E342D]">
                  {completedOrder.shippingAddress.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D8C8B3]">Payment:</span>
                <span className="font-semibold text-[#2E342D] uppercase">
                  {completedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#2E342D] border-t border-[#D7E0D6] pt-2">
                <span>Amount Paid:</span>
                <span className="text-[#173F30]">₹{completedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Direct WhatsApp Order Sync & Query */}
            <div className="pt-1 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  const message = `Hello Velneer, I just placed an order!\n• Order ID: #${completedOrder.id}\n• Total Amount: ₹${completedOrder.total.toLocaleString('en-IN')}\n• Payment Method: ${completedOrder.paymentMethod.toUpperCase()}\n• Tracking Ref: ${completedOrder.trackingNumber}\n\nPlease share dispatch updates and tracking link when packed. Thank you!`;
                  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '917494980621';
                  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
                }}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.664-.698c.974.53 1.83.811 2.802.812 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.774-5.766zm8.469 5.766c0 4.693-3.813 8.508-8.5 8.508-1.464 0-2.85-.373-4.062-1.031l-4.509 1.182 1.205-4.404c-.754-1.277-1.196-2.77-1.196-4.364 0-4.693 3.813-8.508 8.562-8.508 4.688 0 8.5 3.815 8.5 8.617z" />
                </svg>
                <span>Send Order Query to Velneer on WhatsApp</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsProfileOpen(true);
                }}
                className="w-full sm:w-auto bg-[#2E342D] hover:bg-[#6B7068] text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                View in Order History
              </button>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full sm:w-auto bg-[#173F30] hover:bg-[#2E5E46] text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Multi-step Checkout Flow */
          <div>
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D7E0D6]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 'address'
                      ? 'bg-[#173F30] text-white'
                      : 'bg-[#2E7D32] text-white'
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-xs font-bold ${
                    step === 'address' ? 'text-[#173F30]' : 'text-[#2E342D]'
                  }`}
                >
                  Delivery Address
                </span>
              </div>

              <div className="w-12 h-0.5 bg-[#D7E0D6]" />

              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 'payment'
                      ? 'bg-[#173F30] text-white'
                      : 'bg-[#D7E0D6] text-[#6B7068]'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-bold ${
                    step === 'payment' ? 'text-[#173F30]' : 'text-[#D8C8B3]'
                  }`}
                >
                  Payment & Review
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-red-500 hover:text-red-800 text-xs font-bold ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {step === 'address' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Select Delivery Address
                  </h3>
                  <button
                    onClick={() => setIsAddingNewAddr(!isAddingNewAddr)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingNewAddr ? 'Use Saved' : 'Add New'}</span>
                  </button>
                </div>

                {isAddingNewAddr ? (
                  <form onSubmit={handleSaveNewAddress} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddr.fullName}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, fullName: e.target.value })
                          }
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddr.phone}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, phone: e.target.value })
                          }
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Street Address / Flat / Building
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddr.street}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, street: e.target.value })
                        }
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddr.city}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, city: e.target.value })
                          }
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddr.state}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, state: e.target.value })
                          }
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddr.pincode}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, pincode: e.target.value })
                          }
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                    >
                      Save Address
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selected_addr"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-blue-600"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span>{addr.fullName}</span>
                            <span className="uppercase text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {addr.type}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{addr.street}</p>
                          <p className="text-slate-500">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-slate-500 mt-1">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setStep('payment')}
                    disabled={!currentSelectedAddr}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Payment */
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#2E342D] mb-2">
                    Choose Payment Method
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', desc: 'Instant & Zero Extra Fee' },
                      { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                      { id: 'netbanking', label: 'Net Banking', desc: 'All major Indian banks' },
                      { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay with cash at your doorstep' },
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as Order['paymentMethod'])}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === m.id
                            ? 'border-[#173F30] bg-[#E9EBDD] ring-1 ring-[#173F30]'
                            : 'border-[#D7E0D6] hover:border-[#B9A48B] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={paymentMethod === m.id}
                            onChange={() => setPaymentMethod(m.id as Order['paymentMethod'])}
                            className="accent-[#173F30]"
                          />
                          <span className="text-xs font-bold text-[#2E342D]">
                            {m.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#D8C8B3] ml-5 mt-0.5">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items & Amount Summary */}
                <div className="bg-[#E9EBDD] border border-[#D7E0D6] rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-bold text-[#2E342D] pb-1 border-b border-[#D7E0D6]">
                    Order Summary ({cart.length} unique items)
                  </h4>
                  <div className="max-h-28 overflow-y-auto divide-y divide-[#D7E0D6] pr-1">
                    {cart.map((i) => (
                      <div key={i.product.id} className="py-1 flex justify-between">
                        <span className="truncate max-w-[240px] text-[#6B7068]">
                          {i.quantity}x {i.product.title}
                        </span>
                        <span className="font-semibold text-[#2E342D]">
                          ₹{(i.product.price * i.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#D7E0D6] pt-2 space-y-1">
                    <div className="flex justify-between text-[#D8C8B3]">
                      <span>Subtotal</span>
                      <span className="text-[#2E342D] font-semibold">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-[#2E7D32] font-semibold">
                        <span>Discount</span>
                        <span>-₹{cartDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#D8C8B3]">
                      <span>Shipping</span>
                      <span className="text-[#2E7D32] font-semibold">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#2E342D] pt-1 border-t border-[#D7E0D6]">
                      <span>Total Payable</span>
                      <span className="text-[#173F30]">
                        ₹{cartTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep('address')}
                    className="text-xs text-[#6B7068] hover:text-[#2E342D] font-medium cursor-pointer"
                  >
                    &larr; Back to Address
                  </button>

                  <button
                    onClick={handleConfirmOrder}
                    disabled={isProcessingPayment}
                    className="bg-[#173F30] hover:bg-[#2E5E46] disabled:bg-slate-400 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-4 h-4" />
                        <span>Confirm & Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
</div>
  );
};
