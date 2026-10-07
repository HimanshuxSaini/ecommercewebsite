import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  FolderTree,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    products,
  } = useApp();

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // Subcategory Add Form State
  const [activeSubModalCat, setActiveSubModalCat] = useState<Category | null>(null);
  const [newSubName, setNewSubName] = useState('');

  const openAddCat = () => {
    setEditingCat(null);
    setNewCatName('');
    setNewCatSlug('');
    setNewCatImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80');
    setIsCatModalOpen(true);
  };

  const openEditCat = (c: Category) => {
    setEditingCat(c);
    setNewCatName(c.name);
    setNewCatSlug(c.slug);
    setNewCatImage(c.imageUrl);
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const slug = newCatSlug || newCatName.toLowerCase().replace(/\s+/g, '-');

    if (editingCat) {
      updateCategory(editingCat.id, {
        name: newCatName,
        slug,
        imageUrl: newCatImage,
      });
    } else {
      addCategory({
        name: newCatName,
        slug,
        icon: 'Layers',
        imageUrl: newCatImage,
      });
    }
    setIsCatModalOpen(false);
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubModalCat || !newSubName.trim()) return;
    addSubcategory(activeSubModalCat.id, newSubName.trim());
    setNewSubName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-blue-600" />
            <span>Categories & Subcategories Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize product taxonomies, manage circular visual badges and multi-level subcategories.
          </p>
        </div>

        <button
          onClick={openAddCat}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-xs"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">/{cat.slug}</p>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                      {catProducts.length} Products Linked
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditCat(cat)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories Section */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Subcategories ({cat.subcategories.length})
                  </span>
                  <button
                    onClick={() => setActiveSubModalCat(cat)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Subcategory</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">
                      No subcategories defined yet.
                    </span>
                  ) : (
                    cat.subcategories.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-md shadow-2xs"
                      >
                        <span>{sub.name}</span>
                        <button
                          onClick={() => deleteSubcategory(cat.id, sub.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                          title="Remove subcategory"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsCatModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 mb-4">
              {editingCat ? 'Edit Category' : 'Add New Category'}
            </h2>

            <form onSubmit={handleSaveCat} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!editingCat) {
                      setNewCatSlug(
                        e.target.value.toLowerCase().replace(/\s+/g, '-')
                      );
                    }
                  }}
                  placeholder="e.g. Gaming & VR"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="e.g. gaming-vr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Image Thumbnail URL
                </label>
                <input
                  type="url"
                  required
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg cursor-pointer"
                >
                  {editingCat ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {activeSubModalCat && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveSubModalCat(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Add Subcategory
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Under: <strong className="text-blue-600">{activeSubModalCat.name}</strong>
            </p>

            <form onSubmit={handleAddSub} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Wireless Headsets"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubModalCat(null)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Add Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
