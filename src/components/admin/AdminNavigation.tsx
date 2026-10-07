import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Check,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Home,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavItem } from '../../types';

export const AdminNavigation: React.FC = () => {
  const {
    navItems,
    addNavItem,
    updateNavItem,
    deleteNavItem,
    reorderNavItems,
    categories,
    showToast,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [linkType, setLinkType] = useState<NavItem['linkType']>('section');
  const [targetValue, setTargetValue] = useState('flash-deals');
  const [isActive, setIsActive] = useState(true);
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingItem(null);
    setLabel('');
    setLinkType('section');
    setTargetValue('flash-deals');
    setIsActive(true);
    setOpenInNewTab(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: NavItem) => {
    setEditingItem(item);
    setLabel(item.label);
    setLinkType(item.linkType);
    setTargetValue(item.targetValue);
    setIsActive(item.isActive);
    setOpenInNewTab(Boolean(item.openInNewTab));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!label.trim()) {
      setFormError('Please enter a display label.');
      return;
    }

    if (linkType === 'external' && !targetValue.trim()) {
      setFormError('Please enter a valid target URL.');
      return;
    }

    if (editingItem) {
      updateNavItem(editingItem.id, {
        label: label.trim(),
        linkType,
        targetValue,
        isActive,
        openInNewTab,
      });
    } else {
      addNavItem({
        label: label.trim(),
        linkType,
        targetValue,
        order: navItems.length + 1,
        isActive,
        openInNewTab,
      });
    }

    setIsModalOpen(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...navItems].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap items and order values
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reordered = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    reorderNavItems(reordered);
  };

  const sortedItems = [...navItems].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#8C6F52]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[#1F1F1F]">
              Header Navigation Menu Manager
            </h2>
          </div>
          <p className="text-xs text-[#3A3A3A] mt-1">
            Add, edit, remove, reorder, or toggle live navigation links displayed under the main search bar on the storefront.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#1F1F1F] hover:bg-[#8C6F52] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Nav Link</span>
        </button>
      </div>

      {/* Live Preview Strip */}
      <div className="bg-[#FAF9F6] border border-[#E8E2DC] rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#A8927D] uppercase tracking-wider">
            Live Storefront Navbar Preview:
          </span>
          <span className="text-[10px] text-[#2E7D32] font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {sortedItems.filter((i) => i.isActive).length} Active Links Visible
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E2DC] p-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {sortedItems
            .filter((i) => i.isActive)
            .map((item) => (
              <span
                key={item.id}
                className="whitespace-nowrap px-3 py-1 bg-[#F5F1EC] text-[#1F1F1F] text-xs font-semibold rounded-lg border border-[#C6B8AB]/60 flex items-center gap-1.5"
              >
                {item.label}
              </span>
            ))}
        </div>
      </div>

      {/* Navigation Items Table */}
      <div className="bg-white rounded-2xl border border-[#E8E2DC] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8E2DC] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1F1F1F]">
            Configured Navigation Links ({sortedItems.length})
          </h3>
          <span className="text-xs text-[#A8927D]">
            Use arrows to reorder tabs left-to-right
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#A8927D] font-semibold border-b border-[#E8E2DC]">
              <tr>
                <th className="p-3.5 pl-5 w-16">Order</th>
                <th className="p-3.5">Menu Label</th>
                <th className="p-3.5">Target Destination</th>
                <th className="p-3.5">Link Type</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DC]">
              {sortedItems.map((item, index) => {
                let targetDisplay = item.targetValue;
                if (item.linkType === 'category') {
                  const cat = categories.find((c) => c.id === item.targetValue);
                  targetDisplay = cat ? `Category: ${cat.name}` : item.targetValue;
                } else if (item.linkType === 'section') {
                  targetDisplay = `Page Section: #${item.targetValue}`;
                } else if (item.linkType === 'home') {
                  targetDisplay = 'Storefront Home (Top)';
                }

                return (
                  <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                    {/* Order & Reorder Arrows */}
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#1F1F1F] w-4 text-center">
                          {item.order}
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
                            disabled={index === sortedItems.length - 1}
                            onClick={() => handleMove(index, 'down')}
                            className="p-1 rounded hover:bg-[#E8E2DC] text-[#1F1F1F] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                            title="Move right/down"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Label */}
                    <td className="p-3.5">
                      <span className="font-bold text-sm text-[#1F1F1F]">
                        {item.label}
                      </span>
                    </td>

                    {/* Target Destination */}
                    <td className="p-3.5 text-[#3A3A3A]">
                      <span className="font-mono text-xs bg-[#F5F1EC] border border-[#C6B8AB] px-2 py-0.5 rounded">
                        {targetDisplay}
                      </span>
                    </td>

                    {/* Link Type Badge */}
                    <td className="p-3.5">
                      <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FAF9F6] border border-[#E8E2DC] text-[#8C6F52]">
                        {item.linkType}
                      </span>
                    </td>

                    {/* Visibility Toggle */}
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          updateNavItem(item.id, { isActive: !item.isActive })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          item.isActive
                            ? 'bg-emerald-50 text-[#2E7D32] border border-emerald-200'
                            : 'bg-slate-100 text-[#A8927D] border border-slate-200'
                        }`}
                      >
                        {item.isActive ? (
                          <>
                            <Eye className="w-3 h-3" /> Visible
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
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-[#3A3A3A] hover:bg-[#F5F1EC] hover:text-[#8C6F52] transition-colors cursor-pointer"
                          title="Edit link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to remove "${item.label}" from the navbar?`
                              )
                            ) {
                              deleteNavItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#A8927D] hover:bg-rose-50 hover:text-[#E63946] transition-colors cursor-pointer"
                          title="Delete link"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Nav Item Modal */}
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
                {editingItem ? 'Edit Navigation Link' : 'Add New Navigation Link'}
              </h3>
              <p className="text-xs text-[#A8927D] mt-0.5">
                Customize label, target category or page section for customer browsing.
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[#E63946] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Menu Label */}
              <div>
                <label className="font-semibold text-[#1F1F1F] block mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Flash Sales, Watches, Kitchen, Footwear"
                  className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
                />
              </div>

              {/* Link Type */}
              <div>
                <label className="font-semibold text-[#1F1F1F] block mb-1">
                  Link Destination Type *
                </label>
                <select
                  value={linkType}
                  onChange={(e) => {
                    const nextType = e.target.value as NavItem['linkType'];
                    setLinkType(nextType);
                    if (nextType === 'home') setTargetValue('home');
                    else if (nextType === 'section') setTargetValue('flash-deals');
                    else if (nextType === 'category') setTargetValue(categories[0]?.id || 'cat-mobiles');
                    else if (nextType === 'external') setTargetValue('https://');
                  }}
                  className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                >
                  <option value="section">Page Section (Flash Deals, Best Sellers, etc.)</option>
                  <option value="category">Store Product Category</option>
                  <option value="home">Store Home (Scroll Top)</option>
                  <option value="external">Custom URL / External Link</option>
                </select>
              </div>

              {/* Destination Value based on Link Type */}
              {linkType === 'section' && (
                <div>
                  <label className="font-semibold text-[#1F1F1F] block mb-1">
                    Select Page Section
                  </label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                  >
                    <option value="flash-deals">⚡ Today's Flash Deals (#flash-deals)</option>
                    <option value="new-arrivals">✨ New Arrivals (#new-arrivals)</option>
                    <option value="best-sellers">🔥 Best Sellers (#best-sellers)</option>
                    <option value="catalog-section">📦 Product Catalog / Filter Bar (#catalog-section)</option>
                    <option value="reviews-section">📝 Blog & Buying Guides (#reviews-section)</option>
                  </select>
                </div>
              )}

              {linkType === 'category' && (
                <div>
                  <label className="font-semibold text-[#1F1F1F] block mb-1">
                    Select Category
                  </label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {linkType === 'external' && (
                <div>
                  <label className="font-semibold text-[#1F1F1F] block mb-1">
                    Target URL Address
                  </label>
                  <input
                    type="url"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="https://example.com/special-campaign"
                    className="w-full bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 text-xs text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openInNewTab}
                      onChange={(e) => setOpenInNewTab(e.target.checked)}
                      className="rounded text-[#8C6F52] focus:ring-[#8C6F52]"
                    />
                    <span className="text-xs text-[#3A3A3A]">Open in new tab</span>
                  </label>
                </div>
              )}

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
                    Display actively on public header navbar
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
                  {editingItem ? 'Save Changes' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
