import React, { useState } from 'react';
import { Sparkles, Check, X, AlertTriangle } from 'lucide-react';

/**
 * SuggestionField Component
 * Enforces: "Suggest, don't overwrite"
 * Render committed input value alongside AI suggestion overlay.
 */
const SuggestionField = ({
  label,
  value = '',
  suggestion = '',
  onChange,
  onUseSuggestion,
  onDiscardSuggestion,
  type = 'text',
  rows = 3,
  placeholder = '',
  required = false,
  badgeText = '',
  helpText = '',
  multiline = false
}) => {
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);

  const handleUse = () => {
    if (onUseSuggestion) {
      onUseSuggestion(suggestion);
    }
    setShowOverwriteWarning(false);
  };

  const handleDiscard = () => {
    if (onDiscardSuggestion) {
      onDiscardSuggestion();
    }
    setShowOverwriteWarning(false);
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>
          {badgeText && (
            <span style={{ 
              fontSize: '0.72rem', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '12px', 
              background: 'rgba(245, 158, 11, 0.12)', 
              color: '#d97706',
              fontWeight: 600 
            }}>
              {badgeText}
            </span>
          )}
        </div>
      )}

      {/* Main Committed Input */}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="form-control"
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border-color, #cbd5e1)',
            background: 'var(--bg-secondary, #ffffff)',
            color: 'var(--text-primary, #0f172a)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="form-control"
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border-color, #cbd5e1)',
            background: 'var(--bg-secondary, #ffffff)',
            color: 'var(--text-primary, #0f172a)',
            fontSize: '0.9rem'
          }}
        />
      )}

      {/* Pending AI Suggestion Overlay Box */}
      {suggestion && (
        <div style={{
          marginTop: '0.5rem',
          borderRadius: '8px',
          border: '1.5px dashed rgba(245, 158, 11, 0.6)',
          background: 'rgba(245, 158, 11, 0.05)',
          padding: '0.65rem 0.85rem',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Sparkles size={13} /> AI Suggestion
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={handleUse}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '14px',
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(245,158,11,0.3)'
                }}
              >
                <Check size={12} /> Use
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                title="Discard Suggestion"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: 'none',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {suggestion}
          </div>

          {showOverwriteWarning && (
            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertTriangle size={12} /> You've edited this field — clicking Use will replace your edit.
            </div>
          )}
        </div>
      )}

      {helpText && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.3rem' }}>{helpText}</div>}
    </div>
  );
};

export default SuggestionField;
