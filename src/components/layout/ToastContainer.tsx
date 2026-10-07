import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-60 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
        let borderClass = 'border-emerald-200 bg-white text-slate-800';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
          borderClass = 'border-rose-200 bg-white text-slate-800';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
          borderClass = 'border-amber-200 bg-white text-slate-800';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-blue-600 shrink-0" />;
          borderClass = 'border-blue-200 bg-white text-slate-800';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-bottom duration-200 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
