import React, { useState } from 'react';
import {
  Image,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Banner } from '../../types';

export const AdminBanners: React.FC = () => {
  const { banners, addBanner, updateBanner, deleteBanner, toggleBannerActive } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [linkUrl, setLinkUrl] = useState('#flash-deals');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<Banner['type']>('hero');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setTagline('Exclusive Offer');
    setButtonText('Shop Now');
    setLinkUrl('#flash-deals');
    setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80');
    setType('hero');
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setTagline(b.tagline || '');
    setButtonText(b.buttonText);
    setLinkUrl(b.linkUrl);
    setImageUrl(b.imageUrl);
    setType(b.type);
    setDisplayOrder(b.displayOrder);
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    if (editingBanner) {
      updateBanner(editingBanner.id, {
        title,
        subtitle,
        tagline,
        buttonText,
        linkUrl,
        imageUrl,
        type,
        displayOrder: Number(displayOrder),
        isActive,
      });
    } else {
      addBanner({
        title,
        subtitle,
        tagline,
        buttonText,
        linkUrl,
        imageUrl,
        type,
        displayOrder: Number(displayOrder),
        isActive,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Image className="w-6 h-6 text-blue-600" />
            <span>Hero & Promotional Banners Handle</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure homepage hero carousel slides, promo cards, and split section campaigns.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all"
          >
            {/* Banner Preview Thumbnail */}
            <div className="h-40 overflow-hidden relative bg-slate-100">
              <img
                src={b.imageUrl}
                alt={b.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  {b.type.replace('_', ' ')}
                </span>
                {b.tagline && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {b.tagline}
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <button
                  onClick={() => toggleBannerActive(b.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-xs cursor-pointer ${
                    b.isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Hidden'}
                </button>
              </div>
            </div>

            {/* Information */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {b.subtitle}
                </p>
                <div className="mt-2 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                  <span>Button: "{b.buttonText}"</span>
                  <span>&rarr; {b.linkUrl}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Priority: #{b.displayOrder}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 mb-4">
              {editingBanner ? 'Edit Banner' : 'Create New Promotional Banner'}
            </h2>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Banner Placement Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Banner['type'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                >
                  <option value="hero">Hero Main Slider (Top Carousel)</option>
                  <option value="promo_card">Triple Promo Card</option>
                  <option value="mid_split">Middle Split Banner</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Headline Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Upgrade Your Everyday Life"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Subtitle / Promo Text
                </label>
                <input
                  type="text"
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Wide range of products at the best prices"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tagline Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Festival Mega Sale"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    required
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Shop Now"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Link Target URL or ID
                  </label>
                  <input
                    type="text"
                    required
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="e.g. #flash-deals or #best-sellers"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Display Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Banner Image URL (Unsplash or CDN)
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active_banner_chk"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="active_banner_chk" className="font-semibold text-slate-700">
                  Visible on Storefront
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
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
