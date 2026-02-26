'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, User, Tag, Flag, Clock, MessageSquare,
  GitBranch, Activity, Loader2, CheckSquare, Edit3, Trash2,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useTaskDetail } from '@/store/use-store';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';

interface TaskDetail {
  id: string;
  taskId: string;
  title: string;
  description: string | null;
  number: number;
  status: string;
  priority: string;
  estimate: number | null;
  dueDate: string | null;
  startDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: { id: string; name: string | null; image: string | null; email: string | null } | null;
  creator: { id: string; name: string | null; image: string | null } | null;
  project: { key: string; color: string; name: string };
  column: { id: string; name: string } | null;
  sprint: { id: string; name: string } | null;
  labels: { label: { id: string; name: string; color: string } }[];
  children: { id: string; title: string; status: string; assignee: { id: string; name: string | null; image: string | null } | null }[];
  comments: { id: string; content: string; createdAt: string; author: { id: string; name: string | null; image: string | null } }[];
  _count: { children: number; comments: number; attachments: number };
}

export default function TaskDetailModal() {
  const { slug } = useParams();
  const { taskId, open, close } = useTaskDetail();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    const res = await fetch(`/api/workspaces/${slug}/tasks/${taskId}`);
    if (res.ok) {
      const data = await res.json();
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
    }
    setLoading(false);
  }, [taskId, slug]);

  useEffect(() => {
    if (open && taskId) fetchTask();
  }, [open, taskId, fetchTask]);

  const updateField = async (field: string, value: unknown) => {
    if (!task) return;
    const res = await fetch(`/api/workspaces/${slug}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      fetchTask();
      toast.success('Task updated');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !task) return;
    setSubmittingComment(true);
    const res = await fetch(`/api/workspaces/${slug}/tasks/${task.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText }),
    });
    setSubmittingComment(false);
    if (res.ok) {
      setCommentText('');
      fetchTask();
    }
  };

  const statusOptions = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];
  const priorityOptions = ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && close()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {loading || !task ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs" style={{ borderColor: task.project.color, color: task.project.color }}>
                    {task.taskId}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">{task.column?.name || task.status}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={close}>
                  <X size={14} />
                </Button>
              </div>
              <div className="mt-2">
                {editingTitle ? (
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => { updateField('title', title); setEditingTitle(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateField('title', title); setEditingTitle(false); } }}
                    autoFocus
                    className="text-lg font-bold"
                  />
                ) : (
                  <SheetTitle
                    className="text-lg font-bold cursor-pointer hover:text-primary transition-colors text-left"
                    onClick={() => setEditingTitle(true)}
                  >
                    {task.title}
                  </SheetTitle>
                )}
              </div>
            </SheetHeader>

            {/* Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckSquare size={12} />Status</label>
                  <Select value={task.status} onValueChange={(v) => updateField('status', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Flag size={12} />Priority</label>
                  <Select value={task.priority} onValueChange={(v) => updateField('priority', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_CONFIG[p as keyof typeof PRIORITY_CONFIG]?.color }} />
                            {PRIORITY_CONFIG[p as keyof typeof PRIORITY_CONFIG]?.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5"><User size={12} />Assignee</label>
                  <div className="flex items-center gap-2 h-8">
                    {task.assignee ? (
                      <>
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={task.assignee.image || undefined} />
                          <AvatarFallback className="text-[8px]">{task.assignee.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{task.assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Estimate */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock size={12} />Estimate</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={task.estimate || ''}
                    onChange={(e) => updateField('estimate', e.target.value ? Number(e.target.value) : null)}
                    placeholder="Story points"
                    className="h-8 text-xs"
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar size={12} />Due Date</label>
                  <Input
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateField('dueDate', e.target.value || null)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Sprint */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Activity size={12} />Sprint</label>
                  <div className="h-8 flex items-center">
                    <span className="text-xs">{task.sprint?.name || 'No sprint'}</span>
                  </div>
                </div>
              </div>

              {/* Labels */}
              {task.labels.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Tag size={12} />Labels</label>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map(({ label }) => (
                      <Badge key={label.id} variant="outline" className="text-xs" style={{ borderColor: label.color, color: label.color, background: `${label.color}10` }}>
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Tabs: Description, Comments, Subtasks, Activity */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="description" className="text-xs gap-1"><Edit3 size={12} />Description</TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs gap-1"><MessageSquare size={12} />{task._count.comments}</TabsTrigger>
                  <TabsTrigger value="subtasks" className="text-xs gap-1"><GitBranch size={12} />{task._count.children}</TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs gap-1"><Activity size={12} />Log</TabsTrigger>
                </TabsList>

                {/* Description Tab */}
                <TabsContent value="description" className="mt-4">
                  {editingDesc ? (
                    <div className="space-y-2">
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={8}
                        placeholder="Add a description... (Markdown supported)"
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { updateField('description', description); setEditingDesc(false); }}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingDesc(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="text-sm text-muted-foreground whitespace-pre-wrap cursor-pointer hover:bg-muted/30 rounded-lg p-3 min-h-[100px] transition-colors"
                      onClick={() => setEditingDesc(true)}
                    >
                      {task.description || 'Click to add a description...'}
                    </div>
                  )}
                </TabsContent>

                {/* Comments Tab */}
                <TabsContent value="comments" className="mt-4 space-y-4">
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    <AnimatePresence>
                      {task.comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage src={comment.author.image || undefined} />
                            <AvatarFallback className="text-[9px]">{comment.author.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{comment.author.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {task.comments.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6">No comments yet</p>
                    )}
                  </div>

                  {/* Add comment */}
                  <div className="flex gap-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      rows={2}
                      className="text-sm flex-1"
                      onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleAddComment(); }}
                    />
                  </div>
                  <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim() || submittingComment} className="gap-1.5">
                    {submittingComment && <Loader2 size={12} className="animate-spin" />}
                    Comment
                  </Button>
                </TabsContent>

                {/* Subtasks Tab */}
                <TabsContent value="subtasks" className="mt-4 space-y-2">
                  {task.children.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${sub.status === 'DONE' ? 'bg-primary border-primary' : 'border-border'}`}>
                        {sub.status === 'DONE' && <CheckSquare size={10} className="text-primary-foreground" />}
                      </div>
                      <span className={`text-sm flex-1 ${sub.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>{sub.title}</span>
                      {sub.assignee && (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={sub.assignee.image || undefined} />
                          <AvatarFallback className="text-[8px]">{sub.assignee.name?.[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {task.children.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">No subtasks</p>
                  )}
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="mt-4 space-y-3">
                  <div className="space-y-3">
                    <div className="flex gap-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Activity size={10} className="text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">{task.creator?.name}</span>{' '}
                        <span className="text-muted-foreground">created this task</span>
                        <p className="text-muted-foreground mt-0.5">
                          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Metadata */}
              <Separator />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
