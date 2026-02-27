'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string | null;
  priority: string;
  estimate: number | null;
  labelIds: string[];
  createdAt: string;
}

interface TemplateManagerProps {
  slug: string;
  projectId?: string;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  priority: 'MEDIUM',
  estimate: '',
};

export default function TemplateManager({ slug, projectId }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchTemplates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (projectId) params.set('projectId', projectId);
      const res = await fetch(
        `/api/workspaces/${slug}/templates?${params.toString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [slug, projectId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        estimate: form.estimate ? Number(form.estimate) : null,
        projectId: projectId || null,
      };

      const res = await fetch(`/api/workspaces/${slug}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Template created');
        setCreateOpen(false);
        resetForm();
        fetchTemplates();
      } else {
        toast.error('Failed to create template');
      }
    } catch {
      toast.error('Failed to create template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        estimate: form.estimate ? Number(form.estimate) : null,
      };

      const res = await fetch(`/api/workspaces/${slug}/templates/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Template updated');
        setEditingId(null);
        resetForm();
        fetchTemplates();
      } else {
        toast.error('Failed to update template');
      }
    } catch {
      toast.error('Failed to update template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Delete template "${templateName}"?`)) return;

    try {
      const res = await fetch(
        `/api/workspaces/${slug}/templates/${templateId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        toast.success('Template deleted');
      } else {
        toast.error('Failed to delete template');
      }
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const openEdit = (template: Template) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      description: template.description || '',
      priority: template.priority,
      estimate: template.estimate?.toString() || '',
    });
  };

  const TemplateForm = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Name *</label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Template name"
          className="h-9 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Description</label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Template description (optional)"
          rows={3}
          className="text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Priority</label>
          <Select
            value={form.priority}
            onValueChange={(v) => setForm({ ...form, priority: v })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: cfg.color }}
                    />
                    {cfg.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Estimate</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={form.estimate}
            onChange={(e) => setForm({ ...form, estimate: e.target.value })}
            placeholder="Story points"
            className="h-9 text-xs"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Bookmark size={14} className="text-muted-foreground" />
          <span>Task Templates</span>
        </div>
        <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus size={12} />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            {TemplateForm}
            <DialogFooter>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCreateOpen(false); resetForm(); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={submitting || !form.name.trim()}
              >
                {submitting && <Loader2 size={12} className="animate-spin mr-1" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      ) : templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((template) => {
            const priorityCfg =
              PRIORITY_CONFIG[template.priority as keyof typeof PRIORITY_CONFIG];
            const isEditing = editingId === template.id;

            if (isEditing) {
              return (
                <Card key={template.id} className="py-4">
                  <CardContent className="space-y-4">
                    {TemplateForm}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleUpdate}
                        disabled={submitting || !form.name.trim()}
                      >
                        {submitting && (
                          <Loader2 size={12} className="animate-spin mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={template.id} className="py-3 group">
                <CardContent className="flex items-start gap-3">
                  <Bookmark
                    size={16}
                    className="text-muted-foreground shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {template.name}
                      </span>
                      {priorityCfg && (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 shrink-0"
                          style={{
                            borderColor: priorityCfg.color,
                            color: priorityCfg.color,
                          }}
                        >
                          {priorityCfg.label}
                        </Badge>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    {template.estimate && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Estimate: {template.estimate} points
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEdit(template)}
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(template.id, template.name)}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <Bookmark size={24} className="mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No templates yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Create templates to quickly set up common task types
          </p>
        </div>
      )}
    </div>
  );
}
