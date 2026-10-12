import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Package,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { orders, products, users, setAdminTab, flashDealConfig } = useApp();

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 15);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const flashProductsCount = products.filter((p) => p.isFlashDeal).length;

  // Status counts
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Cards */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Executive Analytics & Overview
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics, revenue intelligence, and active store health.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on {totalOrders} customer orders</p>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#D7E0D6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#D8C8B3]">Orders Processed</span>
            <div className="w-8 h-8 rounded-lg bg-[#E9EBDD] text-[#173F30] flex items-center justify-center border border-[#B9A48B]/40">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#2E342D]">{totalOrders}</span>
            <span className="text-[11px] font-bold text-[#173F30] flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +9.2%
            </span>
          </div>
          <p className="text-[11px] text-[#D8C8B3] mt-1">{processingCount} orders awaiting dispatch</p>
        </div>

        {/* KPI 3: Avg Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-[#D7E0D6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#D8C8B3]">Avg. Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-[#E9EBDD] text-[#173F30] flex items-center justify-center border border-[#B9A48B]/40">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#2E342D]">
              ₹{avgOrderValue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-[#D8C8B3] mt-1">High conversion in Consumer Electronics</p>
        </div>

        {/* KPI 4: Inventory Alerts */}
        <div
          onClick={() => setAdminTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-[#D7E0D6] shadow-xs cursor-pointer hover:border-[#D8C8B3] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#D8C8B3]">Inventory Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D8C8B3] flex items-center justify-center border border-amber-200/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#D8C8B3]">
              {lowStockProducts.length + outOfStockProducts.length}
            </span>
            <span className="text-[11px] font-bold text-[#D8C8B3]">Items need restock</span>
          </div>
          <p className="text-[11px] text-[#D8C8B3] mt-1">Click to manage inventory &rarr;</p>
        </div>
      </div>

      {/* Flash Deals Real-time Campaign Indicator Strip */}
      <div className="bg-[#E9EBDD] border border-[#B9A48B] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#173F30] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#2E342D]">
                {flashDealConfig.dealTitle || 'Flash Deals'} Campaign
              </h3>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  flashDealConfig.isActive
                    ? 'bg-emerald-100 text-[#2E7D32]'
                    : 'bg-[#D7E0D6] text-[#6B7068]'
                }`}
              >
                {flashDealConfig.isActive ? 'LIVE ON STORE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7068] mt-0.5">
              Timer: <strong className="font-mono text-[#E63946]">{flashDealConfig.hours}h {flashDealConfig.minutes}m {flashDealConfig.seconds}s</strong> remaining • <strong>{flashProductsCount}</strong> active flash sale products
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdminTab('flash-deals')}
          className="bg-[#2E342D] hover:bg-[#6B7068] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
        >
          Manage Flash Deals & Timer &rarr;
        </button>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Activity Bar Chart Simulation */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#D7E0D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2E342D]">Sales Velocity (Last 7 Days)</h3>
              <p className="text-[11px] text-[#D8C8B3]">Revenue per day across payment gateways</p>
            </div>
            <span className="text-xs font-bold text-[#173F30] bg-[#E9EBDD] border border-[#B9A48B]/40 px-2.5 py-1 rounded-md">
              7-Day Total: ₹{(totalRevenue * 0.9).toFixed(0)}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-[#D7E0D6] pb-2">
            {[
              { day: 'Mon', value: 45, amt: '₹14.2k' },
              { day: 'Tue', value: 68, amt: '₹22.5k' },
              { day: 'Wed', value: 52, amt: '₹18.0k' },
              { day: 'Thu', value: 88, amt: '₹34.8k' },
              { day: 'Fri', value: 95, amt: '₹41.2k' },
              { day: 'Sat', value: 100, amt: '₹48.9k' },
              { day: 'Sun', value: 78, amt: '₹29.1k' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] font-mono text-[#D8C8B3] opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.amt}
                </span>
                <div className="w-full bg-[#E9EBDD] rounded-t-lg h-36 flex items-end overflow-hidden p-1">
                  <div
                    style={{ height: `${bar.value}%` }}
                    className="w-full bg-[#173F30] group-hover:bg-[#2E5E46] transition-all rounded-t-sm"
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#6B7068] mt-1">{bar.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B7068] pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#173F30]" /> UPI (62%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B9A48B]" /> Cards (26%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D8C8B3]" /> COD (12%)
              </span>
            </div>
            <span className="text-[11px] text-[#2E7D32] font-semibold">99.8% Gateway Uptime</span>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[#D7E0D6] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#2E342D]">Fulfillment Pipeline</h3>
          <p className="text-[11px] text-[#D8C8B3] -mt-3">Current order lifecycle breakdown</p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#2E7D32] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                </span>
                <span className="text-[#2E342D]">{deliveredCount} orders</span>
              </div>
              <div className="w-full bg-[#E9EBDD] h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(deliveredCount / Math.max(1, totalOrders)) * 100}%` }}
                  className="bg-[#2E7D32] h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#173F30] flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> Shipped & In-Transit
                </span>
                <span className="text-[#2E342D]">{shippedCount} orders</span>
              </div>
              <div className="w-full bg-[#E9EBDD] h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(shippedCount / Math.max(1, totalOrders)) * 100}%` }}
                  className="bg-[#173F30] h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#D8C8B3] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Processing / Packaging
                </span>
                <span className="text-[#2E342D]">{processingCount} orders</span>
              </div>
              <div className="w-full bg-[#E9EBDD] h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(processingCount / Math.max(1, totalOrders)) * 100}%` }}
                  className="bg-[#D8C8B3] h-full rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D7E0D6]">
            <button
              onClick={() => setAdminTab('orders')}
              className="w-full py-2 bg-[#E9EBDD] hover:bg-[#D7E0D6] text-[#2E342D] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Manage All Orders &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-[#D7E0D6] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D7E0D6] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2E342D]">Recent Customer Transactions</h3>
            <p className="text-[11px] text-[#D8C8B3]">Live order stream updated from storefront checkout</p>
          </div>
          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs font-semibold text-[#173F30] hover:text-[#2E5E46] cursor-pointer"
          >
            View All ({orders.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F5EF] text-[#D8C8B3] font-semibold border-b border-[#D7E0D6]">
              <tr>
                <th className="p-3.5 pl-5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E0D6]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[#F8F5EF] transition-colors">
                  <td className="p-3.5 pl-5 font-bold text-[#2E342D]">{order.id}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-[#2E342D]">{order.customerName}</p>
                    <p className="text-[10px] text-[#D8C8B3]">{order.customerEmail}</p>
                  </td>
                  <td className="p-3.5 text-[#6B7068]">
                    {order.items.length} items
                  </td>
                  <td className="p-3.5 font-bold text-[#2E342D]">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 uppercase text-[10px] font-semibold text-[#D8C8B3]">
                    {order.paymentMethod}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-[#2E7D32] border border-emerald-200'
                          : order.status === 'Shipped'
                          ? 'bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B]'
                          : 'bg-amber-50 text-[#D8C8B3] border border-amber-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 text-right text-[#D8C8B3] text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
