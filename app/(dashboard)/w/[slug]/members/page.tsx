'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Crown, Eye, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string | null; email: string | null; image: string | null; createdAt: string };
}

const roleConfig: Record<string, { icon: typeof Users; color: string; label: string }> = {
  OWNER: { icon: Crown, color: '#f59e0b', label: 'Owner' },
  ADMIN: { icon: Shield, color: '#8b5cf6', label: 'Admin' },
  MEMBER: { icon: Users, color: '#3b82f6', label: 'Member' },
  VIEWER: { icon: Eye, color: '#6b7280', label: 'Viewer' },
};

export default function MembersPage() {
  const { slug } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}/members`);
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    const res = await fetch(`/api/workspaces/${slug}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setInviting(false);
    if (res.ok) {
      const data = await res.json();
      toast.success(data.pending ? 'Invitation sent' : 'Member added');
      setInviteEmail('');
      setInviteOpen(false);
      fetchMembers();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to invite');
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    const res = await fetch(`/api/workspaces/${slug}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role }),
    });
    if (res.ok) {
      toast.success('Role updated');
      fetchMembers();
    }
  };

  const handleRemove = async (memberId: string) => {
    const res = await fetch(`/api/workspaces/${slug}/members?memberId=${memberId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Member removed');
      fetchMembers();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">{members.length} team members</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <UserPlus size={14} /> Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="teammate@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" disabled={!inviteEmail || inviting} onClick={handleInvite}>
                {inviting && <Loader2 size={14} className="animate-spin mr-2" />}
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <AnimatePresence>
                {members.map((member, i) => {
                  const config = roleConfig[member.role] || roleConfig.MEMBER;
                  const RoleIcon = config.icon;
                  const initials = member.user.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{member.user.name || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                      <Badge variant="outline" className="gap-1 text-xs" style={{ borderColor: config.color, color: config.color }}>
                        <RoleIcon size={10} />
                        {config.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground hidden sm:block">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                      {member.role !== 'OWNER' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={14} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'ADMIN')}>Make Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'MEMBER')}>Make Member</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'VIEWER')}>Make Viewer</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(member.id)}>
                              <Trash2 size={12} className="mr-2" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
