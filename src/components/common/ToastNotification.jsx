
import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastNotification = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-slate-950/95 shadow-emerald-950/50',
    warning: 'border-amber-500/40 bg-slate-950/95 shadow-amber-950/50',
    info: 'border-cyan-500/40 bg-slate-950/95 shadow-cyan-950/50',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70] max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 text-slate-100 ${
          borders[toast.type] || borders.success
        }`}
      >
        <div className="p-1 rounded-lg bg-slate-900 flex-shrink-0 mt-0.5">
          {icons[toast.type] || icons.success}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white">{toast.title}</h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
