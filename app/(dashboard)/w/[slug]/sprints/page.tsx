'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Plus, Play, CheckCircle, Clock, Target, Loader2,
  Calendar, BarChart3, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  status: string;
  retroNotes: string | null;
  project: { id: string; name: string; key: string };
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  completedPoints: number;
  _count: { tasks: number };
}

interface Project {
  id: string;
  name: string;
  key: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  PLANNING: { color: '#6b7280', icon: Clock, label: 'Planning' },
  ACTIVE: { color: '#f59e0b', icon: Play, label: 'Active' },
  COMPLETED: { color: '#10b981', icon: CheckCircle, label: 'Completed' },
};

export default function SprintsPage() {
  const { slug } = useParams();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSprints = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}/sprints`);
    if (res.ok) setSprints(await res.json());
    setLoading(false);
  }, [slug]);

  const fetchProjects = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}/projects`);
    if (res.ok) setProjects(await res.json());
  }, [slug]);

  useEffect(() => { fetchSprints(); fetchProjects(); }, [fetchSprints, fetchProjects]);

  const handleCreate = async () => {
    if (!name || !projectId || !startDate || !endDate) return;
    setCreating(true);
    const res = await fetch(`/api/workspaces/${slug}/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, goal, projectId, startDate, endDate }),
    });
    setCreating(false);
    if (res.ok) {
      toast.success('Sprint created');
      setCreateOpen(false);
      setName(''); setGoal(''); setProjectId(''); setStartDate(''); setEndDate('');
      fetchSprints();
    }
  };

  const handleStatusChange = async (sprintId: string, status: string) => {
    const res = await fetch(`/api/workspaces/${slug}/sprints`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sprintId, status }),
    });
    if (res.ok) {
      toast.success(`Sprint ${status === 'ACTIVE' ? 'started' : status === 'COMPLETED' ? 'completed' : 'updated'}`);
      fetchSprints();
    }
  };

  const activeSprints = sprints.filter((s) => s.status === 'ACTIVE');
  const planningSprints = sprints.filter((s) => s.status === 'PLANNING');
  const completedSprints = sprints.filter((s) => s.status === 'COMPLETED');

  const daysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Sprints</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeSprints.length} active, {planningSprints.length} planning, {completedSprints.length} completed
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus size={14} /> New Sprint</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Sprint</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Sprint Name</Label>
                <Input placeholder="Sprint 1" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.key})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Goal (optional)</Label>
                <Textarea placeholder="Sprint goal..." value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} />
              </div>
              <Button className="w-full" disabled={!name || !projectId || !startDate || !endDate || creating} onClick={handleCreate}>
                {creating && <Loader2 size={14} className="animate-spin mr-2" />}
                Create Sprint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : sprints.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center py-12">
            <Zap size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No sprints yet. Create your first sprint!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Sprints */}
          {activeSprints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Active</h3>
              <div className="space-y-3">
                {activeSprints.map((sprint) => {
                  const progress = sprint.totalTasks > 0 ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100) : 0;
                  const days = daysRemaining(sprint.endDate);

                  return (
                    <Card key={sprint.id} className="border-amber-500/20">
                      <CardContent className="pt-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Play size={14} className="text-amber-400" />
                            <h4 className="font-semibold text-sm">{sprint.name}</h4>
                            <Badge variant="outline" className="text-[10px] font-mono">{sprint.project.key}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">{days}d left</Badge>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleStatusChange(sprint.id, 'COMPLETED')}>
                              <CheckCircle size={12} /> Complete
                            </Button>
                          </div>
                        </div>
                        {sprint.goal && <p className="text-xs text-muted-foreground">{sprint.goal}</p>}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{sprint.completedTasks}/{sprint.totalTasks} tasks</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar size={10} />{new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(sprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="flex items-center gap-1"><Target size={10} />{sprint.completedPoints}/{sprint.totalPoints} pts</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Planning Sprints */}
          {planningSprints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Planning</h3>
              <div className="space-y-2">
                {planningSprints.map((sprint) => (
                  <Card key={sprint.id}>
                    <CardContent className="pt-4 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        <h4 className="font-medium text-sm">{sprint.name}</h4>
                        <Badge variant="outline" className="text-[10px] font-mono">{sprint.project.key}</Badge>
                        <span className="text-xs text-muted-foreground">{sprint.totalTasks} tasks</span>
                      </div>
                      <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleStatusChange(sprint.id, 'ACTIVE')}>
                        <Play size={12} /> Start Sprint
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Sprints */}
          {completedSprints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Completed</h3>
              <div className="space-y-2">
                {completedSprints.map((sprint) => {
                  const progress = sprint.totalTasks > 0 ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100) : 0;
                  return (
                    <Card key={sprint.id} className="opacity-75">
                      <CardContent className="pt-4 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={14} className="text-emerald-400" />
                          <div>
                            <h4 className="font-medium text-sm">{sprint.name}</h4>
                            <span className="text-[10px] text-muted-foreground">
                              {sprint.completedTasks}/{sprint.totalTasks} tasks — {sprint.completedPoints} pts — {progress}%
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono">{sprint.project.key}</Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
