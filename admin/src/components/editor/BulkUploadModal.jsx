import React, { useState } from 'react';
import { X, UploadCloud, FileText, Image as ImageIcon, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../api';

const BulkUploadModal = ({ onClose, onBatchDraftsCreated }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const newItems = selected.map(f => ({
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      status: 'Queued', // Queued | Processing | Ready for Review | Failed
      progress: 0
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  const handleProcessQueue = async () => {
    if (files.length === 0) return;
    setUploading(true);
    const createdDrafts = [];

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'Processing', progress: 50 } : f));
      
      try {
        const formData = new FormData();
        formData.append('file', item.file);
        
        // Upload document
        let fileUrl = '';
        try {
          const uploadRes = await api.post('/articles/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          fileUrl = uploadRes.data?.url || uploadRes.data?.imageUrl || '';
        } catch (e) {
          // Soft fallback if static document upload endpoint handles differently
        }

        // Read text content preview
        const readerText = await item.file.text().catch(() => item.name);
        const titleFromDoc = item.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

        // Auto-create draft article
        const draftPayload = {
          titleTa: titleFromDoc,
          titleEn: titleFromDoc,
          contentTa: `<p>${readerText.substring(0, 1500)}</p>`,
          contentEn: `<p>${readerText.substring(0, 1500)}</p>`,
          shortDescTa: readerText.substring(0, 200),
          shortDescEn: readerText.substring(0, 200),
          status: 'draft',
          metaKeywords: 'bulk, import, draft',
          allowComments: true,
          allowPingbacks: true
        };

        const res = await api.post('/articles/saveUpdate', draftPayload);
        createdDrafts.push(res.data);
        
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'Ready for Review', progress: 100 } : f));
      } catch (err) {
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'Failed', progress: 0 } : f));
      }
    }

    setUploading(false);
    if (onBatchDraftsCreated && createdDrafts.length > 0) {
      onBatchDraftsCreated(createdDrafts);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-primary, #ffffff)', borderRadius: '12px',
        width: '100%', maxWidth: '650px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', overflow: 'hidden', border: '1px solid var(--border-color, #cbd5e1)'
      }}>
        <div style={{
          padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary, #f8fafc)'
        }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bulk Document & Media Import</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Dropzone */}
          <div style={{
            border: '2px dashed var(--border-color, #cbd5e1)', borderRadius: '8px',
            padding: '2rem 1rem', textAlign: 'center', background: 'var(--bg-secondary, #f8fafc)',
            cursor: 'pointer', marginBottom: '1.25rem'
          }} onClick={() => document.getElementById('bulk-file-input').click()}>
            <UploadCloud size={36} style={{ color: '#0057FF', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Click or drag files to upload</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Supports Word (.docx), PDF, Text files (.txt), and Images</div>
            <input
              id="bulk-file-input"
              type="file"
              multiple
              accept=".docx,.pdf,.txt,image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          {/* Queue List */}
          {files.length > 0 && (
            <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {files.map((item, idx) => (
                <div key={idx} style={{
                  padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary, #ffffff)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FileText size={18} style={{ color: '#0057FF' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.size}</div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '12px',
                    background: item.status === 'Ready for Review' ? 'rgba(34, 197, 94, 0.12)' : item.status === 'Processing' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                    color: item.status === 'Ready for Review' ? '#16a34a' : item.status === 'Processing' ? '#2563eb' : '#64748b',
                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                  }}>
                    {item.status === 'Processing' && <RefreshCw size={12} className="spin" />}
                    {item.status === 'Ready for Review' && <CheckCircle size={12} />}
                    {item.status === 'Failed' && <AlertCircle size={12} />}
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button
              className="btn btn-primary"
              disabled={uploading || files.length === 0}
              onClick={handleProcessQueue}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0057FF' }}
            >
              {uploading && <RefreshCw size={14} className="spin" />}
              {uploading ? 'Processing Queue...' : `Auto-Draft ${files.length} Articles`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
