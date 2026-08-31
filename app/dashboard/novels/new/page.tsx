"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ArrowLeft, Save, Send } from "lucide-react";

export default function NewNovelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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
        author_id: user!.id,
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
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            NovelSpace
          </Link>
        </div>
      </header>

      <main className="container-narrow py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Create New Novel</h1>
        <p className="mt-2 text-muted-foreground">Set up your novel with a title and synopsis</p>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your novel's title"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="synopsis" className="text-sm font-medium">Synopsis</label>
            <textarea
              id="synopsis"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Write a compelling synopsis..."
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => handleSubmit("draft")} variant="outline" disabled={loading}>
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button onClick={() => handleSubmit("published")} disabled={loading}>
              <Send className="h-4 w-4" /> Publish
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
