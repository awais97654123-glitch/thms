'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabsProps) {
  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl no-scrollbar ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E2E8F0] text-[#475569]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
