import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminWidgets.css';

const AdminWidgets = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    widgetType: 'Recent Posts',
    placement: 'sidebar',
    menuOrder: 0,
    // config properties
    limit: 5,
    customHtml: ''
  });

  const widgetTypes = ['Recent Posts', 'Categories', 'Tags Cloud', 'Custom HTML'];

  const loadWidgets = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/widgets');
      if (Array.isArray(res)) {
        setWidgets(res);
      }
    } catch (err) {
      console.error('Failed to load active widgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWidgets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      widgetType: 'Recent Posts',
      placement: 'sidebar',
      menuOrder: 0,
      limit: 5,
      customHtml: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Widget title is required');
      return;
    }

    try {
      const configObj = {};
      if (formData.widgetType === 'Recent Posts') {
        configObj.limit = parseInt(formData.limit, 10) || 5;
      } else if (formData.widgetType === 'Custom HTML') {
        configObj.html = formData.customHtml;
      }

      const payload = {
        title: formData.title,
        widgetType: formData.widgetType,
        placement: formData.placement,
        menuOrder: parseInt(formData.menuOrder, 10) || 0,
        config: JSON.stringify(configObj)
      };

      const res = await fetchApi('/admin/widgets', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Widget created successfully!');
        resetForm();
        loadWidgets();
      }
    } catch (err) {
      setErrorMsg('Failed to save widget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this widget layout?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/widgets/${id}`, { method: 'DELETE' });
      setSuccessMsg('Widget removed successfully');
      loadWidgets();
    } catch (err) {
      setErrorMsg('Failed to delete widget');
    }
  };

  const moveOrder = async (item, index, direction, list) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const currentItem = list[index];
    const swapItem = list[targetIdx];

    const tempOrder = currentItem.menuOrder;
    currentItem.menuOrder = swapItem.menuOrder;
    swapItem.menuOrder = tempOrder;

    setLoading(true);
    try {
      await fetchApi('/admin/widgets/reorder', {
        method: 'PUT',
        body: JSON.stringify([
          { id: currentItem.id, menuOrder: currentItem.menuOrder, placement: currentItem.placement },
          { id: swapItem.id, menuOrder: swapItem.menuOrder, placement: swapItem.placement }
        ])
      });
      setSuccessMsg('Widget placement order updated');
      loadWidgets();
    } catch (err) {
      setErrorMsg('Failed to update reorder details');
      setLoading(false);
    }
  };

  const getWidgetsByZone = (zone) => {
    return widgets
      .filter((w) => w.placement === zone)
      .sort((a, b) => a.menuOrder - b.menuOrder);
  };

  const renderZoneList = (zone, zoneTitle) => {
    const list = getWidgetsByZone(zone);
    return (
      <div className="zone-widgets-group">
        <h3>
          {zoneTitle} zone ({list.length})
        </h3>
        {list.length === 0 ? (
          <div className="empty-zone-state">Drag or create widgets for this zone area.</div>
        ) : (
          <div className="widget-nodes-list">
            {list.map((w, idx) => {
              let infoText = '';
              try {
                const conf = JSON.parse(w.config);
                if (w.widgetType === 'Recent Posts') infoText = `Limit: ${conf.limit} posts`;
                else if (w.widgetType === 'Custom HTML') infoText = `HTML code stub`;
              } catch (e) {}

              return (
                <div key={w.id} className="widget-card-node">
                  <div className="node-details">
                    <span className="font-semibold text-slate-800">{w.title}</span>
                    <span className="badge badge-widget-type">{w.widgetType}</span>
                    {infoText && <span className="text-xs text-gray-500 font-light block">{infoText}</span>}
                  </div>
                  <div className="node-actions">
                    <button type="button" className="mini-action" onClick={() => moveOrder(w, idx, -1, list)} disabled={idx === 0}>
                      <i className="fa-solid fa-arrow-up"></i>
                    </button>
                    <button type="button" className="mini-action" onClick={() => moveOrder(w, idx, 1, list)} disabled={idx === list.length - 1}>
                      <i className="fa-solid fa-arrow-down"></i>
                    </button>
                    <button type="button" className="mini-action danger" onClick={() => handleDelete(w.id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-widgets-container">
      <div className="pages-header">
        <h1>Sidebar & Footer Widgets</h1>
        <p className="subtitle">Choose layout components and place them in page sidebar or footer columns</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left: Configure widget */}
        <div className="form-panel">
          <h2>Create Widget Layout</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="widgetType">Widget Component Type</label>
              <select id="widgetType" name="widgetType" value={formData.widgetType} onChange={handleInputChange}>
                {widgetTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Widget Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Recent Breaking Posts"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="placement">Placement Zone</label>
                <select id="placement" name="placement" value={formData.placement} onChange={handleInputChange}>
                  <option value="sidebar">Right Sidebar Zone</option>
                  <option value="footer">Footer Columns Zone</option>
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

            {/* Config specific fields */}
            {formData.widgetType === 'Recent Posts' && (
              <div className="form-group">
                <label htmlFor="limit">Maximum Posts Count</label>
                <input
                  type="number"
                  id="limit"
                  name="limit"
                  value={formData.limit}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                />
              </div>
            )}

            {formData.widgetType === 'Custom HTML' && (
              <div className="form-group">
                <label htmlFor="customHtml">Custom HTML / Script Block</label>
                <textarea
                  id="customHtml"
                  name="customHtml"
                  rows="4"
                  value={formData.customHtml}
                  onChange={handleInputChange}
                  placeholder="<div class='ad-banner'>...</div>"
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full">
              Add Widget to Layout
            </button>
          </form>
        </div>

        {/* Right: Zones list */}
        <div className="table-panel flex flex-col gap-6">
          {loading ? (
            <div className="loading-state">Loading active widgets...</div>
          ) : (
            <div>
              {renderZoneList('sidebar', 'Right Sidebar')}
              <div className="my-6 border-b border-gray-100" />
              {renderZoneList('footer', 'Footer Columns')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWidgets;
