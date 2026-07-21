import React, { useState } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminBulkPostUpload.css';

const AdminBulkPostUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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
      const response = await fetch('/api/admin/articles/bulk-upload', {
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
            <p className="text-xs text-slate-600 mb-2">Column 1: <strong>Title</strong>, Column 2: <strong>Summary</strong>, Column 3: <strong>Content</strong>, Column 4: <strong>Language (ta/en)</strong></p>
            <div className="code-snippet">
              Title,Summary,Content,Language<br />
              "TN Assembly Update","State budget announcements","Full content text...","ta"
            </div>
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
