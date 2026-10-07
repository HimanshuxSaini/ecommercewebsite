import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  Shield,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  ExternalLink,
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={() => setIsProfileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Top Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E2DC]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F5F1EC] text-[#8C6F52] font-bold flex items-center justify-center text-base border border-[#C6B8AB]">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1F1F1F]">{currentUser.name}</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#F5F1EC] text-[#8C6F52] border border-[#C6B8AB]">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-[#3A3A3A]">{currentUser.email}</p>
            </div>
          </div>

          {hasPermission('manager') && (
            <button
              onClick={() => {
                setIsProfileOpen(false);
                setCurrentView('admin');
              }}
              className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Open Admin Panel</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E2DC] mt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#8C6F52] text-[#8C6F52]'
                : 'border-transparent text-[#A8927D] hover:text-[#1F1F1F]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({displayOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'wishlist'
                ? 'border-[#8C6F52] text-[#8C6F52]'
                : 'border-transparent text-[#A8927D] hover:text-[#1F1F1F]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlistedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'addresses'
                ? 'border-[#8C6F52] text-[#8C6F52]'
                : 'border-transparent text-[#A8927D] hover:text-[#1F1F1F]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'border-[#8C6F52] text-[#8C6F52]'
                : 'border-transparent text-[#A8927D] hover:text-[#1F1F1F]'
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
                <div className="text-center py-10 text-[#A8927D] text-xs">
                  No orders placed yet. Start exploring our deals!
                </div>
              ) : (
                displayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-[#E8E2DC] bg-white hover:border-[#C6B8AB] transition-shadow space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E8E2DC]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#1F1F1F]">
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
                        <span className="text-[11px] text-[#A8927D]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                        <span className="text-xs sm:text-sm font-extrabold text-[#1F1F1F]">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#A8927D] uppercase">
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
                              className="w-8 h-8 rounded object-cover border border-[#E8E2DC]"
                            />
                            <span className="font-medium text-[#1F1F1F] line-clamp-1 max-w-[260px]">
                              {item.quantity}x {item.productTitle}
                            </span>
                          </div>
                          <span className="font-semibold text-[#3A3A3A]">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E2DC] text-xs">
                      <span className="text-[11px] text-[#A8927D]">
                        Tracking: <strong className="font-mono text-[#1F1F1F]">{order.trackingNumber || 'SV-EXP-1102'}</strong>
                      </span>
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="text-[#8C6F52] hover:text-[#735A42] font-semibold flex items-center gap-1 cursor-pointer"
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
                <div className="col-span-2 text-center py-10 text-[#A8927D] text-xs">
                  Your wishlist is empty. Tap the heart icon on any product to save it here!
                </div>
              ) : (
                wishlistedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-[#E8E2DC] flex items-center gap-3 bg-white hover:border-[#C6B8AB]"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-16 h-16 rounded-lg object-contain bg-[#F5F1EC] border border-[#E8E2DC] p-1"
                    />
                    <div className="flex-1 text-xs">
                      <h4 className="font-semibold text-[#1F1F1F] line-clamp-1">{p.title}</h4>
                      <p className="font-bold text-[#8C6F52] mt-0.5">
                        ₹{p.price.toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="bg-[#1F1F1F] hover:bg-[#8C6F52] text-white text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="text-[#A8927D] hover:text-[#E63946] text-[11px] cursor-pointer"
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
                  className="p-4 rounded-xl border border-[#E8E2DC] bg-white flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#1F1F1F]">
                      <span>{addr.fullName}</span>
                      <span className="uppercase text-[9px] bg-[#F5F1EC] text-[#8C6F52] px-1.5 py-0.5 rounded border border-[#C6B8AB]">
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[9px] bg-emerald-100 text-[#2E7D32] px-1.5 py-0.5 rounded font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[#3A3A3A] mt-1">{addr.street}</p>
                    <p className="text-[#A8927D]">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[#A8927D] mt-1">Phone: {addr.phone}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0 items-end">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] text-[#8C6F52] hover:underline cursor-pointer font-medium"
                      >
                        Set Default
                      </button>
                    )}
                    {addresses.length > 1 && (
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-[#A8927D] hover:text-[#E63946] cursor-pointer"
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
                <label className="font-semibold text-[#1F1F1F] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1F1F1F] block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full bg-[#E8E2DC]/50 border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#A8927D] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1F1F1F] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingPhone}
                  onChange={(e) => setEditingPhone(e.target.value)}
                  className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#1F1F1F] hover:bg-[#8C6F52] text-white font-bold py-2.5 px-5 rounded-lg transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Order Tracker Modal */}
        {trackingOrder && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setTrackingOrder(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Tracking #{trackingOrder.trackingNumber}</span>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { title: 'Order Placed', desc: 'Order received & payment confirmed', done: true },
                  { title: 'Packed at Hub', desc: 'Verified and packed at Delhi NCR Hub', done: true },
                  { title: 'Out for Delivery', desc: 'Dispatched with local courier partner', done: trackingOrder.status === 'Shipped' || trackingOrder.status === 'Delivered' },
                  { title: 'Delivered', desc: 'Delivered safely at your doorstep', done: trackingOrder.status === 'Delivered' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        step.done
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      ✓
                    </div>
                    <div className="text-xs">
                      <p className={`font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTrackingOrder(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
