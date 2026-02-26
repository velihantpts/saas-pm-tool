'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, FolderKanban, ArrowRight, Loader2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const steps = [
  { icon: Layers, title: 'Create Workspace', desc: 'Set up your team workspace' },
  { icon: Users, title: 'Invite Team', desc: 'Add your teammates' },
  { icon: FolderKanban, title: 'First Project', desc: 'Create your first project' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1 state
  const [wsName, setWsName] = useState('');
  const [wsSlug, setWsSlug] = useState('');

  // Step 2 state
  const [emails, setEmails] = useState('');

  // Step 3 state
  const [projName, setProjName] = useState('');
  const [projKey, setProjKey] = useState('');

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const generateKey = (name: string) => {
    return name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  };

  const handleCreateWorkspace = async () => {
    setLoading(true);
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: wsName, slug: wsSlug }),
    });
    setLoading(false);
    if (res.ok) setStep(1);
  };

  const handleSkipInvite = () => setStep(2);

  const handleCreateProject = async () => {
    setLoading(true);
    const res = await fetch(`/api/workspaces/${wsSlug}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projName, key: projKey }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(`/w/${wsSlug}/projects/${projKey}/board`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary/20 text-primary border-2 border-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-border/50 shadow-2xl">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-foreground">{steps[step].title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{steps[step].desc}</p>
                </div>

                {step === 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Workspace Name</Label>
                      <Input
                        placeholder="My Team"
                        value={wsName}
                        onChange={(e) => {
                          setWsName(e.target.value);
                          setWsSlug(generateSlug(e.target.value));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Slug</Label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">nexusflow.app/w/</span>
                        <Input
                          placeholder="my-team"
                          value={wsSlug}
                          onChange={(e) => setWsSlug(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <Button className="w-full" disabled={!wsName || !wsSlug || loading} onClick={handleCreateWorkspace}>
                      {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                      Continue <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Invite by Email</Label>
                      <Input
                        placeholder="sarah@example.com, john@example.com"
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Comma-separated emails</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={handleSkipInvite}>
                        Skip for now
                      </Button>
                      <Button className="flex-1" onClick={() => setStep(2)}>
                        Continue <ArrowRight size={14} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        placeholder="Platform v2.0"
                        value={projName}
                        onChange={(e) => {
                          setProjName(e.target.value);
                          setProjKey(generateKey(e.target.value));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project Key</Label>
                      <Input
                        placeholder="PLT"
                        value={projKey}
                        onChange={(e) => setProjKey(e.target.value.toUpperCase())}
                        maxLength={5}
                        className="font-mono uppercase"
                      />
                      <p className="text-xs text-muted-foreground">Used for task IDs: {projKey || 'PLT'}-1, {projKey || 'PLT'}-2...</p>
                    </div>
                    <Button className="w-full" disabled={!projName || !projKey || loading} onClick={handleCreateProject}>
                      {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                      Create & Go to Board <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
