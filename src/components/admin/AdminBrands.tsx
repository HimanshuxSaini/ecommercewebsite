import React, { useState } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Brand } from '../../types';

export const AdminBrands: React.FC = () => {
  const {
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    reorderBrands,
    categories,
    isBrandsSectionVisible,
    toggleBrandsSectionVisible,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [logoText, setLogoText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [category, setCategory] = useState('Smartphones & Appliances');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const sampleBrandLogos = [
    { label: 'Samsung', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80' },
    { label: 'Apple', url: 'https://images.unsplash.com/photo-1621768216002-5ac171876625?w=200&auto=format&fit=crop&q=80' },
    { label: 'HP', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop&q=80' },
    { label: 'boAt', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80' },
    { label: 'Nike', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80' },
    { label: 'Puma', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&auto=format&fit=crop&q=80' },
    { label: 'Sony', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80' },
    { label: 'Philips', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80' },
  ];

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setLogoText('');
    setLogoUrl('');
    setCategory('Smartphones & Appliances');
    setWebsiteUrl('');
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setLogoText(b.logoText || b.name);
    setLogoUrl(b.logoUrl || '');
    setCategory(b.category);
    setWebsiteUrl(b.websiteUrl || '');
    setIsActive(b.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Brand name is required.');
      return;
    }

    if (editingBrand) {
      updateBrand(editingBrand.id, {
        name: name.trim(),
        logoText: (logoText || name).trim(),
        logoUrl: logoUrl.trim(),
        category,
        websiteUrl: websiteUrl.trim(),
        isActive,
      });
    } else {
      addBrand({
        name: name.trim(),
        logoText: (logoText || name).trim(),
        logoUrl: logoUrl.trim(),
        category,
        websiteUrl: websiteUrl.trim(),
        order: brands.length + 1,
        isActive,
      });
    }

    setIsModalOpen(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...brands].sort((a, b) => a.order - b.order);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((b, idx) => ({ ...b, order: idx + 1 }));
    reorderBrands(reordered);
  };

  const sortedBrands = [...brands].sort((a, b) => a.order - b.order);
  const filteredBrands = sortedBrands.filter((b) =>
    b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#8C6F52]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[#1F1F1F]">
              Top Brands & Logos Manager
            </h2>
          </div>
          <p className="text-xs text-[#3A3A3A] mt-1">
            Add official brand logos, edit brand names, reorder cards, and toggle brand visibility on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="bg-[#1F1F1F] hover:bg-[#8C6F52] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Brand</span>
          </button>
        </div>
      </div>

      {/* Master Section Visibility Controller */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2DC] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isBrandsSectionVisible
                ? 'bg-emerald-100 text-[#2E7D32]'
                : 'bg-rose-100 text-[#E63946]'
            }`}
          >
            {isBrandsSectionVisible ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1F1F1F]">
                Storefront "Top Brands" Section Display
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isBrandsSectionVisible
                    ? 'bg-emerald-100 text-[#2E7D32] border border-emerald-200'
                    : 'bg-rose-100 text-[#E63946] border border-rose-200'
                }`}
              >
                {isBrandsSectionVisible ? 'LIVE ON STOREFRONT' : 'HIDDEN FROM STOREFRONT'}
              </span>
            </div>
            <p className="text-xs text-[#3A3A3A] mt-0.5">
              {isBrandsSectionVisible
                ? 'The Top Brands section and partner logos are currently visible to all visiting customers on the homepage.'
                : 'The Top Brands section is currently turned OFF. It is completely hidden from the public customer storefront.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleBrandsSectionVisible}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs ${
            isBrandsSectionVisible
              ? 'bg-rose-50 hover:bg-rose-100 text-[#E63946] border border-rose-200'
              : 'bg-[#2E7D32] hover:bg-emerald-700 text-white'
          }`}
        >
          {isBrandsSectionVisible ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Turn OFF / Hide Section</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Turn ON / Show Section</span>
            </>
          )}
        </button>
      </div>

      {/* Live Storefront Preview Strip */}
      <div className="bg-[#FAF9F6] border border-[#E8E2DC] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#A8927D] uppercase tracking-wider">
            Live Storefront Brand Strip Preview ({sortedBrands.filter((b) => b.isActive).length} Active)
          </span>
          <span className="text-[11px] text-[#8C6F52] font-semibold">
            Clicking a brand filters catalog products
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {sortedBrands
            .filter((b) => b.isActive)
            .map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-[#E8E2DC] p-2.5 flex flex-col items-center justify-center min-h-[85px] shadow-2xs hover:border-[#8C6F52] transition-colors"
              >
                {b.logoUrl && (
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#F5F1EC] p-0.5 border border-[#E8E2DC] flex items-center justify-center mb-1">
                    <img
                      src={b.logoUrl}
                      alt={b.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                )}
                <span className="text-[11px] font-black text-[#1F1F1F] uppercase truncate max-w-full text-center">
                  {b.logoText || b.name}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-2xl border border-[#E8E2DC] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#1F1F1F]">
            Configured Brands ({sortedBrands.length})
          </h3>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-[#A8927D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter brand name or category..."
              className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#A8927D] font-semibold border-b border-[#E8E2DC]">
              <tr>
                <th className="p-3.5 pl-5 w-16">Order</th>
                <th className="p-3.5">Logo Image</th>
                <th className="p-3.5">Brand Name</th>
                <th className="p-3.5">Display Text Logo</th>
                <th className="p-3.5">Category Tag</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DC]">
              {filteredBrands.map((b, index) => (
                <tr key={b.id} className="hover:bg-[#FAF9F6] transition-colors">
                  {/* Order & Reordering */}
                  <td className="p-3.5 pl-5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#1F1F1F] w-4 text-center">
                        {b.order}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          className="p-1 rounded hover:bg-[#E8E2DC] text-[#1F1F1F] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                          title="Move left/up"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === sortedBrands.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          className="p-1 rounded hover:bg-[#E8E2DC] text-[#1F1F1F] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                          title="Move right/down"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Logo Image Thumbnail */}
                  <td className="p-3.5">
                    {b.logoUrl ? (
                      <div className="w-10 h-10 rounded-lg bg-[#F5F1EC] border border-[#E8E2DC] p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#F5F1EC] border border-[#E8E2DC] flex items-center justify-center text-[10px] text-[#A8927D]">
                        No Img
                      </div>
                    )}
                  </td>

                  {/* Brand Name */}
                  <td className="p-3.5">
                    <span className="font-bold text-sm text-[#1F1F1F]">
                      {b.name}
                    </span>
                  </td>

                  {/* Display Text Logo */}
                  <td className="p-3.5">
                    <span className="font-black text-xs uppercase px-2 py-0.5 rounded bg-[#F5F1EC] border border-[#C6B8AB] text-[#1F1F1F]">
                      {b.logoText}
                    </span>
                  </td>

                  {/* Category Tag */}
                  <td className="p-3.5 text-[#3A3A3A]">
                    <span className="text-[11px] text-[#8C6F52] bg-[#FAF9F6] border border-[#E8E2DC] px-2 py-0.5 rounded">
                      {b.category}
                    </span>
                  </td>

                  {/* Visibility Toggle */}
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        updateBrand(b.id, { isActive: !b.isActive })
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                        b.isActive
                          ? 'bg-emerald-50 text-[#2E7D32] border border-emerald-200'
                          : 'bg-slate-100 text-[#A8927D] border border-slate-200'
                      }`}
                    >
                      {b.isActive ? (
                        <>
                          <Eye className="w-3 h-3" /> Live
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Hidden
                        </>
                      )}
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded-lg text-[#3A3A3A] hover:bg-[#F5F1EC] hover:text-[#8C6F52] transition-colors cursor-pointer"
                        title="Edit brand"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to remove "${b.name}" from the brands list?`
                            )
                          ) {
                            deleteBrand(b.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[#A8927D] hover:bg-rose-50 hover:text-[#E63946] transition-colors cursor-pointer"
                        title="Delete brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-base font-bold text-[#1F1F1F]">
                {editingBrand ? 'Edit Brand Details' : 'Add Brand & Logo'}
              </h3>
              <p className="text-xs text-[#A8927D] mt-0.5">
                Configure brand name, logo image URL, and showcase typography.
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[#E63946] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Brand Name */}
              <div>
                <label className="font-semibold text-[#1F1F1F] block mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!logoText) setLogoText(e.target.value.toUpperCase());
                  }}
                  placeholder="e.g. Sony, Zara, Adidas, OnePlus"
                  className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
                />
              </div>

              {/* Text Logo Tag */}
              <div>
                <label className="font-semibold text-[#1F1F1F] block mb-1">
                  Logo Text Display (Stylized)
                </label>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  placeholder="e.g. SONY,  Apple, NIKE"
                  className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white uppercase font-bold"
                />
              </div>

              {/* Logo Image URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#1F1F1F]">
                    Logo Image URL
                  </label>
                  <span className="text-[10px] text-[#8C6F52]">Paste direct image URL</span>
                </div>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://logo.clearbit.com/..."
                  className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
                />

                {/* Preset image suggestions */}
                <div className="mt-2">
                  <span className="text-[10px] font-semibold text-[#A8927D] block mb-1">
                    Quick Logo Image Presets:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sampleBrandLogos.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLogoUrl(s.url);
                          if (!name) setName(s.label);
                          if (!logoText) setLogoText(s.label.toUpperCase());
                        }}
                        className="text-[10px] bg-[#F5F1EC] hover:bg-[#8C6F52] hover:text-white text-[#3A3A3A] px-2 py-0.5 rounded border border-[#C6B8AB] transition-colors cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Thumbnail */}
                {logoUrl && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-[#F5F1EC] rounded-lg border border-[#E8E2DC]">
                    <div className="w-10 h-10 bg-white rounded border border-[#C6B8AB] p-1 flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-[11px] text-[#1F1F1F]">Logo Preview</p>
                      <p className="text-[10px] text-[#A8927D]">Image loaded successfully</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Specialty */}
              <div>
                <label className="font-semibold text-[#1F1F1F] block mb-1">
                  Brand Category Specialty
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Footwear & Apparel, Smart Devices, Home Audio"
                  className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
                />
              </div>

              {/* Visibility Switch */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#8C6F52] focus:ring-[#8C6F52]"
                  />
                  <span className="text-xs font-semibold text-[#1F1F1F]">
                    Display actively in storefront Top Brands section
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E8E2DC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#C6B8AB] text-[#3A3A3A] font-semibold text-xs hover:bg-[#F5F1EC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1F1F1F] hover:bg-[#8C6F52] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  {editingBrand ? 'Save Changes' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
