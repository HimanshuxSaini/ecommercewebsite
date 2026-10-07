import React, { useState } from 'react';
import {
  Zap,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  X,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

export const AdminFlashDeals: React.FC = () => {
  const {
    products,
    categories,
    flashDealConfig,
    updateFlashDealTime,
    toggleFlashDealActive,
    addCustomFlashDeal,
    removeCustomFlashDeal,
    createAndAddFlashDeal,
    updateProduct,
    showToast,
  } = useApp();

  // Timer Configuration State
  const [hours, setHours] = useState(flashDealConfig.hours);
  const [minutes, setMinutes] = useState(flashDealConfig.minutes);
  const [seconds, setSeconds] = useState(flashDealConfig.seconds);
  const [dealTitle, setDealTitle] = useState(flashDealConfig.dealTitle || 'Flash Deals');
  const [isTimerActive, setIsTimerActive] = useState(flashDealConfig.isActive);

  // Add Existing Product Modal State
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customDiscount, setCustomDiscount] = useState<number>(45);
  const [searchCatalog, setSearchCatalog] = useState('');

  // Create New Custom Flash Product Modal State
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || '');
  const [newRegularPrice, setNewRegularPrice] = useState<number>(2999);
  const [newFlashPrice, setNewFlashPrice] = useState<number>(1499);
  const [newStock, setNewStock] = useState<number>(30);
  const [newSku, setNewSku] = useState(`FLASH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
  );
  const [newDescription, setNewDescription] = useState('Limited time exclusive flash deal offer.');

  // Current Flash Deal Products
  const flashProducts = products.filter((p) => p.isFlashDeal);
  const nonFlashProducts = products.filter((p) => !p.isFlashDeal);

  const filteredCatalog = nonFlashProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchCatalog.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchCatalog.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  const handleSaveTimer = (e: React.FormEvent) => {
    e.preventDefault();
    updateFlashDealTime(
      Number(hours),
      Number(minutes),
      Number(seconds),
      dealTitle.trim(),
      isTimerActive
    );
  };

  const setTimerPreset = (presetHours: number, presetMins = 0, presetSecs = 0) => {
    setHours(presetHours);
    setMinutes(presetMins);
    setSeconds(presetSecs);
    updateFlashDealTime(presetHours, presetMins, presetSecs, dealTitle, isTimerActive);
  };

  const handleAddExistingProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      showToast('Please select a product from the catalog', 'error');
      return;
    }
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const flashPrice = Math.round(prod.originalPrice * (1 - customDiscount / 100));
    addCustomFlashDeal(selectedProductId, customDiscount, flashPrice);
    setIsAddExistingOpen(false);
    setSelectedProductId('');
  };

  const handleCreateCustomDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFlashPrice) return;

    const discountPercentage =
      newRegularPrice > newFlashPrice
        ? Math.round(((newRegularPrice - newFlashPrice) / newRegularPrice) * 100)
        : 40;

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    createAndAddFlashDeal({
      title: newTitle.trim(),
      slug,
      brand: newBrand.trim() || 'ShopVerse Choice',
      categoryId: newCategoryId,
      price: Number(newFlashPrice),
      originalPrice: Number(newRegularPrice),
      discountPercentage,
      stock: Number(newStock),
      sku: newSku,
      rating: 4.6,
      reviewCount: 42,
      imageUrl: newImageUrl,
      description: newDescription,
      isFlashDeal: true,
      features: ['Limited Flash Deal Stock', 'Fast Dispatch'],
    });

    setIsCreateCustomOpen(false);
    setNewTitle('');
    setNewBrand('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1F1F1F] tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#E63946] fill-[#E63946]" />
            <span>Flash Deals & Timer Control</span>
          </h1>
          <p className="text-xs text-[#3A3A3A] mt-0.5">
            Configure live countdown clock time, add custom discounted deals, and manage deal products in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddExistingOpen(true)}
            className="bg-[#8C6F52] hover:bg-[#6B5B4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add From Catalog</span>
          </button>

          <button
            onClick={() => setIsCreateCustomOpen(true)}
            className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            <span>Create New Custom Deal</span>
          </button>
        </div>
      </div>

      {/* Timer Management Panel */}
      <div className="bg-white rounded-2xl border border-[#E8E2DC] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DC]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#8C6F52]" />
            <div>
              <h2 className="text-sm font-bold text-[#1F1F1F]">
                Live Storefront Countdown Timer Settings
              </h2>
              <p className="text-[11px] text-[#A8927D]">
                Controls the live countdown banner displayed on the customer homepage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1F1F1F]">Status:</span>
            <button
              onClick={() => {
                const next = !isTimerActive;
                setIsTimerActive(next);
                updateFlashDealTime(hours, minutes, seconds, dealTitle, next);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                isTimerActive
                  ? 'bg-emerald-50 text-[#2E7D32] border border-emerald-200'
                  : 'bg-[#F5F1EC] text-[#A8927D] border border-[#C6B8AB]'
              }`}
            >
              {isTimerActive ? 'Active on Storefront' : 'Paused / Hidden'}
            </button>
          </div>
        </div>

        {/* Timer Form */}
        <form onSubmit={handleSaveTimer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Campaign Heading Title
              </label>
              <input
                type="text"
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                placeholder="Flash Deals"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Hours Left
              </label>
              <input
                type="number"
                min="0"
                max="999"
                value={hours}
                onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Minutes Left
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Seconds Left
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
              />
            </div>
          </div>

          {/* Quick Presets & Apply Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setTimerPreset(1, 0, 0)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => setTimerPreset(6, 0, 0)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                +6 Hours
              </button>
              <button
                type="button"
                onClick={() => setTimerPreset(12, 34, 56)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg cursor-pointer transition-colors"
              >
                Reset Default (12:34:56)
              </button>
              <button
                type="button"
                onClick={() => setTimerPreset(24, 0, 0)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                +24 Hours
              </button>
            </div>

            <button
              type="submit"
              className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Update Flash Timer
            </button>
          </div>
        </form>
      </div>

      {/* Active Flash Deals Product Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Active Flash Sale Items</span>
              <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {flashProducts.length} Items
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              These products appear in the Flash Deals carousel with timer on the homepage.
            </p>
          </div>
        </div>

        {flashProducts.length === 0 ? (
          <div className="p-10 text-center space-y-2 text-slate-500 text-xs">
            <Zap className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No products in Flash Deals right now.</p>
            <p className="text-[11px]">Click "Add From Catalog" or "Create New Custom Deal" above to launch a sale!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Product Details</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Deal Price</th>
                  <th className="p-3.5">Original MRP</th>
                  <th className="p-3.5">Discount %</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flashProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-11 h-11 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.title}</p>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{p.brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600">
                      {p.sku}
                    </td>

                    <td className="p-3.5 font-black text-slate-900">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-slate-400 line-through">
                      ₹{p.originalPrice.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5">
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        {p.discountPercentage}% OFF
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-700">
                      {p.stock} units
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => removeCustomFlashDeal(p.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer transition-colors"
                        title="Remove from Flash Deals"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Deal</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal A: Add Existing Product to Flash Deals */}
      {isAddExistingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddExistingOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600 fill-red-600" />
              <span>Add Existing Catalog Item to Flash Deals</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select an item from your catalog and specify its limited-time flash sale discount.
            </p>

            <form onSubmit={handleAddExistingProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Search Catalog
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchCatalog}
                    onChange={(e) => setSearchCatalog(e.target.value)}
                    placeholder="Search product title or brand..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Product ({filteredCatalog.length} available)
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                >
                  <option value="">-- Choose a Product --</option>
                  {filteredCatalog.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (MRP: ₹{p.originalPrice || p.price}) - SKU: {p.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Flash Discount Percentage (% OFF)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="90"
                    required
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(Number(e.target.value))}
                    className="w-32 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold"
                  />
                  {selectedProductId && (
                    <span className="text-slate-500 text-xs">
                      Effective Flash Price:{' '}
                      <strong className="text-slate-900">
                        ₹
                        {Math.round(
                          (products.find((p) => p.id === selectedProductId)?.originalPrice || 2000) *
                            (1 - customDiscount / 100)
                        ).toLocaleString('en-IN')}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExistingOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProductId}
                  className="bg-[#8C6F52] hover:bg-[#6B5B4A] disabled:bg-slate-300 text-white font-semibold px-5 py-2 rounded-lg cursor-pointer"
                >
                  Add to Flash Deals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal B: Create Brand New Custom Flash Deal Product */}
      {isCreateCustomOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsCreateCustomOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Create Custom Flash Deal Product</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Directly build a new flash sale item and instantly push it to the live flash deals section.
            </p>

            <form onSubmit={handleCreateCustomDeal} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Anker Soundcore Flare 2 Speaker"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. Anker, boAt, Apple"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Flash Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newFlashPrice}
                    onChange={(e) => setNewFlashPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    MRP Original (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newRegularPrice}
                    onChange={(e) => setNewRegularPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Flash Stock Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  SKU Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCustomOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#8C6F52] hover:bg-[#6B5B4A] text-white font-semibold px-5 py-2 rounded-lg cursor-pointer"
                >
                  Create & Launch Flash Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
