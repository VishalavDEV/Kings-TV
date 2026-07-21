import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showSuccess = (msg) => addToast(msg, 'success');
  const showError = (msg) => addToast(msg, 'error');
  const showInfo = (msg) => addToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showInfo }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium animate-fade-in transition-all ${
              toast.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-700'
                : toast.type === 'info'
                ? 'bg-blue-900 text-blue-100 border-blue-700'
                : 'bg-emerald-900 text-emerald-100 border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'error' && <AlertCircle size={18} className="text-red-300 shrink-0" />}
              {toast.type === 'info' && <Info size={18} className="text-blue-300 shrink-0" />}
              {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="ml-3 opacity-70 hover:opacity-100">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: () => {},
      showSuccess: (msg) => console.log('[Success]', msg),
      showError: (msg) => console.warn('[Error]', msg),
      showInfo: (msg) => console.log('[Info]', msg)
    };
  }
  return context;
}
