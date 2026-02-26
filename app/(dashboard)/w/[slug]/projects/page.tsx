'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, FolderKanban, Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  color: string;
  taskCount: number;
  isFavorite: boolean;
  createdAt: string;
}

export default function ProjectsPage() {
  const { slug } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    const res = await fetch(`/api/workspaces/${slug}/projects`);
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [slug]);

  const handleCreate = async () => {
    setCreating(true);
    const res = await fetch(`/api/workspaces/${slug}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, key, description }),
    });
    setCreating(false);
    if (res.ok) {
      setDialogOpen(false);
      setName('');
      setKey('');
      setDescription('');
      fetchProjects();
    }
  };

  const generateKey = (n: string) => n.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} projects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus size={14} /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Platform v2.0"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setKey(generateKey(e.target.value)); }}
                />
              </div>
              <div className="space-y-2">
                <Label>Key</Label>
                <Input
                  placeholder="PLT"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  maxLength={5}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={!name || !key || creating} onClick={handleCreate}>
                {creating && <Loader2 size={14} className="animate-spin mr-2" />}
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p.id} href={`/w/${slug}/projects/${p.key}/board`}>
              <Card className="hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${p.color}15`, color: p.color }}
                      >
                        <FolderKanban size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                        <p className="text-[10px] font-mono text-muted-foreground">{p.key}</p>
                      </div>
                    </div>
                    {p.isFavorite && <Star size={14} className="text-amber-400 fill-amber-400" />}
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.taskCount} tasks</span>
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
