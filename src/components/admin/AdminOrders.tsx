import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  PackageCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Order['status']) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span>Customer Order Dispatch & Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process incoming orders, update courier logistics, and manage customer refunds.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, customer, email..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs no-scrollbar">
          {['all', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5 pl-5">Order ID</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Total & Method</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Fulfillment Status</th>
                <th className="p-3.5">Update Status</th>
                <th className="p-3.5 pr-5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 pl-5">
                    <span className="font-bold text-slate-900 block">{order.id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {order.trackingNumber || 'No tracking'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{order.customerName}</p>
                    <p className="text-[10px] text-slate-400">{order.customerEmail}</p>
                    <p className="text-[10px] text-slate-500">{order.customerPhone}</p>
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-slate-900">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] uppercase font-semibold text-slate-500">
                      {order.paymentMethod}
                    </div>
                  </td>

                  <td className="p-3.5 text-slate-600">
                    <span className="font-semibold">{order.items.length} items</span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {order.items[0]?.productTitle}
                    </p>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value as Order['status'])
                      }
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="p-3.5 pr-5 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 cursor-pointer"
                      title="Inspect Order"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspect Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4 text-xs">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Order #{selectedOrder.id}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Customer & Shipping info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 block">Shipping Address:</span>
              <p className="text-slate-700 font-semibold">
                {selectedOrder.shippingAddress.fullName} ({selectedOrder.shippingAddress.phone})
              </p>
              <p className="text-slate-600">{selectedOrder.shippingAddress.street}</p>
              <p className="text-slate-600">
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                {selectedOrder.shippingAddress.pincode}
              </p>
            </div>

            {/* Item list */}
            <div>
              <span className="font-bold text-slate-800 block mb-2">Order Line Items:</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg p-2 max-h-40 overflow-y-auto">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={it.imageUrl}
                        alt={it.productTitle}
                        className="w-8 h-8 rounded object-cover border border-slate-200"
                      />
                      <span className="font-medium text-slate-800 truncate max-w-[220px]">
                        {it.quantity}x {it.productTitle}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({selectedOrder.couponCode})</span>
                  <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-blue-600">
                  ₹{selectedOrder.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
