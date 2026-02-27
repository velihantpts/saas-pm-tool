'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ViewSwitcher from '@/components/views/ViewSwitcher';
import FilterBar from '@/components/shared/FilterBar';
import KanbanView from '@/components/views/KanbanView';
import ListView from '@/components/views/ListView';
import CalendarView from '@/components/views/CalendarView';
import GanttView from '@/components/views/GanttView';
import type { BoardTask, BoardColumn, TaskFilters, WorkspaceMember, LabelItem } from '@/lib/types';

type ViewMode = 'kanban' | 'list' | 'calendar' | 'gantt';

export default function ProjectBoardPage() {
  const { slug, key } = useParams();
  const [activeView, setActiveView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`nf-project-view-${key}`) as ViewMode) || 'kanban';
    }
    return 'kanban';
  });
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [labels, setLabels] = useState<LabelItem[]>([]);

  const fetchBoard = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}/projects/${key}/columns`);
    if (res.ok) {
      const data = await res.json();
      setColumns(data);
    }
    setLoading(false);
  }, [slug, key]);

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);
    if (filters.labels?.length) params.set('labels', filters.labels.join(','));
    if (filters.dueDateFrom) params.set('dueDateFrom', filters.dueDateFrom);
    if (filters.dueDateTo) params.set('dueDateTo', filters.dueDateTo);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`/api/workspaces/${slug}/projects/${key}/tasks?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
  }, [slug, key, filters]);

  const fetchMeta = useCallback(async () => {
    const [membersRes, labelsRes] = await Promise.all([
      fetch(`/api/workspaces/${slug}/members`),
      fetch(`/api/workspaces/${slug}/labels`),
    ]);
    if (membersRes.ok) setMembers(await membersRes.json());
    if (labelsRes.ok) setLabels(await labelsRes.json());
  }, [slug]);

  useEffect(() => { fetchBoard(); fetchMeta(); }, [fetchBoard, fetchMeta]);
  useEffect(() => { if (activeView !== 'kanban') fetchTasks(); }, [activeView, fetchTasks]);

  const handleViewChange = (view: ViewMode) => {
    setActiveView(view);
    localStorage.setItem(`nf-project-view-${key}`, view);
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
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-mono text-primary">{key}</span> — Project Views
          </p>
        </div>
        <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />
      </div>

      {activeView !== 'kanban' && (
        <div className="mb-4">
          <FilterBar filters={filters} onChange={setFilters} members={members} labels={labels} />
        </div>
      )}

      {activeView === 'kanban' && (
        <KanbanView
          columns={columns}
          setColumns={setColumns as any}
          slug={slug as string}
          projectKey={key as string}
          onRefresh={fetchBoard}
        />
      )}

      {activeView === 'list' && (
        <ListView tasks={tasks} slug={slug as string} onRefresh={fetchTasks} />
      )}

      {activeView === 'calendar' && (
        <CalendarView tasks={tasks} slug={slug as string} />
      )}

      {activeView === 'gantt' && (
        <GanttView tasks={tasks} slug={slug as string} />
      )}
    </div>
  );
}
