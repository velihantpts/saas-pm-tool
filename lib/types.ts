export interface TaskFilters {
  labels?: string[];
  assigneeId?: string;
  priority?: string;
  status?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface BoardTask {
  id: string;
  taskId: string;
  title: string;
  number: number;
  status: string;
  priority: string;
  position: number;
  dueDate: string | null;
  startDate: string | null;
  estimate: number | null;
  columnId: string | null;
  assignee: { id: string; name: string | null; image: string | null } | null;
  labels: { label: { id: string; name: string; color: string } }[];
  subtaskCount: number;
  commentCount: number;
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  color: string;
  wipLimit: number | null;
  tasks: BoardTask[];
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface LabelItem {
  id: string;
  name: string;
  color: string;
}
