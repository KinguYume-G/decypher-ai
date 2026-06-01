"use client";

import React, { useEffect, useState } from "react";
import { Trash2, FileText } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { notesAPI } from "@/lib/api";
import type { Note } from "@/types";

export default function NotesPage() {
  const [notes, setNotes]     = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notesAPI.list();
      setNotes(res.data.data ?? []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await notesAPI.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <AppShell>
      <main className="px-6 py-8 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <FileText size={18} className="text-secondary" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Notes</h1>
          </div>
          <p className="text-sm text-on-surface-variant">
            Insights and summaries saved from your AI Analyst sessions.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
              <FileText size={26} className="text-outline" />
            </div>
            <h2 className="text-base font-semibold text-on-surface">No notes yet</h2>
            <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm">
              After an AI analysis session, save key insights as notes — they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: number) => void }) {
  const date = new Date(note.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="bg-white border border-outline-variant/40 rounded-xl p-5 hover:border-secondary/30 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-on-surface line-clamp-1 mb-1">
            {note.title}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-4">
            {note.content}
          </p>
        </div>
        <button
          onClick={() => onDelete(note.id)}
          className="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all shrink-0 mt-0.5"
          title="Delete note"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <p className="text-[10px] text-outline mt-3">{date}</p>
    </div>
  );
}
