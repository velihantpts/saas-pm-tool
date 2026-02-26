'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import CommandPalette from '@/components/shared/CommandPalette';
import KeyboardShortcuts from '@/components/shared/KeyboardShortcuts';
import { RealtimeProvider } from '@/components/shared/RealtimeProvider';
import { useSidebarStore } from '@/store/use-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className={`main-transition min-h-screen ${collapsed ? 'ml-16' : 'ml-60'}`}>
          <TopBar />
          {children}
        </main>

        {/* Global Modals */}
        <TaskDetailModal />
        <CommandPalette />
        <KeyboardShortcuts />
      </div>
    </RealtimeProvider>
  );
}
