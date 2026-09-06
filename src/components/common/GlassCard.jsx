import React from 'react';

export const GlassCard = ({
  children,
  className = '',
  hoverEffect = false,
  gradientBorder = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'relative rounded-2xl overflow-hidden backdrop-blur-xl border';
  const styleClasses = gradientBorder
    ? 'bg-gradient-to-b from-slate-900/80 to-slate-950/90 border-white/10 shadow-xl shadow-black/40'
    : 'bg-slate-900/60 border-slate-800/80 shadow-lg shadow-black/30';

  const interactiveClasses = hoverEffect
    ? 'transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_12px_30px_rgba(79,70,229,0.15)] cursor-pointer'
    : '';

  return (
    <div
      className={`${baseClasses} ${styleClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Ambient subtle top edge reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
