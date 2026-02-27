'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Settings, User, Bell, Palette, Loader2, Save,
  Trash2, Monitor, Moon, Sun, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTheme } from '@/providers/ThemeProvider';
import { ACCENT_COLORS, type AccentColor } from '@/lib/constants';

export default function SettingsPage() {
  const { slug } = useParams();
  const { theme, accentColor, setThemeMode, setAccentColor } = useTheme();

  // Workspace settings
  const [workspace, setWorkspace] = useState<{
    id: string; name: string; slug: string; logo: string | null; plan: string;
    _count: { members: number; projects: number };
  } | null>(null);
  const [wsName, setWsName] = useState('');
  const [saving, setSaving] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState<{
    id: string; name: string | null; email: string; image: string | null;
    timezone: string; theme: string; lang: string; accentColor: string;
    emailNotifications: boolean; notifyTaskAssigned: boolean;
    notifyMentioned: boolean; notifySprintStart: boolean;
  } | null>(null);
  const [profileName, setProfileName] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  // Notification prefs
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [taskAssigned, setTaskAssigned] = useState(true);
  const [taskCommented, setTaskCommented] = useState(true);
  const [sprintStarted, setSprintStarted] = useState(true);

  const fetchWorkspace = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}/settings`);
    if (res.ok) {
      const data = await res.json();
      setWorkspace(data);
      setWsName(data.name);
    }
  }, [slug]);

  const fetchProfile = useCallback(async () => {
    const res = await fetch('/api/user/profile');
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setProfileName(data.name || '');
      setTimezone(data.timezone);
      setEmailNotifs(data.emailNotifications ?? true);
      setTaskAssigned(data.notifyTaskAssigned ?? true);
      setTaskCommented(data.notifyMentioned ?? true);
      setSprintStarted(data.notifySprintStart ?? true);
    }
  }, []);

  useEffect(() => { fetchWorkspace(); fetchProfile(); }, [fetchWorkspace, fetchProfile]);

  const saveWorkspace = async () => {
    setSaving(true);
    const res = await fetch(`/api/workspaces/${slug}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: wsName }),
    });
    setSaving(false);
    if (res.ok) toast.success('Workspace updated');
  };

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profileName, timezone }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Profile updated');
      fetchProfile();
    }
  };

  const saveNotificationPrefs = async () => {
    setSaving(true);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailNotifications: emailNotifs,
        notifyTaskAssigned: taskAssigned,
        notifyMentioned: taskCommented,
        notifySprintStart: sprintStarted,
      }),
    });
    setSaving(false);
    if (res.ok) toast.success('Preferences saved');
  };

  const handleAccentChange = (color: AccentColor) => {
    setAccentColor(color);
    fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accentColor: color }),
    });
  };

  const initials = profile?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage workspace and profile settings</p>
      </div>

      <Tabs defaultValue="workspace">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workspace" className="text-xs gap-1"><Settings size={12} />Workspace</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs gap-1"><User size={12} />Profile</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1"><Palette size={12} />Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1"><Bell size={12} />Notifications</TabsTrigger>
        </TabsList>

        {/* Workspace Tab */}
        <TabsContent value="workspace" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">General</CardTitle>
              <CardDescription className="text-xs">Manage workspace details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Workspace Name</Label>
                <Input value={wsName} onChange={(e) => setWsName(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Slug</Label>
                <Input value={workspace?.slug || ''} disabled className="text-sm font-mono" />
                <p className="text-[10px] text-muted-foreground">URL: nexusflow.app/w/{workspace?.slug}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Plan</Label>
                  <p className="text-sm font-medium mt-0.5">
                    <Badge variant={workspace?.plan === 'FREE' ? 'secondary' : 'default'}>
                      {workspace?.plan || 'FREE'}
                    </Badge>
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{workspace?._count.members} members</p>
                  <p>{workspace?._count.projects} projects</p>
                </div>
              </div>
              <Button size="sm" onClick={saveWorkspace} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-sm text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Deleting a workspace is permanent and cannot be undone.</p>
              <Button variant="destructive" size="sm" className="gap-1.5">
                <Trash2 size={12} /> Delete Workspace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Profile</CardTitle>
              <CardDescription className="text-xs">Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.image || undefined} />
                  <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Display Name</Label>
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input value={profile?.email || ''} disabled className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Istanbul', 'Asia/Tokyo', 'Asia/Shanghai'].map((tz) => (
                      <SelectItem key={tz} value={tz} className="text-sm">{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={saveProfile} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Theme</CardTitle>
              <CardDescription className="text-xs">Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => setThemeMode('dark')}
                >
                  <div className="w-full h-16 rounded bg-[#0a0a0f] mb-2 flex items-center justify-center">
                    <Moon size={20} className="text-indigo-400" />
                  </div>
                  <p className="text-xs font-medium">Dark</p>
                  <p className="text-[10px] text-muted-foreground">Easy on the eyes</p>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => setThemeMode('light')}
                >
                  <div className="w-full h-16 rounded bg-gray-100 mb-2 flex items-center justify-center">
                    <Sun size={20} className="text-amber-500" />
                  </div>
                  <p className="text-xs font-medium">Light</p>
                  <p className="text-[10px] text-muted-foreground">Classic and clean</p>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => setThemeMode('system')}
                >
                  <div className="w-full h-16 rounded bg-gradient-to-r from-[#0a0a0f] to-gray-100 mb-2 flex items-center justify-center">
                    <Monitor size={20} className="text-gray-400" />
                  </div>
                  <p className="text-xs font-medium">System</p>
                  <p className="text-[10px] text-muted-foreground">Follow OS setting</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold">Accent Color</Label>
                <p className="text-[10px] text-muted-foreground mb-3">Choose the primary color for the interface</p>
                <div className="flex gap-3">
                  {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleAccentChange(key)}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                          accentColor === key ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: config.preview }}
                      >
                        {accentColor === key && <Check size={16} className="text-white" />}
                      </div>
                      <span className={`text-[10px] ${accentColor === key ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {config.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notification Preferences</CardTitle>
              <CardDescription className="text-xs">Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <Separator />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Events</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Task assigned to me</p>
                  <Switch checked={taskAssigned} onCheckedChange={setTaskAssigned} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Mentioned in a comment</p>
                  <Switch checked={taskCommented} onCheckedChange={setTaskCommented} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Sprint started / completed</p>
                  <Switch checked={sprintStarted} onCheckedChange={setSprintStarted} />
                </div>
              </div>
              <Button size="sm" className="gap-1.5" onClick={saveNotificationPrefs} disabled={saving}>
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
