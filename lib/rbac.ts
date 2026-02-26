import type { WorkspaceRole } from '@prisma/client';

type Permission =
  | 'workspace:manage'
  | 'workspace:billing'
  | 'workspace:delete'
  | 'members:manage'
  | 'project:create'
  | 'project:delete'
  | 'task:create'
  | 'task:delete'
  | 'task:update'
  | 'comment:create'
  | 'label:manage'
  | 'sprint:manage'
  | 'integration:manage'
  | 'view:all';

const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  OWNER: [
    'workspace:manage', 'workspace:billing', 'workspace:delete',
    'members:manage', 'project:create', 'project:delete',
    'task:create', 'task:delete', 'task:update',
    'comment:create', 'label:manage', 'sprint:manage',
    'integration:manage', 'view:all',
  ],
  ADMIN: [
    'workspace:manage', 'members:manage',
    'project:create', 'project:delete',
    'task:create', 'task:delete', 'task:update',
    'comment:create', 'label:manage', 'sprint:manage',
    'integration:manage', 'view:all',
  ],
  MEMBER: [
    'project:create', 'task:create', 'task:update',
    'comment:create', 'label:manage', 'sprint:manage', 'view:all',
  ],
  VIEWER: ['comment:create', 'view:all'],
};

export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: WorkspaceRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Insufficient permissions: ${permission} requires higher role than ${role}`);
  }
}
