'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bookmark, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PRIORITY_CONFIG } from '@/lib/constants';

interface Template {
  id: string;
  name: string;
  description: string | null;
  priority: string;
  estimate: number | null;
  labelIds: string[];
}

interface TemplateSelectorProps {
  slug: string;
  projectId?: string;
  onSelect: (template: {
    name: string;
    description?: string;
    priority: string;
    estimate?: number;
    labelIds: string[];
  }) => void;
}

export default function TemplateSelector({
  slug,
  projectId,
  onSelect,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
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
    if (open) {
      fetchTemplates();
    }
  }, [open, fetchTemplates]);

  const handleSelect = (template: Template) => {
    onSelect({
      name: template.name,
      description: template.description || undefined,
      priority: template.priority,
      estimate: template.estimate || undefined,
      labelIds: template.labelIds,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Bookmark size={12} />
          From Template
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          </div>
        ) : templates.length > 0 ? (
          <div className="space-y-1">
            {templates.map((template) => {
              const priorityCfg =
                PRIORITY_CONFIG[
                  template.priority as keyof typeof PRIORITY_CONFIG
                ];
              return (
                <button
                  key={template.id}
                  className="w-full text-left px-2.5 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={() => handleSelect(template)}
                >
                  <FileText
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {template.name}
                    </p>
                  </div>
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
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bookmark
              size={20}
              className="mx-auto text-muted-foreground/50 mb-2"
            />
            <p className="text-xs text-muted-foreground">No templates yet</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
