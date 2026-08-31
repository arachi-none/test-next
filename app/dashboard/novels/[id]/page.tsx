"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

export default function NovelEditorPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [novel, setNovel] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      fetchNovel(session.user.id);
    };
    checkAuth();
  }, []);

  const fetchNovel = async (userId: string) => {
    const { data: novelData } = await supabase
      .from("novels")
      .select("*")
      .eq("id", novelId)
      .eq("author_id", userId)
      .single();
    
    if (!novelData) {
      router.push("/dashboard");
      return;
    }
    
    setNovel(novelData);

    const { data: chaptersData } = await supabase
      .from("novel_chapters")
      .select("*")
      .eq("novel_id", novelId)
      .order("chapter_number", { ascending: false });
    
    setChapters(chaptersData || []);
    setLoading(false);
  };

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

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    
    const nextNumber = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number)) + 1 : 1;
    
    const { data, error } = await supabase
      .from("novel_chapters")
      .insert({
        novel_id: novelId,
        chapter_number: nextNumber,
        title: newChapterTitle.trim(),
        content: newChapterContent.trim(),
        status: "published",
      })
      .select()
      .single();

    if (!error) {
      setChapters([data, ...chapters]);
      setNewChapterTitle("");
      setNewChapterContent("");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    await supabase.from("novel_chapters").delete().eq("id", chapterId);
    setChapters(chapters.filter(c => c.id !== chapterId));
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
          <Link href="/dashboard" className="mt-4 inline-block text-primary hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
        </div>
      </header>

      <main className="container-narrow py-8">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Back to Dashboard</Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Edit Novel</h1>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={novel.title}
              onChange={(e) => setNovel({ ...novel, title: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Synopsis</label>
            <textarea
              value={novel.synopsis || ""}
              onChange={(e) => setNovel({ ...novel, synopsis: e.target.value })}
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Chapters */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold">Chapters</h2>
          
          {/* Add Chapter Form */}
          <div className="mt-4 rounded-lg border bg-card p-4">
            <h3 className="font-medium">Add New Chapter</h3>
            <div className="mt-4 space-y-4">
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Chapter title"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <textarea
                value={newChapterContent}
                onChange={(e) => setNewChapterContent(e.target.value)}
                placeholder="Chapter content..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button onClick={handleAddChapter} className="btn-primary">Add Chapter</button>
            </div>
          </div>

          {chapters.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No chapters yet</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <p className="font-medium">Chapter {chapter.chapter_number}: {chapter.title}</p>
                    <p className="text-sm text-muted-foreground">{chapter.total_views || 0} views</p>
                  </div>
                  <button onClick={() => handleDeleteChapter(chapter.id)} className="btn-secondary">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
