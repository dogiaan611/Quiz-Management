import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

/**
 * DashboardLayout
 * Wraps all protected pages with the sidebar + main content area.
 * Usage: <DashboardLayout title="Page Title" subtitle="..." actions={<button/>}>
 *          <PageContent />
 *        </DashboardLayout>
 */
const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* Sidebar */}
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — offset by sidebar on desktop */}
      <div className="flex-1 min-w-0 md:ml-[240px]">
        {/* Top bar (mobile only) */}
        <div className="sticky top-0 z-20 flex items-center gap-4 px-5 py-4 md:hidden bg-white border-b border-slate-200/80">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <span className="font-bold text-slate-800 text-base">QuizApp</span>
        </div>

        {/* Page header (desktop) */}
        {(title || actions) && (
          <div className="hidden md:flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200/60">
            <div>
              {title && (
                <h1 className="text-xl font-bold text-slate-900 leading-none">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}

        {/* Scrollable page content */}
        <main className="p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
