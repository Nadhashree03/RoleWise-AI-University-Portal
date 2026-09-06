import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  details,
  changeReview,
  confirmLabel = 'Confirm & Proceed',
  cancelLabel = 'Cancel',
  confirmVariant = 'indigo', // 'indigo', 'emerald', 'rose'
  onConfirm,
  onCancel,
  icon: Icon = AlertTriangle,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    indigo: {
      btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/60',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      border: 'border-indigo-500/30',
    },
    emerald: {
      btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      border: 'border-emerald-500/30',
    },
    rose: {
      btn: 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/60',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      border: 'border-rose-500/30',
    },
  };

  const style = variantStyles[confirmVariant] || variantStyles.indigo;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl bg-slate-950 border ${style.border} p-6 shadow-2xl shadow-black text-slate-100 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-2xl border ${style.iconBg} flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                High-Impact Action Verification
              </span>
            </div>
            <h3 className="text-base font-bold text-white leading-snug">{title}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Change Review & Impact Assessment Section */}
        {changeReview && (
          <div className="mb-4 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 pb-1 border-b border-indigo-500/20">
              <span>Change Review & State Delta</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Review Before Apply</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Current State</span>
                <span className="text-slate-200 font-medium text-[11px]">{changeReview.currentState || changeReview.previousState}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-indigo-500/30">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5">Proposed Action / New State</span>
                <span className="text-white font-semibold text-[11px]">{changeReview.proposedAction || changeReview.proposedState || changeReview.newState}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex items-start gap-1.5">
                <span className="text-slate-400 font-medium flex-shrink-0">What Changed:</span>
                <span className="text-slate-200">{changeReview.whatChanged}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 font-medium flex-shrink-0">Expected Impact:</span>
                <span className="text-amber-200/90">{changeReview.expectedImpact}</span>
              </div>
              {changeReview.reason && (
                <div className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-medium flex-shrink-0">Reason / Reference:</span>
                  <span className="text-indigo-200 font-mono">{changeReview.reason}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {details && (
          <div className="mb-5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            {Object.entries(details).map(([k, v]) => (
              <div key={k} className="flex justify-between py-0.5 border-b border-slate-850 last:border-b-0">
                <span className="text-slate-400">{k}:</span>
                <span className="font-semibold text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-lg transition-all hover:scale-[1.02] ${style.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
