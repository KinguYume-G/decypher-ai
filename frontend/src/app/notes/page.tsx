"use client";

import React, { useEffect, useState } from "react";
import { Check, FileText, Pencil, Plus, Trash2, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { notesAPI } from "@/lib/api";
import type { Note } from "@/types";

export default function NotesPage() {
  const [notes, setNotes]         = useState<Note[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);

  const load = async () => {
    setLoading(true);
    try { setNotes((await notesAPI.list()).data.data ?? []); }
    catch { setNotes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleCreate = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
    setShowNew(false);
  };

  const handleUpdate = (updated: Note) => {
    setNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n));
  };

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <FileText size={18} className="text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface">Notes</h1>
              <p className="text-xs text-on-surface-variant">
                Your personal intelligence knowledge base
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors"
          >
            <Plus size={15} /> New Note
          </button>
        </div>

        {/* New note form */}
        {showNew && (
          <NewNoteForm
            onCreate={handleCreate}
            onCancel={() => setShowNew(false)}
          />
        )}

        {/* Note list */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[260px]">
            <LoadingSpinner />
          </div>
        ) : notes.length === 0 && !showNew ? (
          <EmptyState onNew={() => setShowNew(true)} />
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}

/* ── New note creation form ─────────────────────────────────────── */

function NewNoteForm({ onCreate, onCancel }: {
  onCreate: (note: Note) => void;
  onCancel: () => void;
}) {
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving]   = useState(false);

  const submit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await notesAPI.create({ title: title.trim(), content: content.trim() });
      if (res.data.data) onCreate(res.data.data);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5 mb-4">
      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">New Note</p>
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title — e.g. LLM Ops market opportunity"
        className="w-full text-sm font-semibold text-on-surface placeholder:text-outline bg-transparent border-b border-outline-variant/40 pb-2 mb-3 outline-none focus:border-secondary"
      />
      <textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your insight, analysis, or anything worth remembering…"
        className="w-full text-sm text-on-surface placeholder:text-outline bg-transparent outline-none resize-none leading-relaxed"
      />
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-outline-variant/20">
        <button onClick={onCancel}
          className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!title.trim() || !content.trim() || saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold disabled:opacity-40 hover:bg-secondary/90 transition-colors"
        >
          <Check size={13} /> {saving ? "Saving…" : "Save Note"}
        </button>
      </div>
    </div>
  );
}

/* ── Individual note card with inline editing ───────────────────── */

function NoteCard({ note, onUpdate, onDelete }: {
  note: Note;
  onUpdate: (n: Note) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing]   = useState(false);
  const [title, setTitle]       = useState(note.title);
  const [content, setContent]   = useState(note.content);
  const [saving, setSaving]     = useState(false);

  const date = new Date(note.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const save = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await notesAPI.update(note.id, {
        title: title.trim(),
        content: content.trim(),
      });
      if (res.data.data) onUpdate(res.data.data);
      setEditing(false);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const cancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-secondary/5 border border-secondary/25 rounded-2xl p-5">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-sm font-semibold text-on-surface bg-transparent border-b border-outline-variant/40 pb-2 mb-3 outline-none focus:border-secondary"
        />
        <textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full text-sm text-on-surface bg-transparent outline-none resize-none leading-relaxed"
        />
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-outline-variant/20">
          <button onClick={cancel}
            className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors">
            <X size={12} /> Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold disabled:opacity-40 transition-colors hover:bg-secondary/90">
            <Check size={13} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-outline-variant/40 rounded-2xl p-5 hover:border-secondary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-on-surface line-clamp-1 mb-1.5">
            {note.title}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-secondary hover:bg-secondary/8 transition-colors"
            title="Edit">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(note.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error/8 transition-colors"
            title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-outline mt-3">{date}</p>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <FileText size={26} className="text-outline" />
      </div>
      <h2 className="text-base font-semibold text-on-surface">No notes yet</h2>
      <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">
        Save insights from AI analyses, or write your own market observations. Notes help you build a personal intelligence record.
      </p>
      <button
        onClick={onNew}
        className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors"
      >
        <Plus size={15} /> Write your first note
      </button>
    </div>
  );
}
