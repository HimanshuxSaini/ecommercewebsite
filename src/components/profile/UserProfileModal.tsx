import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  Shield,
  Trash2,
  Truck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileOpen,
    setIsProfileOpen,
    updateUserProfile,
    orders,
    addresses,
    deleteAddress,
    setDefaultAddress,
    wishlist,
    products,
    addToCart,
    toggleWishlist,
    setCurrentView,
    hasPermission,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>('orders');
  const [editingName, setEditingName] = useState(currentUser?.name || '');
  const [editingPhone, setEditingPhone] = useState(currentUser?.phone || '');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  if (!isProfileOpen || !currentUser) return null;

  // Filter orders placed by current user or show all customer orders for testing
  const userOrders = orders.filter(
    (o) => o.userId === currentUser.id || o.customerEmail === currentUser.email
  );
  const displayOrders = userOrders.length > 0 ? userOrders : orders;

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name: editingName, phone: editingPhone });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  // Close on ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileOpen, setIsProfileOpen]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (isProfileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isProfileOpen]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsProfileOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-[#D7E0D6]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#D7E0D6] bg-[#E9EBDD] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#173F30] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2E342D] leading-tight">
                  {currentUser.name}
                </h3>
                <span className="text-[10px] text-[#6B7068]">
                  {currentUser.email} • {currentUser.role.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsProfileOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#D7E0D6] text-[#6B7068] hover:text-[#2E342D] transition-colors cursor-pointer"
              title="Close Account Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* User Card Top Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D7E0D6]">
              <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E9EBDD] text-[#173F30] font-bold flex items-center justify-center text-base border border-[#B9A48B]">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#2E342D]">{currentUser.name}</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B]">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-[#6B7068]">{currentUser.email}</p>
            </div>
          </div>

          {hasPermission('manager') && (
            <button
              onClick={() => {
                setIsProfileOpen(false);
                setCurrentView('admin');
              }}
              className="bg-[#2E342D] hover:bg-[#6B7068] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#D8C8B3]" />
              <span>Open Admin Panel</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#D7E0D6] mt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#173F30] text-[#173F30]'
                : 'border-transparent text-[#D8C8B3] hover:text-[#2E342D]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({displayOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'wishlist'
                ? 'border-[#173F30] text-[#173F30]'
                : 'border-transparent text-[#D8C8B3] hover:text-[#2E342D]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlistedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'addresses'
                ? 'border-[#173F30] text-[#173F30]'
                : 'border-transparent text-[#D8C8B3] hover:text-[#2E342D]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'border-[#173F30] text-[#173F30]'
                : 'border-transparent text-[#D8C8B3] hover:text-[#2E342D]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-5">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {displayOrders.length === 0 ? (
                <div className="text-center py-10 text-[#D8C8B3] text-xs">
                  No orders placed yet. Start exploring our deals!
                </div>
              ) : (
                displayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-[#D7E0D6] bg-white hover:border-[#B9A48B] transition-shadow space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#D7E0D6]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#2E342D]">
                            #{order.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#D8C8B3]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                        <span className="text-xs sm:text-sm font-extrabold text-[#2E342D]">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#D8C8B3] uppercase">
                          Via {order.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.imageUrl}
                              alt={item.productTitle}
                              className="w-8 h-8 rounded object-cover border border-[#D7E0D6]"
                            />
                            <span className="font-medium text-[#2E342D] line-clamp-1 max-w-[260px]">
                              {item.quantity}x {item.productTitle}
                            </span>
                          </div>
                          <span className="font-semibold text-[#6B7068]">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#D7E0D6] text-xs">
                      <span className="text-[11px] text-[#D8C8B3]">
                        Tracking: <strong className="font-mono text-[#2E342D]">{order.trackingNumber || 'SV-EXP-1102'}</strong>
                      </span>
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="text-[#173F30] hover:text-[#2E5E46] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Delivery</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wishlistedProducts.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-[#D8C8B3] text-xs">
                  Your wishlist is empty. Tap the heart icon on any product to save it here!
                </div>
              ) : (
                wishlistedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-[#D7E0D6] flex items-center gap-3 bg-white hover:border-[#B9A48B]"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-16 h-16 rounded-lg object-contain bg-[#E9EBDD] border border-[#D7E0D6] p-1"
                    />
                    <div className="flex-1 text-xs">
                      <h4 className="font-semibold text-[#2E342D] line-clamp-1">{p.title}</h4>
                      <p className="font-bold text-[#173F30] mt-0.5">
                        ₹{p.price.toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="bg-[#2E342D] hover:bg-[#173F30] text-white text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="text-[#D8C8B3] hover:text-[#E63946] text-[11px] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-xl border border-[#D7E0D6] bg-white flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#2E342D]">
                      <span>{addr.fullName}</span>
                      <span className="uppercase text-[9px] bg-[#E9EBDD] text-[#173F30] px-1.5 py-0.5 rounded border border-[#B9A48B]">
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[9px] bg-emerald-100 text-[#2E7D32] px-1.5 py-0.5 rounded font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[#6B7068] mt-1">{addr.street}</p>
                    <p className="text-[#D8C8B3]">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[#D8C8B3] mt-1">Phone: {addr.phone}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0 items-end">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] text-[#173F30] hover:underline cursor-pointer font-medium"
                      >
                        Set Default
                      </button>
                    )}
                    {addresses.length > 1 && (
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-[#D8C8B3] hover:text-[#E63946] cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROFILE SETTINGS TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md text-xs">
              <div>
                <label className="font-semibold text-[#2E342D] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full bg-[#E9EBDD] border border-[#B9A48B] rounded-lg p-2.5 text-xs text-[#2E342D] focus:outline-none focus:ring-1 focus:ring-[#173F30]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2E342D] block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full bg-[#D7E0D6]/50 border border-[#B9A48B] rounded-lg p-2.5 text-xs text-[#D8C8B3] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2E342D] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingPhone}
                  onChange={(e) => setEditingPhone(e.target.value)}
                  className="w-full bg-[#E9EBDD] border border-[#B9A48B] rounded-lg p-2.5 text-xs text-[#2E342D] focus:outline-none focus:ring-1 focus:ring-[#173F30]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#2E342D] hover:bg-[#173F30] text-white font-bold py-2.5 px-5 rounded-lg transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Order Tracker (Embedded Inline View - No Center Popups) */}
        {trackingOrder && (
          <div className="mt-4 p-4 rounded-xl bg-[#E9EBDD] border border-[#B9A48B] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2E342D] font-bold text-xs">
                <Truck className="w-4 h-4 text-[#173F30]" />
                <span>Live Tracker: #{trackingOrder.trackingNumber}</span>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="text-xs text-[#6B7068] hover:text-[#2E342D] font-bold p-1 cursor-pointer"
              >
                Close Tracking &times;
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { title: 'Order Placed', desc: 'Order received & payment confirmed', done: true },
                { title: 'Packed at Hub', desc: 'Verified and packed at Delhi NCR Hub', done: true },
                { title: 'Out for Delivery', desc: 'Dispatched with local delivery fleet', done: trackingOrder.status === 'Shipped' || trackingOrder.status === 'Delivered' },
                { title: 'Delivered', desc: 'Delivered safely at your doorstep', done: trackingOrder.status === 'Delivered' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      step.done
                        ? 'bg-[#2E7D32] text-white'
                        : 'bg-[#D7E0D6] text-[#6B7068]'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div className="text-[11px]">
                    <p className={`font-bold ${step.done ? 'text-[#2E342D]' : 'text-[#6B7068]'}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-[#6B7068]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
  );
};
