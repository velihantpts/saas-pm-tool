'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  name: string | null;
  image: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  members: Member[];
  placeholder?: string;
  rows?: number;
  onSubmit?: () => void;
}

export default function MentionInput({
  value,
  onChange,
  members,
  placeholder = 'Write a comment...',
  rows = 3,
  onSubmit,
}: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredMembers = members.filter((m) =>
    m.name?.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const updateDropdownPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { offsetTop, offsetHeight } = textarea;
    setDropdownPosition({
      top: offsetTop + offsetHeight + 4,
      left: 0,
    });
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart;
      onChange(newValue);

      // Check if we're in a mention context
      const textBeforeCursor = newValue.slice(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');

      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show dropdown if there's no space before @ (or @ is at start) and text after @ has no newlines
        const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : ' ';
        const isValidMentionStart = charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0;

        if (isValidMentionStart && !/\n/.test(textAfterAt)) {
          setMentionQuery(textAfterAt);
          setMentionStartPos(lastAtIndex);
          setShowMentions(true);
          setSelectedIndex(0);
          updateDropdownPosition();
          return;
        }
      }

      setShowMentions(false);
      setMentionStartPos(null);
    },
    [onChange, updateDropdownPosition]
  );

  const selectMember = useCallback(
    (member: Member) => {
      if (mentionStartPos === null || !textareaRef.current) return;

      const cursorPos = textareaRef.current.selectionStart;
      const before = value.slice(0, mentionStartPos);
      const after = value.slice(cursorPos);
      const memberName = member.name || 'Unknown';
      const newValue = `${before}@${memberName} ${after}`;

      onChange(newValue);
      setShowMentions(false);
      setMentionQuery('');
      setMentionStartPos(null);

      // Restore focus and cursor position
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          const newCursorPos = mentionStartPos + memberName.length + 2; // +2 for @ and space
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    },
    [mentionStartPos, value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd/Ctrl+Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit?.();
        return;
      }

      if (!showMentions || filteredMembers.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
          break;
        case 'Enter':
          e.preventDefault();
          selectMember(filteredMembers[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setShowMentions(false);
          setMentionStartPos(null);
          break;
        case 'Tab':
          e.preventDefault();
          selectMember(filteredMembers[selectedIndex]);
          break;
      }
    },
    [showMentions, filteredMembers, selectedIndex, selectMember, onSubmit]
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowMentions(false);
        setMentionStartPos(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when filtered members change
  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionQuery]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none'
        )}
      />

      {showMentions && filteredMembers.length > 0 && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 w-64 max-h-48 overflow-y-auto',
            'rounded-md border border-border bg-popover p-1 shadow-md',
            'animate-in fade-in-0 zoom-in-95'
          )}
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          {filteredMembers.map((member, index) => (
            <button
              key={member.id}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer',
                'transition-colors',
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              )}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent textarea blur
                selectMember(member);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={member.image || undefined} alt={member.name || ''} />
                <AvatarFallback className="text-[10px]">
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{member.name || 'Unknown'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
