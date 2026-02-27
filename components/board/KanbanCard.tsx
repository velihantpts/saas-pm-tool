'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, GitBranch, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTaskDetail } from '@/store/use-store';
import type { BoardTask } from '@/lib/types';

interface KanbanCardProps {
  task: BoardTask;
  isDragOverlay?: boolean;
}

export default function KanbanCard({ task, isDragOverlay }: KanbanCardProps) {
  const { openTask } = useTaskDetail();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
  const initials = task.assignee?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '';

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:border-border/80 hover:shadow-sm',
        isDragging && 'opacity-50 rotate-1',
        isDragOverlay && 'shadow-xl rotate-2 border-primary/30',
      )}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map(({ label }) => (
            <span
              key={label.id}
              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: `${label.color}20`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p
        className="text-sm font-medium text-foreground leading-snug mb-2 cursor-pointer hover:text-primary transition-colors"
        onClick={(e) => { e.stopPropagation(); openTask(task.id); }}
      >
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Task ID */}
          <span className="text-[10px] font-mono text-muted-foreground">{task.taskId}</span>
          {/* Priority dot */}
          {task.priority !== 'NONE' && (
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: priority?.color }}
              title={priority?.label}
            />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Due date */}
          {task.dueDate && (
            <span className={cn(
              'text-[10px] flex items-center gap-0.5',
              isOverdue ? 'text-destructive' : 'text-muted-foreground',
            )}>
              <Calendar size={9} />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {/* Subtasks */}
          {task.subtaskCount > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <GitBranch size={9} />{task.subtaskCount}
            </span>
          )}
          {/* Comments */}
          {task.commentCount > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MessageSquare size={9} />{task.commentCount}
            </span>
          )}
          {/* Assignee */}
          {task.assignee && (
            <Avatar className="h-5 w-5">
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
