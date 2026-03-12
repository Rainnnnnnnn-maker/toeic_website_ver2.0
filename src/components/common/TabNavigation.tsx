'use client';

import { useState, useEffect } from 'react';

export type TabId = 'important' | 'medium' | 'high';

interface Tab {
  id: TabId;
  label: string;
  status: 'active' | 'coming_soon';
}

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

const TABS: Tab[] = [
  { id: 'important', label: '重要単語', status: 'active' },
  { id: 'medium', label: '中難易度単語', status: 'active' },
  { id: 'high', label: '高難易度単語', status: 'active' },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleTabClick = (tab: Tab) => {
    if (tab.status === 'coming_soon') {
      setToastMessage('coming soon...');
      return;
    }
    onTabChange(tab.id);
  };

  return (
    <div className="w-full flex flex-col gap-1.5 relative">
      <div className="w-full overflow-x-auto p-1 -m-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
        <div className="flex gap-1.5 min-w-min" role="tablist">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isInactive = tab.status === 'coming_soon';

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isInactive}
                className={`
                  relative flex items-center justify-center px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-300/50 group
                  ${isActive 
                    ? 'text-blue-600 bg-blue-50 border-blue-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)]' 
                    : 'bg-transparent border-transparent text-gray-500'}
                  ${isInactive 
                    ? 'opacity-60 bg-gray-100 cursor-not-allowed hover:bg-gray-200' 
                    : ''}
                `}
                onClick={() => handleTabClick(tab)}
              >
                {tab.label}
                {isInactive && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded pointer-events-none opacity-0 transition-opacity duration-200 whitespace-nowrap z-10 group-hover:opacity-100">
                    近日実装予定
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg transition-all duration-300 z-50 pointer-events-none
        ${toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}
      `}>
        {toastMessage}
      </div>
    </div>
  );
}
