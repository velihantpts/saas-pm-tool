'use client';

import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { BoardColumn } from '@/lib/types';

interface KanbanColumnProps {
  column: BoardColumn;
  taskCount: number;
  children: ReactNode;
}

export default function KanbanColumn({ column, taskCount, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const overWip = column.wipLimit && taskCount > column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-card/50 border border-border rounded-xl p-3 transition-colors',
        isOver && 'border-primary/40 bg-primary/5',
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: column.color }} />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {column.name}
          </h3>
          <span className={cn(
            'text-[10px] font-mono px-1.5 py-0.5 rounded',
            overWip ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
          )}>
            {taskCount}
            {column.wipLimit ? `/${column.wipLimit}` : ''}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
