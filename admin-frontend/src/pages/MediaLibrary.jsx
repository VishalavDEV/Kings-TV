import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../utils/axios';
import {
  Image,
  Video,
  Music,
  FileText,
  Search,
  Grid,
  List as ListIcon,
  UploadCloud,
  X,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Edit2,
  Info,
  ExternalLink
} from 'lucide-react';

const API_BASE = '/api/admin/media';

export default function MediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'image' | 'video' | 'audio' | 'document'
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [references, setReferences] = useState([]);
  
  // Modals & States
  const [uploading, setUploading] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [replacingFile, setReplacingFile] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null); // { type: 'success'|'error', text: '' }

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        size: 20,
        type: typeFilter,
        tag: tagFilter,
        search
      });
      const res = await api.get(`${API_BASE}?${params}`);
      setAssets(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load media assets');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, tagFilter, search]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Dropzone multi-file upload
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      await api.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showAlert('success', `Successfully uploaded ${acceptedFiles.length} file(s)`);
      setPage(0);
      loadAssets();
    } catch (e) {
      console.error(e);
      showAlert('error', 'File upload failed');
    } finally {
      setUploading(false);
    }
  }, [loadAssets]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Detail panel loading
  const selectAssetDetails = async (asset) => {
    setSelectedAsset(asset);
    setDetailLoading(true);
    setReferences([]);
    try {
      const res = await api.get(`${API_BASE}/${asset.id}`);
      setReferences(res.data.references || []);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Update alt text, tags, filename
  const handleUpdateMetadata = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setSavingMeta(true);
    try {
      const res = await api.put(`${API_BASE}/${selectedAsset.id}`, {
        altText: selectedAsset.altText,
        tags: selectedAsset.tags,
        filename: selectedAsset.filename
      });
      setSelectedAsset(res.data);
      // Update in main list
      setAssets(prev => prev.map(a => a.id === res.data.id ? res.data : a));
      showAlert('success', 'Metadata updated successfully');
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to update metadata');
    } finally {
      setSavingMeta(false);
    }
  };

  // Replace file
  const handleReplaceFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedAsset) return;
    
    setReplacingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`${API_BASE}/${selectedAsset.id}/replace`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedAsset(res.data);
      setAssets(prev => prev.map(a => a.id === res.data.id ? res.data : a));
      showAlert('success', 'File replaced successfully');
      selectAssetDetails(res.data);
    } catch (e) {
      console.error(e);
      showAlert('error', 'File replacement failed');
    } finally {
      setReplacingFile(false);
    }
  };

  // Single Delete
  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;
    if (!confirm(`Are you sure you want to delete ${selectedAsset.filename}?`)) return;

    try {
      await api.delete(`${API_BASE}/${selectedAsset.id}`);
      showAlert('success', 'Asset deleted successfully');
      setSelectedAsset(null);
      loadAssets();
    } catch (err) {
      if (err.response?.status === 409) {
        // References exist
        const refs = err.response.data.references || [];
        setReferences(refs);
        showAlert('error', 'Deletion blocked: asset is currently in use.');
      } else {
        showAlert('error', 'Deletion failed.');
      }
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.size} selected asset(s)?`)) return;

    try {
      const ids = Array.from(selectedIds);
      const res = await api.post(`${API_BASE}/bulk-delete`, ids);
      const deleted = res.data.deletedCount;
      const failed = res.data.failedCount;

      if (failed > 0) {
        showAlert('error', `Deleted ${deleted} items. ${failed} items could not be deleted because they are in use.`);
      } else {
        showAlert('success', `Successfully deleted ${deleted} items.`);
      }
      setSelectedIds(new Set());
      setSelectedAsset(null);
      loadAssets();
    } catch (e) {
      console.error(e);
      showAlert('error', 'Bulk deletion failed.');
    }
  };

  const handleSelectToggle = (id) => {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === assets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(assets.map(a => a.id)));
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image size={18} className="text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video size={18} className="text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music size={18} className="text-emerald-500" />;
    return <FileText size={18} className="text-orange-500" />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Alert message banner */}
      {alertMsg && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl transition-all ${
          alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
        }`}>
          {alertMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span className="text-xs font-semibold">{alertMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Media Library</h1>
          <p className="text-xs text-gray-400 mt-1">Manage and centralize all system media, images, video and documents.</p>
        </div>
        
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors"
          >
            <Trash2 size={14} /> Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Upload Drag & Drop Box */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-[#B3732A] bg-[#B3732A]/5 scale-[0.99]' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={32} className="mx-auto text-[#B3732A] mb-2" />
        <p className="text-sm font-bold text-gray-700">
          {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Images, Videos, Audio tracks, and Documents (max 20MB per file)</p>
        {uploading && <div className="mt-2 text-xs font-semibold text-[#B3732A] animate-pulse">Uploading file assets...</div>}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Search box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search filename or alt..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs w-48 focus:outline-none focus:border-[#B3732A]"
            />
          </div>

          {/* Type filters */}
          {['', 'image', 'video', 'audio', 'document'].map(t => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                typeFilter === t ? 'bg-[#B3732A] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t === '' ? 'All Types' : t}
            </button>
          ))}

          {/* Tag filter input */}
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={e => { setTagFilter(e.target.value); setPage(0); }}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs w-28 focus:outline-none focus:border-[#B3732A]"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#B3732A]' : 'text-gray-400'}`}
          >
            <Grid size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#B3732A]' : 'text-gray-400'}`}
          >
            <ListIcon size={15} />
          </button>
        </div>
      </div>

      {/* Main Grid/List Layout split with Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Assets List/Grid */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <RefreshCw className="mx-auto text-gray-300 animate-spin" size={32} />
              <p className="text-xs text-gray-400 mt-2">Loading media assets...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Info className="mx-auto text-gray-300" size={32} />
              <p className="text-xs text-gray-400 mt-2">No media assets found matching the criteria.</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {assets.map(asset => {
                const isSelected = selectedIds.has(asset.id);
                const isActive = selectedAsset?.id === asset.id;
                return (
                  <div
                    key={asset.id}
                    className={`group relative bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all shadow-sm ${
                      isActive ? 'border-[#B3732A] ring-2 ring-[#B3732A]/20 scale-[0.98]' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {/* Select Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectToggle(asset.id)}
                      className="absolute top-2.5 left-2.5 z-10 w-4.5 h-4.5 rounded-md border-gray-300 text-[#B3732A] focus:ring-[#B3732A] cursor-pointer"
                    />

                    {/* Preview Image/Icon */}
                    <div onClick={() => selectAssetDetails(asset)} className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                      {asset.mimeType.startsWith('image/') ? (
                        <img src={asset.url} alt={asset.altText} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250" />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 p-4">
                          {getFileIcon(asset.mimeType)}
                          <span className="text-[10px] font-semibold text-gray-400 truncate max-w-full">{asset.mimeType}</span>
                        </div>
                      )}
                    </div>

                    {/* Filename footer */}
                    <div onClick={() => selectAssetDetails(asset)} className="p-2.5 border-t border-gray-50">
                      <p className="text-[11px] font-bold text-gray-700 truncate">{asset.filename}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatSize(asset.sizeBytes)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-2.5 px-4 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === assets.length && assets.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-[#B3732A]"
                      />
                    </th>
                    <th className="py-2.5 px-4 text-left text-[11px] font-bold text-gray-400 uppercase">Preview</th>
                    <th className="py-2.5 px-4 text-left text-[11px] font-bold text-gray-400 uppercase">Filename</th>
                    <th className="py-2.5 px-4 text-left text-[11px] font-bold text-gray-400 uppercase">Type</th>
                    <th className="py-2.5 px-4 text-left text-[11px] font-bold text-gray-400 uppercase">Size</th>
                    <th className="py-2.5 px-4 text-left text-[11px] font-bold text-gray-400 uppercase">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => {
                    const isSelected = selectedIds.has(asset.id);
                    const isActive = selectedAsset?.id === asset.id;
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => selectAssetDetails(asset)}
                        className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                          isActive ? 'bg-[#B3732A]/5' : ''
                        }`}
                      >
                        <td className="py-2 px-4" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectToggle(asset.id)}
                            className="rounded border-gray-300 text-[#B3732A]"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <div className="w-10 h-7 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                            {asset.mimeType.startsWith('image/') ? (
                              <img src={asset.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              getFileIcon(asset.mimeType)
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4 font-bold text-gray-700 text-xs truncate max-w-[180px]">{asset.filename}</td>
                        <td className="py-2 px-4 text-gray-400 text-xs">{asset.mimeType}</td>
                        <td className="py-2 px-4 text-gray-500 text-xs">{formatSize(asset.sizeBytes)}</td>
                        <td className="py-2 px-4">
                          {asset.tags ? (
                            <div className="flex gap-1 flex-wrap">
                              {asset.tags.split(',').map((t, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 text-[9px] font-semibold">{t.trim()}</span>
                              ))}
                            </div>
                          ) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-gray-200 rounded-xl bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-gray-500 font-semibold">Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-gray-200 rounded-xl bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {selectedAsset ? (
            <>
              {/* Asset Header */}
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 text-sm truncate max-w-[200px]" title={selectedAsset.filename}>
                  {selectedAsset.filename}
                </h3>
                <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              {/* Display File Preview */}
              <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 relative group">
                {selectedAsset.mimeType.startsWith('image/') ? (
                  <img src={selectedAsset.url} alt={selectedAsset.altText} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    {getFileIcon(selectedAsset.mimeType)}
                    <span className="text-xs font-bold text-gray-400">{selectedAsset.mimeType}</span>
                  </div>
                )}
                
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/85"
                >
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Detail Info list */}
              <div className="space-y-1.5 text-xs text-gray-500 border-b border-gray-100 pb-3">
                <div className="flex justify-between"><span>File URL</span><span className="font-semibold text-gray-700 truncate max-w-[140px]" title={selectedAsset.url}>{selectedAsset.url}</span></div>
                <div className="flex justify-between"><span>File Size</span><span className="font-semibold text-gray-700">{formatSize(selectedAsset.sizeBytes)}</span></div>
                <div className="flex justify-between"><span>Mime Type</span><span className="font-semibold text-gray-700">{selectedAsset.mimeType}</span></div>
                <div className="flex justify-between"><span>Uploaded At</span><span className="font-semibold text-gray-700">{new Date(selectedAsset.createdAt).toLocaleDateString()}</span></div>
              </div>

              {/* Edit metadata form */}
              <form onSubmit={handleUpdateMetadata} className="space-y-3 border-b border-gray-100 pb-4">
                <h4 className="font-bold text-gray-700 text-xs flex items-center gap-1">
                  <Edit2 size={12} /> Edit Metadata
                </h4>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">Alt Text (Accessibility & SEO)</label>
                  <input
                    type="text"
                    value={selectedAsset.altText || ''}
                    onChange={e => setSelectedAsset(prev => ({ ...prev, altText: e.target.value }))}
                    placeholder="Descriptive explanation for image..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#B3732A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={selectedAsset.tags || ''}
                    onChange={e => setSelectedAsset(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="news, sports, goldrate..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#B3732A]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingMeta}
                  className="w-full py-1.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors"
                >
                  {savingMeta ? 'Saving...' : 'Save Metadata'}
                </button>
              </form>

              {/* Replace file action */}
              <div className="border-b border-gray-100 pb-4">
                <h4 className="font-bold text-gray-700 text-xs mb-2">Replace Physical File</h4>
                <label className="block text-center border border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-50/50">
                  <span className="text-xs text-gray-500 font-semibold">{replacingFile ? 'Replacing...' : 'Choose new file'}</span>
                  <input type="file" onChange={handleReplaceFile} className="hidden" disabled={replacingFile} />
                </label>
              </div>

              {/* Usage & References Scan */}
              <div className="space-y-2 border-b border-gray-100 pb-4">
                <h4 className="font-bold text-gray-700 text-xs">Used In (References)</h4>
                {detailLoading ? (
                  <div className="text-[11px] text-gray-400 animate-pulse">Scanning DB references...</div>
                ) : references.length === 0 ? (
                  <div className="text-[11px] text-gray-400 italic">Not used anywhere (Safe to delete).</div>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {references.map((ref, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div>
                          <div className="text-[11px] font-bold text-gray-700 truncate max-w-[150px]">{ref.title}</div>
                          <div className="text-[9px] text-gray-400 uppercase font-semibold">{ref.type}</div>
                        </div>
                        {ref.type === 'Article' && (
                          <a
                            href={`/posts/edit/${ref.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#B3732A] font-bold hover:underline"
                          >
                            Edit
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete asset button */}
              <button
                onClick={handleDeleteAsset}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={13} /> Delete Asset
              </button>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400 space-y-2">
              <Info size={28} className="mx-auto text-gray-300" />
              <p className="text-xs">Select an asset item to view detailed info, edit SEO alt tags, verify usages, or replace files.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
