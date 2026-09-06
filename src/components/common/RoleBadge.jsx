import React from 'react';
import { GraduationCap, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { ROLES } from '../../context/RoleContext';

export const RoleBadge = ({ role, size = 'md', showIcon = true }) => {
  const configs = {
    [ROLES.STUDENT]: {
      label: 'Student',
      icon: GraduationCap,
      bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    },
    [ROLES.FACULTY]: {
      label: 'Faculty',
      icon: BookOpen,
      bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-400',
      glow: 'shadow-[0_0_12px_rgba(99,102,241,0.25)]',
    },
    [ROLES.ADMIN]: {
      label: 'Administrator',
      icon: ShieldCheck,
      bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    },
  };

  const current = configs[role] || configs[ROLES.STUDENT];
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md ${current.bg} ${current.glow} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
    </span>
  );
};
