"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import { supabase } from "../../../lib/supabase-client";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Save, Plus, Edit, Trash2 } from "lucide-react";

interface Novel {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  status: string;
  total_views: number;
  total_bookmarks: number;
  avg_rating: number;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  status: string;
  total_views: number;
  created_at: string;
}

export default function NovelEditorPage() {
  const params = useParams();
  const novelId = params.id as string;
  const { user } = useAuth();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !novelId) return;
    const fetchData = async () => {
      const { data: novelData } = await supabase
        .from("novels")
        .select("*")
        .eq("id", novelId)
        .eq("author_id", user.id)
        .single();
      setNovel(novelData);

      const { data: chaptersData } = await supabase
        .from("novel_chapters")
        .select("id, chapter_number, title, status, total_views, created_at")
        .eq("novel_id", novelId)
        .order("chapter_number", { ascending: false });
      setChapters(chaptersData || []);
      setLoading(false);
    };
    fetchData();
  }, [user, novelId]);

  const handleSave = async () => {
    if (!novel) return;
    setSaving(true);
    await supabase
      .from("novels")
      .update({
        title: novel.title,
        synopsis: novel.synopsis,
        status: novel.status,
      })
      .eq("id", novel.id);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-narrow py-8">
          <div className="skeleton h-8 w-48" />
          <div className="mt-4 skeleton h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-narrow py-8">
          <h1 className="text-2xl font-bold">Novel not found</h1>
          <Link href="/dashboard" className="mt-4 inline-block text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            NovelSpace
          </Link>
        </div>
      </header>

      <main className="container-narrow py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Edit Novel</h1>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={novel.title}
              onChange={(e) => setNovel({ ...novel, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Synopsis</label>
            <textarea
              value={novel.synopsis || ""}
              onChange={(e) => setNovel({ ...novel, synopsis: e.target.value })}
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={novel.status}
              onChange={(e) => setNovel({ ...novel, status: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Chapters */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chapters</h2>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Chapter
            </Button>
          </div>

          {chapters.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No chapters yet. Start writing!</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <p className="font-medium">Chapter {chapter.chapter_number}: {chapter.title}</p>
                    <p className="text-sm text-muted-foreground">{chapter.total_views} views</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
