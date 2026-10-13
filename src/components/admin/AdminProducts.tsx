import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Star,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { apiClient } from '../../utils/apiClient';

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [price, setPrice] = useState<number>(999);
  const [originalPrice, setOriginalPrice] = useState<number>(1999);
  const [stock, setStock] = useState<number>(25);
  const [sku, setSku] = useState('');
  const [rating, setRating] = useState<number>(4.5);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const res = await apiClient.uploadImage(file, 'velneer/products');
      if (res.success && res.url) {
        setImageUrl(res.url);
      } else {
        setUploadError(res.message || 'Image upload failed.');
      }
    } catch {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setBrand('');
    setCategoryId(categories[0]?.id || '');
    setPrice(999);
    setOriginalPrice(1999);
    setStock(25);
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setRating(4.5);
    setImageUrl('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80');
    setDescription('');
    setIsFlashDeal(false);
    setIsBestSeller(false);
    setIsNewArrival(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setBrand(p.brand);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice);
    setStock(p.stock);
    setSku(p.sku);
    setRating(p.rating);
    setImageUrl(p.imageUrl);
    setDescription(p.description);
    setIsFlashDeal(!!p.isFlashDeal);
    setIsBestSeller(!!p.isBestSeller);
    setIsNewArrival(!!p.isNewArrival);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    const discountPercentage =
      originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        title,
        brand,
        categoryId,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discountPercentage,
        stock: Number(stock),
        sku,
        rating: Number(rating),
        imageUrl,
        description,
        isFlashDeal,
        isBestSeller,
        isNewArrival,
      });
    } else {
      addProduct({
        title,
        slug,
        brand,
        categoryId,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discountPercentage,
        stock: Number(stock),
        sku,
        rating: Number(rating),
        reviewCount: 1,
        imageUrl,
        description,
        isFlashDeal,
        isBestSeller,
        isNewArrival,
        features: ['100% Genuine Certified', 'Free Shipping & Returns'],
      });
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCat || p.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Product Catalog Master</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, modify specs, set pricing discounts, and assign tags (Flash Deal, Best Seller, New Arrival).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brand, or SKU..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
        >
          <option value="">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5 pl-5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price & Discount</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Campaign Badges</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
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
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-blue-600">{p.brand}</span>
                            <span>•</span>
                            <span>SKU: {p.sku}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {cat?.name || 'General'}
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      {p.originalPrice > p.price && (
                        <div className="text-[10px] text-slate-400 line-through">
                          ₹{p.originalPrice.toLocaleString('en-IN')} ({p.discountPercentage}% OFF)
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 font-semibold text-slate-700">
                      {p.stock} units
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.isFlashDeal && (
                          <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Flash Deal
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Best Seller
                          </span>
                        )}
                        {p.isNewArrival && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            New Arrival
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 pr-5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}
            </h2>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
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
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Sony, Apple, boAt"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
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
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    SKU Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Product Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Product Image (Cloudinary CDN or Direct URL)
                  </label>
                  {isUploading && (
                    <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading to CDN...
                    </span>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or upload local image"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                  <label className="flex items-center gap-1 px-3 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <p className="text-[10px] text-rose-600 mt-1">{uploadError}</p>
                )}

                {imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />
                    <span className="text-[10px] text-slate-500 truncate max-w-xs">
                      Live Preview & Cloud CDN linked
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive description of product specifications, materials, warranty..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              {/* Tag Checkboxes */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFlashDeal}
                    onChange={(e) => setIsFlashDeal(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span>Flash Deal</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
