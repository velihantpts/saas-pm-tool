'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Layers, ArrowRight, CheckSquare, FolderKanban, BarChart3,
  Users, Zap, Sparkles, Shield, Globe, Keyboard, Bell,
  MessageSquare, Activity, Moon, Sun, GitBranch, Search,
  LogIn, Copy, Check, CalendarDays, Timer, Palette, GanttChart,
  Paperclip, AtSign, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: FolderKanban,
    title: 'Kanban Board',
    desc: 'Drag-and-drop task management with real-time updates and optimistic UI.',
    color: '#6366f1',
  },
  {
    icon: CheckSquare,
    title: 'Task Tracking',
    desc: 'Full issue lifecycle with priorities, labels, assignees, due dates, and subtasks.',
    color: '#22d3ee',
  },
  {
    icon: Zap,
    title: 'Sprint Management',
    desc: 'Plan, start, and complete sprints. Track progress with burndown metrics.',
    color: '#f59e0b',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    desc: 'Generate tasks, summarize projects, write descriptions, and get daily standups.',
    color: '#a855f7',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'KPI cards, pie/bar/area/line charts, team workload visualization.',
    color: '#10b981',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Invite members, assign roles (Owner/Admin/Member/Viewer), real-time activity.',
    color: '#f97316',
  },
  {
    icon: Search,
    title: 'Command Palette',
    desc: 'Ctrl+K global search across tasks, projects, and quick navigation.',
    color: '#ec4899',
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'In-app notification center with unread badges and mark-all-read.',
    color: '#ef4444',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant',
    desc: 'Workspace-based data isolation with slug routing and RBAC permissions.',
    color: '#8b5cf6',
  },
  {
    icon: GanttChart,
    title: 'Gantt & Calendar',
    desc: 'Multiple views: Kanban, List, Gantt Chart, and Calendar for every project.',
    color: '#0ea5e9',
  },
  {
    icon: Timer,
    title: 'Time Tracking',
    desc: 'Built-in timer and manual time logging with per-task and team analytics.',
    color: '#14b8a6',
  },
  {
    icon: Palette,
    title: 'Accent Themes',
    desc: '6 accent colors, dark/light/system modes for a personalized experience.',
    color: '#e879f9',
  },
  {
    icon: Paperclip,
    title: 'File Attachments',
    desc: 'Drag-and-drop file uploads on tasks with image previews and downloads.',
    color: '#64748b',
  },
  {
    icon: AtSign,
    title: '@Mentions',
    desc: 'Mention teammates in comments with autocomplete and instant notifications.',
    color: '#6366f1',
  },
  {
    icon: Mail,
    title: 'Email Notifications',
    desc: 'Get notified via email for task assignments, mentions, and sprint starts.',
    color: '#f43f5e',
  },
  {
    icon: CalendarDays,
    title: 'Dashboard Widgets',
    desc: 'Customizable dashboard with KPI cards, charts, sprint progress, and more.',
    color: '#84cc16',
  },
];

const techStack = [
  { name: 'Next.js 16', desc: 'App Router' },
  { name: 'TypeScript 5', desc: 'Type Safety' },
  { name: 'Prisma 5', desc: 'PostgreSQL ORM' },
  { name: 'Tailwind CSS 4', desc: 'Styling' },
  { name: 'shadcn/ui', desc: '29 Components' },
  { name: 'NextAuth v5', desc: 'Authentication' },
  { name: 'Zustand', desc: 'State Mgmt' },
  { name: '@dnd-kit', desc: 'Drag & Drop' },
  { name: 'Recharts', desc: 'Data Viz' },
  { name: 'Framer Motion', desc: 'Animation' },
  { name: 'OpenAI', desc: 'AI Features' },
  { name: 'Zod', desc: 'Validation' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function LandingPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Demo Banner ──────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 border-b border-primary/20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] gap-1 shrink-0">
              <Sparkles size={10} />
              LIVE DEMO
            </Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">admin@nexusflow.dev</span>
              <button
                onClick={() => copyToClipboard('admin@nexusflow.dev', 'email')}
                className="p-0.5 rounded hover:bg-primary/10 transition-colors"
              >
                {copied === 'email' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              </button>
              <span className="text-muted-foreground/40">|</span>
              <span className="font-medium text-foreground">password123</span>
              <button
                onClick={() => copyToClipboard('password123', 'pass')}
                className="p-0.5 rounded hover:bg-primary/10 transition-colors"
              >
                {copied === 'pass' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
          <Link href="/login?demo=true">
            <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1.5 border-primary/30 hover:bg-primary/10">
              <LogIn size={11} />
              Try Demo Now
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Navbar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers size={16} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-bold">NexusFlow</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs gap-1.5">
                Get Started <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="relative py-24 md:py-32">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6 px-3 py-1 text-xs gap-1.5">
              <Sparkles size={11} className="text-purple-400" />
              AI-Powered Project Management
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Plan. Track. Ship.
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Together.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A full-stack project management platform with Kanban boards, sprint planning,
            AI-powered insights, real-time collaboration, and beautiful analytics.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8 text-sm">
                Start Free <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/login?demo=true">
              <Button variant="outline" size="lg" className="gap-2 px-8 text-sm">
                View Demo
              </Button>
            </Link>
          </motion.div>

          {/* Mini preview */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl p-4 md:p-6 max-w-3xl mx-auto">
              {/* Fake Kanban Board Preview */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-[10px] text-muted-foreground font-mono">NexusFlow — Platform v2.0</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {['Backlog', 'In Progress', 'In Review', 'Done'].map((col, ci) => (
                  <div key={col}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className={`w-2 h-2 rounded-full ${ci === 0 ? 'bg-gray-400' : ci === 1 ? 'bg-amber-400' : ci === 2 ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                      <span className="text-[10px] font-medium text-muted-foreground">{col}</span>
                      <span className="text-[8px] text-muted-foreground/50 ml-auto">{ci === 1 ? 3 : ci === 3 ? 4 : 2}</span>
                    </div>
                    <div className="space-y-1.5">
                      {Array.from({ length: ci === 1 ? 3 : ci === 3 ? 2 : 2 }).map((_, i) => (
                        <div key={i} className="bg-background border border-border rounded-md p-2">
                          <div className="h-2 bg-muted rounded w-full mb-1.5" />
                          <div className="h-1.5 bg-muted/50 rounded w-2/3" />
                          <div className="flex items-center justify-between mt-2">
                            <div className="h-1.5 bg-primary/20 rounded w-8" />
                            <div className="w-3 h-3 rounded-full bg-primary/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 rounded-xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-xs">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship faster</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From task tracking to AI-powered insights — built for modern development teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                >
                  <Card className="h-full hover:-translate-y-1 transition-all duration-300 group">
                    <CardContent className="pt-6">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                        style={{ background: `${feature.color}12`, color: feature.color }}
                      >
                        <Icon size={20} />
                      </div>
                      <h3 className="font-semibold text-sm mb-1.5">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ────────────────────────────────── */}
      <section className="py-24 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs">Tech Stack</Badge>
            <h2 className="text-3xl font-bold mb-4">Built with modern technologies</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-background border border-border rounded-lg p-3 text-center hover:border-primary/30 transition-colors"
              >
                <p className="text-xs font-semibold">{tech.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Highlights ────────────────────────────────── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Why NexusFlow?</h2>
              <div className="space-y-4">
                {[
                  { icon: Globe, text: 'Multi-tenant architecture with workspace isolation' },
                  { icon: Keyboard, text: 'Keyboard-first UX with shortcuts & command palette' },
                  { icon: Moon, text: 'Dark & Light themes with smooth view transitions' },
                  { icon: GitBranch, text: 'Full task hierarchy with subtasks & dependencies' },
                  { icon: Activity, text: 'Comprehensive activity logs & audit trail' },
                  { icon: MessageSquare, text: 'Comment threads with real-time updates' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={13} className="text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '20+', label: 'Database Models' },
                  { value: '15+', label: 'API Routes' },
                  { value: '29', label: 'UI Components' },
                  { value: '8', label: 'Dashboard Pages' },
                  { value: '4', label: 'Chart Types' },
                  { value: '12+', label: 'Keyboard Shortcuts' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8">
              Create your workspace and start managing projects in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8">
                  Create Free Account <ArrowRight size={15} />
                </Button>
              </Link>
              <Link href="/login?demo=true">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  Try Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Layers size={12} className="text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold">NexusFlow</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Built with Next.js, TypeScript, Prisma, Tailwind CSS & AI
          </p>
        </div>
      </footer>
    </div>
  );
}
