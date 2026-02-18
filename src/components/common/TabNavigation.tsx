'use client';

import { useState, useEffect } from 'react';
import styles from './TabNavigation.module.css';

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
  { id: 'high', label: '高難易度単語', status: 'coming_soon' },
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
    <div className={styles.container}>
      <div className={styles.tabsScrollContainer}>
        <div className={styles.tabsList} role="tablist">
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
                  ${styles.tabButton} 
                  ${isActive ? styles.activeTab : ''} 
                  ${isInactive ? styles.inactiveTab : ''}
                `}
                onClick={() => handleTabClick(tab)}
              >
                {tab.label}
                {isInactive && (
                  <span className={styles.tooltip}>近日実装予定</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`${styles.toast} ${toastMessage ? styles.toastVisible : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}
