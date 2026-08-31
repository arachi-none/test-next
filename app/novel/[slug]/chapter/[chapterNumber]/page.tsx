"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase-client";
import { Button } from "../../../../../components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  total_views: number;
  created_at: string;
}

interface Novel {
  id: string;
  title: string;
  slug: string;
}

export default function ReadPage() {
  const params = useParams();
  const { slug, chapterNumber } = params as { slug: string; chapterNumber: string };
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !chapterNumber) return;
    const fetchChapter = async () => {
      const { data: novelData } = await supabase
        .from("novels")
        .select("id, title, slug")
        .eq("slug", slug)
        .single();
      setNovel(novelData);

      const { data: chapterData } = await supabase
        .from("novel_chapters")
        .select("*")
        .eq("novel_id", novelData?.id)
        .eq("chapter_number", parseInt(chapterNumber))
        .single();
      setChapter(chapterData);
      setLoading(false);
    };
    fetchChapter();
  }, [slug, chapterNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="skeleton h-8 w-64 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!chapter || !novel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Chapter not found</h1>
          <Link href={`/novel/${slug}`} className="mt-4 inline-block text-primary hover:underline">
            Back to novel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-narrow flex h-16 items-center justify-between">
          <Link href={`/novel/${slug}`} className="text-lg font-bold hover:underline">
            {novel.title}
          </Link>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/browse">Browse</Link>
          </nav>
        </div>
      </header>

      <main className="container-narrow py-12">
        <h1 className="text-3xl font-bold tracking-tight">Chapter {chapter.chapter_number}: {chapter.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{chapter.total_views.toLocaleString()} views</p>

        <div className="mt-8 space-y-4 text-lg leading-relaxed">
          {chapter.content.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between border-t pt-8">
          <Link href={`/novel/${slug}/chapter/${parseInt(chapterNumber) - 1}`}>
            <Button variant="outline" disabled={chapter.chapter_number <= 1}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
          </Link>
          <Link href={`/novel/${slug}/chapter/${parseInt(chapterNumber) + 1}`}>
            <Button variant="outline">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
