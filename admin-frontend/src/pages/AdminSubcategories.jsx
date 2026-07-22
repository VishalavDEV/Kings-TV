import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';

const AdminSubcategories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    parentCategoryId: '',
    name: '',
    language: 'ta',
    slug: '',
    description: '',
    color: '#3B82F6',
    menuOrder: 0,
    showOnMenu: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, subs] = await Promise.all([
        fetchApi('/admin/categories'),
        fetchApi('/admin/subcategories')
      ]);
      setCategories(cats || []);
      setSubcategories(subs || []);
    } catch (err) {
      setErrorMsg('Failed to load subcategories and categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      parentCategoryId: '',
      name: '',
      language: 'ta',
      slug: '',
      description: '',
      color: '#3B82F6',
      menuOrder: 0,
      showOnMenu: true
    });
    setEditingId(null);
  };

  const handleEdit = (sub) => {
    setEditingId(sub.subcategoryId || sub.id);
    setFormData({
      parentCategoryId: String(sub.parentCategoryId || sub.categoryId || ''),
      name: sub.name || '',
      language: sub.language || 'ta',
      slug: sub.slug || '',
      description: sub.description || '',
      color: sub.color || '#3B82F6',
      menuOrder: sub.menuOrder !== undefined ? sub.menuOrder : (sub.displayOrder || 0),
      showOnMenu: sub.showOnMenu !== false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.parentCategoryId) {
      setErrorMsg('Parent Category is required');
      return;
    }

    try {
      const payload = {
        parentCategoryId: parseInt(formData.parentCategoryId, 10),
        name: formData.name,
        language: formData.language,
        slug: formData.slug || null,
        description: formData.description,
        color: formData.color,
        menuOrder: parseInt(formData.menuOrder, 10) || 0,
        showOnMenu: formData.showOnMenu
      };

      if (editingId) {
        await fetchApi(`/admin/subcategories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Subcategory updated successfully');
      } else {
        await fetchApi('/admin/subcategories', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Subcategory added successfully');
      }
      resetForm();
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save subcategory');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/subcategories/${id}`, { method: 'DELETE' });
      setSuccessMsg('Subcategory deleted successfully');
      loadData();
    } catch (err) {
      setErrorMsg('Failed to delete subcategory');
    }
  };

  const getParentCategoryName = (parentId) => {
    const parent = categories.find((c) => String(c.id) === String(parentId));
    return parent ? parent.name : `Category #${parentId || 'N/A'}`;
  };

  const filteredSubcategories = subcategories.filter((sub) => {
    const matchesSearch =
      (sub.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParent = parentFilter ? String(sub.parentCategoryId || sub.categoryId) === String(parentFilter) : true;
    return matchesSearch && matchesParent;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subcategories Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage subcategories associated under main article categories</p>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5 h-fit">
          <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="parentCategoryId" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Category *</label>
              <select
                id="parentCategoryId"
                name="parentCategoryId"
                value={formData.parentCategoryId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Select Parent Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.language === 'en' ? 'EN' : 'TA'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subcategory Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Artificial Intelligence"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="language" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Language *</label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="menuOrder" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu Order</label>
                <input
                  type="number"
                  id="menuOrder"
                  name="menuOrder"
                  value={formData.menuOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="slug" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Slug (Optional)</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="auto-generated if empty"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div className="space-y-1">
                <label htmlFor="color" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-8 h-8 p-0 rounded-md border border-gray-200 cursor-pointer overflow-hidden"
                  />
                  <span className="text-xs font-mono font-bold text-gray-500 uppercase">{formData.color}</span>
                </div>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
                  <input
                    type="checkbox"
                    name="showOnMenu"
                    checked={formData.showOnMenu}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  Show on Menu
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Meta Description</label>
              <textarea
                id="description"
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Subcategory description..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                {editingId ? 'Update' : 'Add Subcategory'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-xl transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Subcategories List ({filteredSubcategories.length})</h2>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-600"
              >
                <option value="">All Parent Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search subcategories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-600"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-gray-400">Loading subcategories...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Parent Category</th>
                    <th className="px-6 py-4">Color</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Language</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 text-center">Order</th>
                    <th className="px-6 py-4 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubcategories.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                        No subcategories found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubcategories.map((sub) => (
                      <tr key={sub.subcategoryId || sub.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">#{sub.subcategoryId || sub.id}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            {getParentCategoryName(sub.parentCategoryId || sub.categoryId)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/5 shadow-inner"
                              style={{ backgroundColor: sub.color || '#3B82F6' }}
                            />
                            <span className="text-xs font-mono text-gray-400">{sub.color || '#3B82F6'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{sub.name}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            sub.language === 'en' ? 'bg-pink-50 text-pink-600' : 'bg-sky-50 text-sky-600'
                          }`}>
                            {sub.language === 'en' ? 'English' : 'Tamil'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-500 max-w-[120px] truncate" title={sub.slug}>{sub.slug}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-500 text-center">{sub.menuOrder !== undefined ? sub.menuOrder : (sub.displayOrder || 0)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(sub)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(sub.subcategoryId || sub.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubcategories;
