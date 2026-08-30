'use client';

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import DemoRoleSwitcher from '@/components/common/DemoRoleSwitcher';
import OfflineSyncBar from '@/components/common/OfflineSyncBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1-Click Fast Switcher */}
      <DemoRoleSwitcher currentRole="SUPER_ADMIN" />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Responsive Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role="SUPER_ADMIN"
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          {/* Offline Sync State Bar */}
          <OfflineSyncBar />

          <Header
            user={{
              username: 'admin',
              role: 'SUPER_ADMIN',
              fullName: 'Super Admin',
              email: 'admin@hayatabadmodel.edu.pk',
            }}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
