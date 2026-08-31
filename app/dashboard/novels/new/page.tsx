"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

export default function NewNovelPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
    };
    checkAuth();
  }, []);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    setError("");

    const slug = generateSlug(title);
    const { data, error: dbError } = await supabase
      .from("novels")
      .insert({
        author_id: user.id,
        title: title.trim(),
        slug,
        synopsis: synopsis.trim(),
        status,
        visibility: status === "published" ? "public" : "private",
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/novels/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
        </div>
      </header>

      <main className="container-narrow py-8">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Back to Dashboard</Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Create New Novel</h1>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your novel's title"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Synopsis</label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Write a compelling synopsis..."
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="btn-secondary"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={loading}
              className="btn-primary"
            >
              Publish
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
