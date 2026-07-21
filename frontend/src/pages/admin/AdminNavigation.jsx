import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminNavigation.css';

const AdminNavigation = () => {
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationTab, setLocationTab] = useState('MAIN_MENU'); // TOP_MENU, MAIN_MENU, FOOTER

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    label: '',
    link: '',
    parentId: '',
    location: 'MAIN_MENU',
    menuOrder: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [menuRes, pagesRes] = await Promise.all([
        fetchApi('/admin/navigation'),
        fetchApi('/admin/pages')
      ]);
      if (Array.isArray(menuRes)) setMenus(menuRes);
      if (Array.isArray(pagesRes)) setPages(pagesRes);
    } catch (err) {
      console.error('Failed to load navigation menus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageSelectChange = (e) => {
    const pageId = e.target.value;
    if (pageId) {
      const matchedPage = pages.find((p) => String(p.id) === String(pageId));
      if (matchedPage) {
        setFormData((prev) => ({
          ...prev,
          label: matchedPage.title,
          link: `/page/${matchedPage.slug}`
        }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      link: '',
      parentId: '',
      location: locationTab,
      menuOrder: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.label.trim() || !formData.link.trim()) {
      setErrorMsg('Menu label and link reference are required');
      return;
    }

    try {
      const payload = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId, 10) : null,
        menuOrder: parseInt(formData.menuOrder, 10) || 0
      };

      const res = await fetchApi('/admin/navigation', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Menu item added successfully!');
        resetForm();
        loadData();
      }
    } catch (err) {
      setErrorMsg('Failed to create navigation menu item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item? (Children dropdowns will be unparented)')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/navigation/${id}`, { method: 'DELETE' });
      setSuccessMsg('Menu item deleted successfully');
      loadData();
    } catch (err) {
      setErrorMsg('Failed to delete menu item');
    }
  };

  const moveOrder = async (item, index, direction) => {
    const list = getHierarchicalList().filter((m) => !m.parentId);
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap menuOrder locally
    const currentItem = list[index];
    const swapItem = list[targetIdx];

    const tempOrder = currentItem.menuOrder;
    currentItem.menuOrder = swapItem.menuOrder;
    swapItem.menuOrder = tempOrder;

    setLoading(true);
    try {
      await fetchApi('/admin/navigation/reorder', {
        method: 'PUT',
        body: JSON.stringify([
          { id: currentItem.id, menuOrder: currentItem.menuOrder, parentId: currentItem.parentId },
          { id: swapItem.id, menuOrder: swapItem.menuOrder, parentId: swapItem.parentId }
        ])
      });
      setSuccessMsg('Menu order updated');
      loadData();
    } catch (err) {
      setErrorMsg('Failed to reorder menu items');
      setLoading(false);
    }
  };

  const getHierarchicalList = () => {
    return menus
      .filter((m) => m.location === locationTab)
      .sort((a, b) => (a.menuOrder !== undefined ? a.menuOrder : a.displayOrder) - (b.menuOrder !== undefined ? b.menuOrder : b.displayOrder));
  };

  const renderMenuItemsList = () => {
    const allItems = getHierarchicalList();
    const parents = allItems.filter((m) => !m.parentId);

    return (
      <div className="menu-tree-wrapper">
        {parents.length === 0 ? (
          <div className="empty-state">No navigation links added for this menu yet.</div>
        ) : (
          parents.map((p, idx) => {
            const children = allItems.filter((c) => String(c.parentId) === String(p.id));
            return (
              <div key={p.id} className="menu-tree-node">
                <div className="tree-node-content parent-node">
                  <div className="node-details">
                    <span className="font-semibold text-slate-800">{p.label}</span>
                    <span className="node-link font-mono text-xs text-gray-500">{p.link}</span>
                  </div>
                  <div className="node-actions">
                    <button type="button" className="mini-action" onClick={() => moveOrder(p, idx, -1)} disabled={idx === 0}>
                      <i className="fa-solid fa-arrow-up"></i>
                    </button>
                    <button type="button" className="mini-action" onClick={() => moveOrder(p, idx, 1)} disabled={idx === parents.length - 1}>
                      <i className="fa-solid fa-arrow-down"></i>
                    </button>
                    <button type="button" className="mini-action danger" onClick={() => handleDelete(p.id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Dropdown nested childrens list */}
                {children.length > 0 && (
                  <div className="children-nodes-wrapper">
                    {children.map((c) => (
                      <div key={c.id} className="tree-node-content child-node">
                        <div className="node-details">
                          <span className="font-medium text-slate-700">{c.label}</span>
                          <span className="node-link font-mono text-xs text-gray-400">{c.link}</span>
                        </div>
                        <div className="node-actions">
                          <button type="button" className="mini-action danger" onClick={() => handleDelete(c.id)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="admin-navigation-container">
      <div className="pages-header">
        <h1>Navigation Menu Builder</h1>
        <p className="subtitle">Configure main menu navbar, top bar, and footer links structure</p>
      </div>

      <div className="tab-control-bar mb-4">
        <button
          type="button"
          className={`tab-btn ${locationTab === 'MAIN_MENU' ? 'active' : ''}`}
          onClick={() => {
            setLocationTab('MAIN_MENU');
            setFormData((prev) => ({ ...prev, location: 'MAIN_MENU' }));
          }}
        >
          Main Navigation Menu
        </button>
        <button
          type="button"
          className={`tab-btn ${locationTab === 'TOP_MENU' ? 'active' : ''}`}
          onClick={() => {
            setLocationTab('TOP_MENU');
            setFormData((prev) => ({ ...prev, location: 'TOP_MENU' }));
          }}
        >
          Top Bar Menu
        </button>
        <button
          type="button"
          className={`tab-btn ${locationTab === 'FOOTER' ? 'active' : ''}`}
          onClick={() => {
            setLocationTab('FOOTER');
            setFormData((prev) => ({ ...prev, location: 'FOOTER' }));
          }}
        >
          Footer Links
        </button>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left: Add Link form */}
        <div className="form-panel">
          <h2>Add Navigation Item</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label>Select Existing Custom Page</label>
              <select onChange={handlePageSelectChange}>
                <option value="">Choose custom page...</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.language === 'en' ? 'EN' : 'TA'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="label">Link Label *</label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="e.g. Services"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="link">URL / Link Reference *</label>
              <input
                type="text"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="e.g. /services or http://..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="parentId">Parent Dropdown Category</label>
                <select id="parentId" name="parentId" value={formData.parentId} onChange={handleInputChange}>
                  <option value="">None (Top Level)</option>
                  {menus
                    .filter((m) => m.location === locationTab && !m.parentId)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group half">
                <label htmlFor="menuOrder">Display Order</label>
                <input
                  type="number"
                  id="menuOrder"
                  name="menuOrder"
                  value={formData.menuOrder}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Add Menu Link
            </button>
          </form>
        </div>

        {/* Right: Structure lists */}
        <div className="table-panel">
          <h2>Menu Item Structure Hierarchy</h2>
          {loading ? <div className="loading-state">Loading structure tree...</div> : renderMenuItemsList()}
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
