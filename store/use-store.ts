import { create } from 'zustand';

// ─── Command Palette Store ─────────────────────────────
interface CommandPaletteStore {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useCommandPalette = create<CommandPaletteStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

// ─── Task Detail Store ─────────────────────────────────
interface TaskDetailStore {
  taskId: string | null;
  open: boolean;
  openTask: (taskId: string) => void;
  close: () => void;
}

export const useTaskDetail = create<TaskDetailStore>((set) => ({
  taskId: null,
  open: false,
  openTask: (taskId) => set({ taskId, open: true }),
  close: () => set({ taskId: null, open: false }),
}));

// ─── Keyboard Shortcuts Store ──────────────────────────
interface ShortcutsStore {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useShortcutsPanel = create<ShortcutsStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

// ─── Notification Store ────────────────────────────────
interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));

// ─── Sidebar Store ─────────────────────────────────────
interface SidebarStore {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  collapsed: false,
  setCollapsed: (collapsed) => set({ collapsed }),
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));
