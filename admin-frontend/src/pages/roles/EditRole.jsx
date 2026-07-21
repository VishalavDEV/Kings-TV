import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Check } from 'lucide-react';
import axiosInstance from '../../utils/axios';

const MODULE_KEYS = [
  { key: 'admin_panel',       label: 'Dashboard',           group: 'General' },
  { key: 'add_post',          label: 'Add Post',            group: 'Content' },
  { key: 'manage_all_posts',  label: 'Manage All Posts',    group: 'Content' },
  { key: 'categories',        label: 'Categories',          group: 'Content' },
  { key: 'navigation',        label: 'Navigation',          group: 'Site' },
  { key: 'pages',             label: 'Pages',               group: 'Site' },
  { key: 'rss_feeds',         label: 'RSS Feeds',           group: 'Site' },
  { key: 'widgets',           label: 'Widgets',             group: 'Site' },
  { key: 'polls',             label: 'Polls',               group: 'Engagement' },
  { key: 'comments',          label: 'Comments',            group: 'Engagement' },
  { key: 'reward_system',     label: 'Reward System',       group: 'Engagement' },
  { key: 'gallery',           label: 'Gallery',             group: 'Media' },
  { key: 'contact_messages',  label: 'Contact Messages',    group: 'Communication' },
  { key: 'newsletter',        label: 'Newsletter',          group: 'Communication' },
  { key: 'ad_spaces',         label: 'Ad Spaces',           group: 'Monetization' },
  { key: 'users',             label: 'Users',               group: 'Administration' },
  { key: 'roles_permissions', label: 'Roles & Permissions', group: 'Administration' },
  { key: 'seo_tools',         label: 'SEO Tools',           group: 'SEO' },
  { key: 'social_login',      label: 'Social Login',        group: 'Settings' },
  { key: 'languages',         label: 'Languages',           group: 'Settings' },
  { key: 'settings',          label: 'Settings',            group: 'Settings' },
];

const GROUPS = [...new Set(MODULE_KEYS.map(m => m.group))];

export default function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const [roleRes, permsRes] = await Promise.all([
          axiosInstance.get(`/api/v1/admin/roles/${id}`),
          axiosInstance.get('/api/v1/admin/roles/permissions'),
        ]);
        const r = roleRes.data;
        setRole(r);
        setRoleName(r.name?.replace(/_/g, ' ') || '');

        // Extract which module keys this role already has
        const existingKeys = new Set(
          (r.permissions || [])
            .map(p => p.name)
            .filter(name => MODULE_KEYS.some(m => m.key === name))
        );
        setSelectedKeys(existingKeys);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [id]);

  const toggle = (key) => {
    setSelectedKeys(prev => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
  };

  const toggleGroup = (group) => {
    const groupKeys = MODULE_KEYS.filter(m => m.group === group).map(m => m.key);
    const allSelected = groupKeys.every(k => selectedKeys.has(k));
    setSelectedKeys(prev => {
      const s = new Set(prev);
      groupKeys.forEach(k => allSelected ? s.delete(k) : s.add(k));
      return s;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await axiosInstance.put(`/api/v1/admin/roles/${id}`, {
        permissions: Array.from(selectedKeys),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/roles-permissions')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Edit Role</h2>
          <p className="text-sm text-gray-500">Configure module access for this role</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Role Name */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
          <input
            type="text"
            value={roleName}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1.5">Role names cannot be changed after creation.</p>
        </div>

        {/* Module Permissions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Module Permissions</h3>
              <span className="text-xs text-gray-400">{selectedKeys.size}/{MODULE_KEYS.length} selected</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {GROUPS.map(group => {
              const groupItems = MODULE_KEYS.filter(m => m.group === group);
              const allSelected = groupItems.every(m => selectedKeys.has(m.key));
              const someSelected = groupItems.some(m => selectedKeys.has(m.key));

              return (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => toggleGroup(group)}
                      className={`flex items-center justify-center w-4 h-4 rounded border transition-colors ${
                        allSelected
                          ? 'bg-[#B3732A] border-[#B3732A]'
                          : someSelected
                          ? 'bg-[#B3732A]/30 border-[#B3732A]/50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {(allSelected || someSelected) && <Check size={10} className="text-white" strokeWidth={3} />}
                    </button>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{group}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 ml-6">
                    {groupItems.map(item => (
                      <label
                        key={item.key}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          selectedKeys.has(item.key)
                            ? 'border-[#B3732A]/30 bg-[#B3732A]/5 text-[#B3732A]'
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedKeys.has(item.key)}
                          onChange={() => toggle(item.key)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          selectedKeys.has(item.key) ? 'bg-[#B3732A] border-[#B3732A]' : 'border-gray-300'
                        }`}>
                          {selectedKeys.has(item.key) && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/roles-permissions')}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-[#B3732A] hover:bg-[#9c6323] text-white'
            } disabled:opacity-50`}
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <><Check size={15} /> Saved!</>
            ) : (
              <><Save size={15} /> Save Permissions</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
