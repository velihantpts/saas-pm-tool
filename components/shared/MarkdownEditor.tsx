'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import {
  Bold, Italic, Heading, List, ListOrdered,
  Code, CodeSquare, Link, Eye, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  compact?: boolean;
}

interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
}

const FULL_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: 'Bold (Ctrl+B)', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic (Ctrl+I)', prefix: '_', suffix: '_' },
  { icon: Heading, label: 'Heading', prefix: '### ', suffix: '', block: true },
  { icon: List, label: 'Unordered List', prefix: '- ', suffix: '', block: true },
  { icon: ListOrdered, label: 'Ordered List', prefix: '1. ', suffix: '', block: true },
  { icon: Code, label: 'Inline Code', prefix: '`', suffix: '`' },
  { icon: CodeSquare, label: 'Code Block', prefix: '```\n', suffix: '\n```', block: true },
  { icon: Link, label: 'Link', prefix: '[', suffix: '](url)' },
];

const COMPACT_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: 'Bold (Ctrl+B)', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic (Ctrl+I)', prefix: '_', suffix: '_' },
  { icon: Code, label: 'Inline Code', prefix: '`', suffix: '`' },
  { icon: Link, label: 'Link', prefix: '[', suffix: '](url)' },
];

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write something... (Markdown supported)',
  rows = 6,
  compact = false,
}: MarkdownEditorProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const actions = compact ? COMPACT_ACTIONS : FULL_ACTIONS;

  const insertMarkdown = useCallback(
    (action: ToolbarAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.slice(start, end);
      const before = value.slice(0, start);
      const after = value.slice(end);

      let insertion: string;
      let cursorOffset: number;

      if (action.block && !selectedText) {
        // For block-level syntax, ensure we're on a new line
        const needsNewline = before.length > 0 && !before.endsWith('\n');
        const prefix = needsNewline ? '\n' + action.prefix : action.prefix;
        insertion = prefix + 'text' + action.suffix;
        cursorOffset = before.length + prefix.length;
        const newValue = before + insertion + after;
        onChange(newValue);
        // Select the placeholder text
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(cursorOffset, cursorOffset + 4);
        });
      } else if (selectedText) {
        insertion = action.prefix + selectedText + action.suffix;
        const newValue = before + insertion + after;
        onChange(newValue);
        cursorOffset = start + action.prefix.length;
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(cursorOffset, cursorOffset + selectedText.length);
        });
      } else {
        insertion = action.prefix + 'text' + action.suffix;
        const newValue = before + insertion + after;
        onChange(newValue);
        cursorOffset = start + action.prefix.length;
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(cursorOffset, cursorOffset + 4);
        });
      }
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') {
          e.preventDefault();
          const boldAction = actions.find((a) => a.icon === Bold);
          if (boldAction) insertMarkdown(boldAction);
        } else if (e.key === 'i') {
          e.preventDefault();
          const italicAction = actions.find((a) => a.icon === Italic);
          if (italicAction) insertMarkdown(italicAction);
        }
      }
    },
    [actions, insertMarkdown]
  );

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Tabs + Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-2 py-1">
        {/* Write / Preview tabs */}
        <div className="flex items-center gap-1">
          <Button
            variant={previewMode ? 'ghost' : 'secondary'}
            size="sm"
            className="h-7 text-xs gap-1 px-2"
            onClick={() => setPreviewMode(false)}
          >
            <Pencil size={12} />
            Write
          </Button>
          <Button
            variant={previewMode ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs gap-1 px-2"
            onClick={() => setPreviewMode(true)}
          >
            <Eye size={12} />
            Preview
          </Button>
        </div>

        {/* Toolbar buttons (only in write mode) */}
        {!previewMode && (
          <div className="flex items-center gap-0.5">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title={action.label}
                onClick={() => insertMarkdown(action)}
              >
                <action.icon size={14} />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Content area */}
      {previewMode ? (
        <div className="p-3 min-h-[120px]">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-y text-sm"
        />
      )}
    </div>
  );
}
