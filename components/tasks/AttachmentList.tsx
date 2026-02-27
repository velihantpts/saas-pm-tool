'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Paperclip, Upload, FileImage, FileText, File,
  Download, Trash2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface AttachmentListProps {
  taskId: string;
  slug: string;
  attachmentCount: number;
  onCountChange?: (count: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return FileImage;
  if (
    fileType === 'application/pdf' ||
    fileType.includes('document') ||
    fileType.includes('text')
  )
    return FileText;
  return File;
}

function isImageType(fileType: string): boolean {
  return fileType.startsWith('image/');
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function AttachmentList({
  taskId,
  slug,
  attachmentCount,
  onCountChange,
}: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/workspaces/${slug}/tasks/${taskId}/attachments`
      );
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [slug, taskId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Validate file sizes
    const oversized = fileArray.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      toast.error(
        `${oversized.map((f) => f.name).join(', ')} exceed${oversized.length === 1 ? 's' : ''} the 10MB limit`
      );
      return;
    }

    setUploading(true);

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(
          `/api/workspaces/${slug}/tasks/${taskId}/attachments`,
          {
            method: 'POST',
            body: formData,
          }
        );
        if (res.ok) {
          toast.success(`${file.name} uploaded`);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    await fetchAttachments();
    onCountChange?.(attachmentCount + fileArray.length);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDelete = async (attachmentId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return;

    try {
      const res = await fetch(
        `/api/workspaces/${slug}/tasks/${taskId}/attachments/${attachmentId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
        onCountChange?.(Math.max(0, attachmentCount - 1));
        toast.success('Attachment deleted');
      }
    } catch {
      toast.error('Failed to delete attachment');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <Paperclip size={14} className="text-muted-foreground" />
        <span>Attachments</span>
        {attachments.length > 0 && (
          <span className="text-xs text-muted-foreground">
            ({attachments.length})
          </span>
        )}
      </div>

      <Separator />

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Upload size={20} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Drop files here or click to browse
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              Max file size: 10MB
            </p>
          </div>
        )}
      </div>

      {/* Attachment List */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.fileType);
            const isImage = isImageType(attachment.fileType);

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                {/* Thumbnail or icon */}
                {isImage ? (
                  <div className="h-10 w-10 rounded border border-border overflow-hidden shrink-0">
                    <img
                      src={attachment.url}
                      alt={attachment.fileName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded bg-muted/50 flex items-center justify-center shrink-0">
                    <FileIcon size={18} className="text-muted-foreground" />
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(attachment.fileSize)} &middot;{' '}
                    {new Date(attachment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a
                      href={attachment.url}
                      download={attachment.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download"
                    >
                      <Download size={12} />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      handleDelete(attachment.id, attachment.fileName)
                    }
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          No attachments yet
        </p>
      )}
    </div>
  );
}
