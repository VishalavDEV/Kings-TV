import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminBulkPostUpload.css';

const AdminBulkPostUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [categoriesRef, setCategoriesRef] = useState([]);
  const [showRef, setShowRef] = useState(false);

  useEffect(() => {
    const loadCategoriesReference = async () => {
      try {
        const res = await fetchApi('/admin/articles/categories-reference');
        if (Array.isArray(res)) {
          setCategoriesRef(res);
        }
      } catch (err) {
        console.error('Failed to load categories reference', err);
      }
    };
    loadCategoriesReference();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
      setReport(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a CSV file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setReport(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/admin/articles/bulk-upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setReport(data);
      } else {
        setErrorMsg(data.error || data.message || 'Bulk upload failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to process upload. Please check your file format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-bulk-upload-container">
      <div className="pages-header">
        <h1>Bulk Post Import Tool</h1>
        <p className="subtitle">Upload multiple draft posts via CSV or Excel spreadsheet files</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      <div className="bulk-grid-layout">
        {/* Upload Form Box */}
        <div className="upload-card-panel">
          <h2>Select File for Upload</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-dropzone">
              <i className="fa-solid fa-cloud-arrow-up dropzone-icon"></i>
              <p className="dropzone-text">Drag and drop your <strong>.csv</strong> file here, or click to browse</p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              {selectedFile && (
                <div className="selected-file-badge">
                  <i className="fa-solid fa-file-csv"></i> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={uploading || !selectedFile}>
              {uploading ? 'Processing & Validating...' : 'Start Bulk Import'}
            </button>
          </form>

          {/* Template Format Info Box */}
          <div className="csv-guide-box mt-6">
            <h3><i className="fa-solid fa-circle-info"></i> Expected CSV Column Schema</h3>
            <p className="text-xs text-slate-600 mb-2">
              Column 1: <strong>Title</strong>, Column 2: <strong>Summary</strong>, Column 3: <strong>Content (HTML)</strong>, Column 4: <strong>Language (ta/en)</strong>, Column 5: <strong>CategoryId (Integer)</strong>, Column 6: <strong>SubcategoryId (Integer)</strong>
            </p>
            <div className="code-snippet mb-3" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              title,summary,content,language,categoryId,subcategoryId<br />
              "TN Assembly Update","Budget announcements","&lt;p&gt;Detailed content HTML&lt;/p&gt;","ta",1,2
            </div>
            
            <div className="flex gap-2">
              <a 
                href="/api/v1/admin/articles/bulk-template" 
                download
                className="btn btn-secondary text-xs py-1.5 px-3"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.375rem', color: '#334155', fontWeight: '600' }}
              >
                <i className="fa-solid fa-download"></i> Download CSV Template
              </a>
              <button 
                type="button" 
                className="btn btn-secondary text-xs py-1.5 px-3" 
                onClick={() => setShowRef(!showRef)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.375rem', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-list"></i> {showRef ? 'Hide Category IDs list' : 'Category IDs list'}
              </button>
            </div>

            {showRef && (
              <div className="categories-id-reference-table mt-4" style={{ background: 'white', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: '700' }}>Active Database Categories Reference</h4>
                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ paddingBottom: '0.5rem' }}>Category Name</th>
                      <th style={{ paddingBottom: '0.5rem' }}>Category ID</th>
                      <th style={{ paddingBottom: '0.5rem' }}>Language</th>
                      <th style={{ paddingBottom: '0.5rem' }}>Subcategories (Name & ID)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriesRef.map(cat => (
                      <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.4rem 0', fontWeight: '600', color: '#0f172a' }}>{cat.name}</td>
                        <td style={{ color: '#0f172a' }}><code>{cat.id}</code></td>
                        <td>
                          <span className={`lang-badge ${cat.language}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '0.25rem', background: cat.language === 'en' ? '#dbeafe' : '#fee2e2', color: cat.language === 'en' ? '#1e40af' : '#991b1b' }}>
                            {cat.language === 'en' ? 'English' : 'Tamil'}
                          </span>
                        </td>
                        <td style={{ color: '#334155' }}>
                          {cat.subcategories && cat.subcategories.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                              {cat.subcategories.map(sub => (
                                <li key={sub.id}>{sub.name} (ID: <code>{sub.id}</code>)</li>
                              ))}
                            </ul>
                          ) : <span style={{ color: '#94a3b8' }}>None</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Results Report Panel */}
        <div className="report-card-panel">
          <h2>Import Execution Results</h2>
          {!report ? (
            <div className="empty-report-state">
              <i className="fa-solid fa-table-list"></i>
              <p>Upload a CSV file to view real-time per-row validation and import status.</p>
            </div>
          ) : (
            <div>
              {/* Summary stat cards */}
              <div className="report-stats-grid mb-4">
                <div className="stat-pill total">
                  <span className="stat-label">Total Processed</span>
                  <span className="stat-value">{report.totalRows || 0}</span>
                </div>
                <div className="stat-pill success">
                  <span className="stat-label">Successful Drafts</span>
                  <span className="stat-value">{report.successCount || 0}</span>
                </div>
                <div className="stat-pill failure">
                  <span className="stat-label">Failed / Skipped</span>
                  <span className="stat-value">{report.failureCount || 0}</span>
                </div>
              </div>

              {/* Per-row results table */}
              <div className="table-wrapper max-h-96 overflow-y-auto">
                <table className="report-results-table">
                  <thead>
                    <tr>
                      <th width="60">Row</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.rowDetails || []).map((item, idx) => (
                      <tr key={idx} className={item.status === 'SUCCESS' ? 'row-success' : 'row-failure'}>
                        <td>#{item.row}</td>
                        <td className="font-semibold">{item.title}</td>
                        <td>
                          <span className={`status-pill ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-xs text-slate-600">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBulkPostUpload;
