'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckSquare, ArrowUpDown, Download, Search, Filter,
  Loader2, Calendar, Flag, Edit3, ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTaskDetail } from '@/store/use-store';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  taskId: string;
  title: string;
  number: number;
  status: string;
  priority: string;
  estimate: number | null;
  dueDate: string | null;
  createdAt: string;
  project: { key: string; color: string; name: string };
  assignee: { id: string; name: string | null; image: string | null } | null;
}

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt';
type SortDir = 'asc' | 'desc';

const statusOptions = ['ALL', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const priorityOptions = ['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];

const statusColors: Record<string, string> = {
  BACKLOG: '#6b7280', TODO: '#3b82f6', IN_PROGRESS: '#f59e0b',
  IN_REVIEW: '#8b5cf6', DONE: '#10b981', CANCELLED: '#ef4444',
};

export default function MyTasksPage() {
  const { slug } = useParams();
  const { openTask } = useTaskDetail();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams({ limit: '100' });
    if (search) params.set('search', search);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);

    const res = await fetch(`/api/workspaces/${slug}/tasks?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    }
    setLoading(false);
  }, [slug, search, statusFilter, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...tasks].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'title': return a.title.localeCompare(b.title) * dir;
      case 'status': return a.status.localeCompare(b.status) * dir;
      case 'priority': {
        const order = ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];
        return (order.indexOf(a.priority) - order.indexOf(b.priority)) * dir;
      }
      case 'dueDate': return ((a.dueDate || '').localeCompare(b.dueDate || '')) * dir;
      case 'createdAt': return a.createdAt.localeCompare(b.createdAt) * dir;
      default: return 0;
    }
  });

  // Inline edit
  const updateTask = async (taskId: string, field: string, value: unknown) => {
    const res = await fetch(`/api/workspaces/${slug}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      toast.success('Updated');
      fetchTasks();
    }
  };

  // CSV export
  const exportCSV = () => {
    const headers = ['Task ID', 'Title', 'Status', 'Priority', 'Due Date', 'Project', 'Assignee'];
    const rows = sorted.map((t) => [
      t.taskId, t.title, t.status, t.priority,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      t.project.name, t.assignee?.name || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && <ChevronDown size={12} className={cn('transition-transform', sortDir === 'asc' && 'rotate-180')} />}
      </div>
    </TableHead>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">{tasks.length} tasks</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportCSV}>
          <Download size={13} /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-9 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">{s === 'ALL' ? 'All Status' : s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            {priorityOptions.map((p) => (
              <SelectItem key={p} value={p} className="text-xs">{p === 'ALL' ? 'All Priority' : p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center py-12">
            <CheckSquare size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No tasks found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-xs">ID</TableHead>
                  <SortHeader field="title"><span className="text-xs">Title</span></SortHeader>
                  <SortHeader field="status"><span className="text-xs">Status</span></SortHeader>
                  <SortHeader field="priority"><span className="text-xs">Priority</span></SortHeader>
                  <SortHeader field="dueDate"><span className="text-xs">Due Date</span></SortHeader>
                  <TableHead className="text-xs">Assignee</TableHead>
                  <TableHead className="text-xs w-12">Est</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((task) => {
                  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

                  return (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => openTask(task.id)}
                    >
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]" style={{ borderColor: task.project.color, color: task.project.color }}>
                          {task.taskId}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm max-w-xs truncate">{task.title}</TableCell>
                      <TableCell>
                        <Select value={task.status} onValueChange={(v) => { updateTask(task.id, 'status', v); }}>
                          <SelectTrigger className="h-6 text-[10px] w-28 border-0 p-0" onClick={(e) => e.stopPropagation()}>
                            <Badge variant="secondary" className="text-[10px]" style={{ color: statusColors[task.status] }}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.filter((s) => s !== 'ALL').map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: priority?.color }} />
                          <span className="text-xs">{priority?.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <span className={cn('text-xs', isOverdue && 'text-destructive font-medium')}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={task.assignee.image || undefined} />
                              <AvatarFallback className="text-[8px]">{task.assignee.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs truncate max-w-[80px]">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{task.estimate || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
