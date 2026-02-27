'use client';

import { useState } from 'react';
import { Filter, X, Calendar, Tag, UserCircle, Flag, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PRIORITY_CONFIG } from '@/lib/constants';
import type { TaskFilters, WorkspaceMember, LabelItem } from '@/lib/types';

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  members?: WorkspaceMember[];
  labels?: LabelItem[];
}

export default function FilterBar({ filters, onChange, members = [], labels = [] }: FilterBarProps) {
  const activeCount = [
    filters.labels?.length ? 1 : 0,
    filters.assigneeId ? 1 : 0,
    filters.priority ? 1 : 0,
    filters.status ? 1 : 0,
    filters.dueDateFrom || filters.dueDateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAll = () => onChange({});

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Filter size={12} />
        <span>Filters</span>
        {activeCount > 0 && (
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{activeCount}</Badge>
        )}
      </div>

      {/* Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={filters.status ? 'default' : 'outline'} size="sm" className="h-7 text-[11px] gap-1">
            <Circle size={10} />
            {filters.status ? STATUS_OPTIONS.find(s => s.value === filters.status)?.label : 'Status'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-2" align="start">
          <div className="space-y-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors ${filters.status === s.value ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => onChange({ ...filters, status: filters.status === s.value ? undefined : s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={filters.priority ? 'default' : 'outline'} size="sm" className="h-7 text-[11px] gap-1">
            <Flag size={10} />
            {filters.priority ? PRIORITY_CONFIG[filters.priority as keyof typeof PRIORITY_CONFIG]?.label : 'Priority'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2" align="start">
          <div className="space-y-1">
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors flex items-center gap-2 ${filters.priority === key ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => onChange({ ...filters, priority: filters.priority === key ? undefined : key })}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Assignee Filter */}
      {members.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={filters.assigneeId ? 'default' : 'outline'} size="sm" className="h-7 text-[11px] gap-1">
              <UserCircle size={10} />
              {filters.assigneeId ? members.find(m => m.user.id === filters.assigneeId)?.user.name || 'Assignee' : 'Assignee'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {members.map((m) => (
                <button
                  key={m.user.id}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors ${filters.assigneeId === m.user.id ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => onChange({ ...filters, assigneeId: filters.assigneeId === m.user.id ? undefined : m.user.id })}
                >
                  {m.user.name || m.user.email}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Labels Filter */}
      {labels.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={filters.labels?.length ? 'default' : 'outline'} size="sm" className="h-7 text-[11px] gap-1">
              <Tag size={10} />
              Labels {filters.labels?.length ? `(${filters.labels.length})` : ''}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {labels.map((l) => (
                <label key={l.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted cursor-pointer">
                  <Checkbox
                    checked={filters.labels?.includes(l.id) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.labels || [];
                      const next = checked ? [...current, l.id] : current.filter(id => id !== l.id);
                      onChange({ ...filters, labels: next.length ? next : undefined });
                    }}
                  />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.name}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={filters.dueDateFrom || filters.dueDateTo ? 'default' : 'outline'} size="sm" className="h-7 text-[11px] gap-1">
            <Calendar size={10} />
            Due Date
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-muted-foreground">From</label>
              <Input
                type="date"
                className="text-xs h-8"
                value={filters.dueDateFrom || ''}
                onChange={(e) => onChange({ ...filters, dueDateFrom: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">To</label>
              <Input
                type="date"
                className="text-xs h-8"
                value={filters.dueDateTo || ''}
                onChange={(e) => onChange({ ...filters, dueDateTo: e.target.value || undefined })}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear All */}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground" onClick={clearAll}>
          <X size={10} /> Clear
        </Button>
      )}
    </div>
  );
}
