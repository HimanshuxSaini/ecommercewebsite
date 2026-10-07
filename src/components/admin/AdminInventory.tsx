import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminInventory: React.FC = () => {
  const { products, restockProduct, categories } = useApp();
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [restockAmount, setRestockAmount] = useState<Record<string, number>>({});

  const lowStockThreshold = 15;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'low') return p.stock > 0 && p.stock <= lowStockThreshold;
    if (filter === 'out') return p.stock === 0;
    return true;
  });

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= lowStockThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);

  const handleRestock = (productId: string, amount: number) => {
    restockProduct(productId, amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>Inventory & Stock Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor SKU levels, replenish warehouses, and avoid stockouts across product lines.
          </p>
        </div>
      </div>

      {/* Stock Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Units In Warehouses</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalUnits.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Across {products.length} catalog items</span>
        </div>

        <div
          onClick={() => setFilter('low')}
          className={`p-4 rounded-xl border cursor-pointer transition-all shadow-xs ${
            filter === 'low'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300'
              : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{lowStockCount}</p>
          <span className="text-[10px] text-amber-700 font-medium">&le; 15 units remaining</span>
        </div>

        <div
          onClick={() => setFilter('out')}
          className={`p-4 rounded-xl border cursor-pointer transition-all shadow-xs ${
            filter === 'out'
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-300'
              : 'bg-white border-slate-200/80 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{outOfStockCount}</p>
          <span className="text-[10px] text-rose-700 font-medium">Customer purchases blocked</span>
        </div>

        <div
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all shadow-xs ${
            filter === 'all'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-300'
              : 'bg-white border-slate-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-700">All Products</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-1">{products.length}</p>
          <span className="text-[10px] text-slate-400">Full catalog inventory</span>
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
            placeholder="Search SKU, brand or product..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'low' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'out' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5 pl-5">Product Details</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5">Current Qty</th>
                <th className="p-3.5 pr-5 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const isLow = p.stock > 0 && p.stock <= lowStockThreshold;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.title}</p>
                          <span className="text-[10px] text-slate-400 font-medium uppercase">{p.brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600 font-semibold">
                      {p.sku}
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {cat?.name || 'General'}
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className={`text-sm font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                        {p.stock}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRestock(p.id, 10)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleRestock(p.id, 50)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                          title="Add 50 units"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
