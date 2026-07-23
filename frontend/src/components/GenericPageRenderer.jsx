import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

/**
 * Generic Page Rendering Engine for Kings 24x7 Enterprise Platform
 * Renders pages, sections, widgets, and layouts dynamically from backend configuration.
 * Contains ZERO hardcoded visual page structures.
 */
const GenericPageRenderer = ({ layoutType = 'WEB', renderSectionCallback }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchApi(`/public/layout/${layoutType.toLowerCase()}`)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data]
            .filter(s => s.isVisible !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setSections(sorted);
        } else {
          setSections([]);
        }
      })
      .catch(err => {
        console.warn("[GenericPageRenderer] Failed to load dynamic layout config:", err);
        setSections([]);
      })
      .finally(() => setLoading(false));
  }, [layoutType]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
        Loading dynamic page configuration...
      </div>
    );
  }

  return (
    <div className="generic-page-container" style={{ width: '100%' }}>
      {sections.map((sec) => (
        <div key={sec.id || sec.sectionKey} className={`generic-section-block section-${sec.sectionKey}`}>
          {renderSectionCallback ? renderSectionCallback(sec.sectionKey, sec.sectionLabel, sec.configJson) : null}
        </div>
      ))}
    </div>
  );
};

export default GenericPageRenderer;
