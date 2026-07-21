import React, { useState, useEffect, useCallback } from 'react';
import { Image, Upload, Check, X, Search, Info } from 'lucide-react';
import api from '../utils/axios';

export default function MediaPickerModal({ isOpen, onClose, onSelectImage }) {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: 0,
        size: 40,
        type: 'image',
        search
      });
      const res = await api.get(`/api/admin/media?${params}`);
      setUploadedAssets(res.data.content || []);
    } catch (e) {
      console.error("Failed to load media assets in picker", e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (isOpen && activeTab === 'gallery') {
      loadMedia();
    }
  }, [isOpen, activeTab, loadMedia]);

  if (!isOpen) return null;

  const handleConfirmSelect = () => {
    const finalUrl = activeTab === 'url' ? urlInput : selectedUrl;
    if (!finalUrl) {
      alert('Please select or enter an image URL');
      return;
    }
    onSelectImage({ url: finalUrl, altText });
    onClose();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('files', file);
    formData.append('altText', altText);

    setUploading(true);
    try {
      const res = await api.post('/api/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.length > 0) {
        const newAsset = res.data[0];
        setUploadedAssets(prev => [newAsset, ...prev]);
        setSelectedUrl(newAsset.url);
        if (newAsset.altText) setAltText(newAsset.altText);
        setActiveTab('gallery');
      }
    } catch (err) {
      console.error("Upload failed in picker", err);
      alert('Upload failed. Verify file type and size.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Image size={20} className="text-[#B3732A]" />
            <h3 className="font-bold text-gray-800 text-base">Media Picker</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-100 px-6 pt-3 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'gallery' ? 'border-[#B3732A] text-[#B3732A] bg-white' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Media Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'upload' ? 'border-[#B3732A] text-[#B3732A] bg-white' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'url' ? 'border-[#B3732A] text-[#B3732A] bg-white' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Image URL
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="relative max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter media files…"
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs w-full"
                />
              </div>

              {loading ? (
                <div className="text-center py-10 text-gray-400 text-xs">Loading media assets...</div>
              ) : uploadedAssets.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">No media assets found in library.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                  {uploadedAssets.map((asset, idx) => {
                    const isSelected = selectedUrl === asset.url;
                    return (
                      <div
                        key={asset.id || idx}
                        onClick={() => { setSelectedUrl(asset.url); if (asset.altText) setAltText(asset.altText); }}
                        className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-[#B3732A] ring-2 ring-[#B3732A]/20 scale-[0.98]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={asset.url} alt={asset.altText || ''} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#B3732A]/30 flex items-center justify-center">
                            <div className="w-7 h-7 bg-[#B3732A] text-white rounded-full flex items-center justify-center">
                              <Check size={16} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center space-y-3 bg-gray-50/50">
              <Upload size={32} className="mx-auto text-[#B3732A]" />
              <div>
                <p className="text-sm font-bold text-gray-800">Drag & drop or browse image file</p>
                <p className="text-xs text-gray-400 mt-1">Accepted formats: PNG, JPG, JPEG, WEBP, SVG (max 10MB)</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#9c6323]">
                <span>{uploading ? 'Uploading…' : 'Browse File'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-600">Image Web URL *</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20"
              />
              {urlInput && (
                <div className="mt-2 aspect-video max-w-xs rounded-xl overflow-hidden border border-gray-200">
                  <img src={urlInput} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Image Description / Alt Text */}
          <div className="pt-3 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Image Description (Alt Text for SEO)</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive text for accessibility & SEO…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleConfirmSelect}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323]"
          >
            <Check size={15} /> Select Image
          </button>
        </div>
      </div>
    </div>
  );
}
