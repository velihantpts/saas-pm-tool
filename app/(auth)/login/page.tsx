'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const isDemo = searchParams.get('demo') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoTyping, setDemoTyping] = useState(false);
  const demoRan = useRef(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  // Demo auto-login: type credentials then submit
  useEffect(() => {
    if (!isDemo || demoRan.current) return;
    demoRan.current = true;

    const demoEmail = 'admin@nexusflow.dev';
    const demoPass = 'password123';

    setDemoTyping(true);

    let emailIdx = 0;
    const emailInterval = setInterval(() => {
      emailIdx++;
      setEmail(demoEmail.slice(0, emailIdx));
      if (emailIdx >= demoEmail.length) {
        clearInterval(emailInterval);

        // Small pause then type password
        setTimeout(() => {
          let passIdx = 0;
          const passInterval = setInterval(() => {
            passIdx++;
            setPassword(demoPass.slice(0, passIdx));
            if (passIdx >= demoPass.length) {
              clearInterval(passInterval);
              setDemoTyping(false);

              // Small pause then auto-submit
              setTimeout(() => {
                doLogin(demoEmail, demoPass);
              }, 300);
            }
          }, 40);
        }, 200);
      }
    }, 35);

    return () => clearInterval(emailInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  return (
    <Card className="border-border/50 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers size={22} className="text-primary" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your NexusFlow account</p>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <LogIn size={16} className="mr-2" />}
            Sign In
          </Button>
        </form>

        <Separator className="my-6" />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
