'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import KanbanColumn from '@/components/board/KanbanColumn';
import KanbanCard from '@/components/board/KanbanCard';

export interface BoardTask {
  id: string;
  taskId: string;
  title: string;
  number: number;
  status: string;
  priority: string;
  position: number;
  dueDate: string | null;
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

export default function KanbanBoardPage() {
  const { slug, key } = useParams();
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [quickAddCol, setQuickAddCol] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchBoard = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}/projects/${key}/columns`);
    if (res.ok) setColumns(await res.json());
    setLoading(false);
  }, [slug, key]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
    const sourceCol = columns.find((c) => c.tasks.some((t) => t.id === activeId));
    let destCol = columns.find((c) => c.tasks.some((t) => t.id === overId));

    // If dropped on column header (not a task)
    if (!destCol) {
      destCol = columns.find((c) => c.id === overId);
    }

    if (!sourceCol || !destCol || sourceCol.id === destCol.id) return;

    setColumns((prev) => {
      const newCols = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const srcIdx = newCols.findIndex((c) => c.id === sourceCol.id);
      const dstIdx = newCols.findIndex((c) => c.id === destCol!.id);
      const taskIdx = newCols[srcIdx].tasks.findIndex((t) => t.id === activeId);
      const [task] = newCols[srcIdx].tasks.splice(taskIdx, 1);
      task.columnId = destCol!.id;
      newCols[dstIdx].tasks.push(task);
      return newCols;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;
    setActiveTask(null);

    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === active.id);
    if (!task) return;

    // Update task on server
    try {
      await fetch(`/api/workspaces/${slug}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: task.columnId }),
      });
    } catch {
      toast.error('Failed to move task');
      fetchBoard();
    }
  };

  const handleQuickAdd = async (columnId: string) => {
    if (!quickAddTitle.trim()) return;
    setCreating(true);

    // Find project ID from the first task or make a separate call
    const res = await fetch(`/api/workspaces/${slug}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: quickAddTitle.trim(),
        projectId: columns[0]?.tasks[0]?.id ? undefined : undefined,
        columnId,
      }),
    });

    setCreating(false);
    if (res.ok) {
      setQuickAddTitle('');
      setQuickAddCol(null);
      fetchBoard();
      toast.success('Task created');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-72 shrink-0">
              <Skeleton className="h-10 w-full mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-mono text-primary">{key}</span> — Kanban Board
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="w-72 shrink-0">
              <KanbanColumn column={column} taskCount={column.tasks.length}>
                <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 min-h-[100px]">
                    {column.tasks.map((task) => (
                      <KanbanCard key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>

                {/* Quick add */}
                {quickAddCol === column.id ? (
                  <div className="mt-2 space-y-2">
                    <Input
                      autoFocus
                      placeholder="Task title..."
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAdd(column.id);
                        if (e.key === 'Escape') { setQuickAddCol(null); setQuickAddTitle(''); }
                      }}
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 text-xs flex-1" onClick={() => handleQuickAdd(column.id)} disabled={creating}>
                        {creating && <Loader2 size={12} className="animate-spin mr-1" />}
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setQuickAddCol(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-8 text-xs text-muted-foreground justify-start gap-1.5"
                    onClick={() => setQuickAddCol(column.id)}
                  >
                    <Plus size={12} /> Add task
                  </Button>
                )}
              </KanbanColumn>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
