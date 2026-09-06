import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top left indigo glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        {/* Top right purple glow */}
        <div className="absolute top-20 -right-20 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-3xl" />
        {/* Bottom cyan accent */}
        <div className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      {/* Persistent App Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Layout Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out relative z-10 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navigation Bar */}
        <TopNavbar setMobileOpen={setMobileOpen} />

        {/* Dynamic Page Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
