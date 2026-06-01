"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { LogOut, Settings2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
  return <SettingsExperience />;
}

function SettingsExperience() {
  const { user, logout } = useAuth();

  return (
    <AppShell>
      <main className="w-full px-5 py-6 md:px-margin-desktop md:py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <section className="border-b border-white/5 pb-6">
            <Badge tone="primary">Workspace settings</Badge>
            <h1 className="mt-3 font-display-xl text-3xl font-black text-on-surface md:text-4xl">
              Settings
            </h1>
            <p className="mt-3 max-w-2xl text-on-surface-variant">
              Keep this page operational and quiet. Advanced API key management should only appear once those
              features are wired to the backend.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel rounded-xl p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings2 size={22} />
              </div>
              <h2 className="font-headline-md text-xl text-on-surface">Account</h2>
              <div className="mt-5 space-y-3 text-sm">
                <Row label="Username" value={user?.username ?? "Guest"} />
                <Row label="Email" value={user?.email ?? "Not loaded"} />
                <Row label="Session" value="JWT bearer token" />
              </div>
              <Button variant="ghost" onClick={logout} className="mt-6">
                <LogOut size={16} />
                Log out
              </Button>
            </div>

            <div className="glass-panel rounded-xl p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <ShieldCheck size={22} />
              </div>
              <h2 className="font-headline-md text-xl text-on-surface">System status</h2>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Auth and task APIs are active. Opportunities and chat are now exposed through backend routes.
                Provider-specific API key controls should be added after backend persistence is designed.
              </p>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-semibold text-on-surface">{value}</span>
    </div>
  );
}
