'use client';

import { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTaskDetail } from '@/store/use-store';
import type { BoardTask } from '@/lib/types';

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

type SortKey = 'taskId' | 'title' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'estimate';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  NONE: 4,
};

interface ListViewProps {
  tasks: BoardTask[];
  slug: string;
  onRefresh: () => void;
}

export default function ListView({ tasks, slug, onRefresh }: ListViewProps) {
  const { openTask } = useTaskDetail();
  const [sortKey, setSortKey] = useState<SortKey>('taskId');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;

    switch (sortKey) {
      case 'taskId':
        return dir * a.number - dir * b.number;
      case 'title':
        return dir * a.title.localeCompare(b.title);
      case 'status':
        return dir * a.status.localeCompare(b.status);
      case 'priority':
        return dir * ((PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));
      case 'assignee':
        return dir * (a.assignee?.name || '').localeCompare(b.assignee?.name || '');
      case 'dueDate': {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dir * (da - db);
      }
      case 'estimate': {
        const ea = a.estimate ?? Infinity;
        const eb = b.estimate ?? Infinity;
        return dir * (ea - eb);
      }
      default:
        return 0;
    }
  });

  const handleStatusChange = useCallback(
    async (taskId: string, newStatus: string) => {
      try {
        await fetch(`/api/workspaces/${slug}/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        onRefresh();
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    },
    [slug, onRefresh],
  );

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ChevronsUpDown size={12} className="text-muted-foreground/50" />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead
              className="w-[100px] cursor-pointer select-none text-xs"
              onClick={() => handleSort('taskId')}
            >
              <span className="flex items-center gap-1">
                ID <SortIcon column="taskId" />
              </span>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none text-xs"
              onClick={() => handleSort('title')}
            >
              <span className="flex items-center gap-1">
                Title <SortIcon column="title" />
              </span>
            </TableHead>
            <TableHead
              className="w-[140px] cursor-pointer select-none text-xs"
              onClick={() => handleSort('status')}
            >
              <span className="flex items-center gap-1">
                Status <SortIcon column="status" />
              </span>
            </TableHead>
            <TableHead
              className="w-[100px] cursor-pointer select-none text-xs"
              onClick={() => handleSort('priority')}
            >
              <span className="flex items-center gap-1">
                Priority <SortIcon column="priority" />
              </span>
            </TableHead>
            <TableHead
              className="w-[120px] cursor-pointer select-none text-xs"
              onClick={() => handleSort('assignee')}
            >
              <span className="flex items-center gap-1">
                Assignee <SortIcon column="assignee" />
              </span>
            </TableHead>
            <TableHead
              className="w-[100px] cursor-pointer select-none text-xs"
              onClick={() => handleSort('dueDate')}
            >
              <span className="flex items-center gap-1">
                Due Date <SortIcon column="dueDate" />
              </span>
            </TableHead>
            <TableHead
              className="w-[80px] cursor-pointer select-none text-xs"
              onClick={() => handleSort('estimate')}
            >
              <span className="flex items-center gap-1">
                Estimate <SortIcon column="estimate" />
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => {
            const priority =
              PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
            const isOverdue =
              task.dueDate && new Date(task.dueDate) < new Date();
            const initials =
              task.assignee?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || '';

            return (
              <TableRow
                key={task.id}
                className="cursor-pointer"
                onClick={() => openTask(task.id)}
              >
                <TableCell>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] px-1.5"
                  >
                    {task.taskId}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {task.title}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={task.status}
                    onValueChange={(value) =>
                      handleStatusChange(task.id, value)
                    }
                  >
                    <SelectTrigger size="sm" className="h-7 text-xs w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: priority?.color }}
                    />
                    {priority?.label}
                  </span>
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar size="sm">
                        <AvatarImage
                          src={task.assignee.image || undefined}
                        />
                        <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs truncate max-w-[80px]">
                        {task.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.dueDate ? (
                    <span
                      className={cn(
                        'text-xs',
                        isOverdue ? 'text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.estimate != null ? (
                    <span className="text-xs text-muted-foreground">
                      {task.estimate}pt
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
