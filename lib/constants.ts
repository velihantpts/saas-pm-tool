// Plan limits
export const PLAN_LIMITS = {
  FREE: { members: 5, projects: 3 },
  PRO: { members: Infinity, projects: Infinity },
  ENTERPRISE: { members: Infinity, projects: Infinity },
} as const;

// Default Kanban columns
export const DEFAULT_COLUMNS = [
  { name: 'Backlog', color: '#6b7280', order: 0 },
  { name: 'Todo', color: '#3b82f6', order: 1 },
  { name: 'In Progress', color: '#f59e0b', order: 2 },
  { name: 'In Review', color: '#8b5cf6', order: 3 },
  { name: 'Done', color: '#10b981', order: 4 },
];

// Status → Column mapping
export const STATUS_COLUMN_MAP: Record<string, string> = {
  BACKLOG: 'Backlog',
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  CANCELLED: 'Done',
};

// Priority config
export const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: '#ef4444', icon: '🔴' },
  HIGH: { label: 'High', color: '#f97316', icon: '🟠' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', icon: '🟡' },
  LOW: { label: 'Low', color: '#3b82f6', icon: '🔵' },
  NONE: { label: 'None', color: '#6b7280', icon: '⚪' },
} as const;

// Default labels
export const DEFAULT_LABELS = [
  { name: 'Bug', color: '#ef4444' },
  { name: 'Feature', color: '#3b82f6' },
  { name: 'Enhancement', color: '#06b6d4' },
  { name: 'Documentation', color: '#10b981' },
  { name: 'Design', color: '#8b5cf6' },
  { name: 'Performance', color: '#f59e0b' },
  { name: 'Security', color: '#f97316' },
  { name: 'Testing', color: '#14b8a6' },
];
