"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase-client";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, Star, Eye, BookOpen, Heart, Share2, MessageCircle } from "lucide-react";

interface Novel {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  cover_image_url: string;
  status: string;
  total_views: number;
  total_bookmarks: number;
  avg_rating: number;
  total_chapters: number;
  total_reviews: number;
  published_at: string;
  created_at: string;
  author: { id: string; username: string; display_name: string; avatar_url: string };
  genre: { name: string; slug: string } | null;
}

export default function NovelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchNovel = async () => {
      const { data } = await supabase
        .from("novels")
        .select("*, author:profiles(id, username, display_name, avatar_url), genre:genres(name, slug)")
        .eq("slug", slug)
        .single();
      setNovel(data);
      setLoading(false);
    };
    fetchNovel();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-wide py-8">
          <div className="skeleton h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-wide py-8 text-center">
          <h1 className="text-2xl font-bold">Novel not found</h1>
          <Link href="/browse" className="mt-4 inline-block text-primary hover:underline">
            Browse novels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container-wide py-8">
        <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Cover */}
          <div>
            <div className="aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
              {novel.cover_image_url ? (
                <img src={novel.cover_image_url} alt={novel.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{novel.title}</h1>
            
            <div className="mt-4 flex items-center gap-4">
              <Link href={`/author/${novel.author?.username}`} className="flex items-center gap-2">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                  {novel.author?.avatar_url ? (
                    <img src={novel.author.avatar_url} alt={novel.author.display_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-medium">
                      {novel.author?.display_name?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{novel.author?.display_name}</p>
                  <p className="text-sm text-muted-foreground">@{novel.author?.username}</p>
                </div>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {novel.total_views.toLocaleString()} views</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4" /> {novel.avg_rating || "0.0"} rating</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {novel.total_chapters} chapters</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {novel.total_reviews} reviews</span>
            </div>

            {novel.genre && (
              <div className="mt-4">
                <Link href={`/genre/${novel.genre.slug}`}>
                  <span className="badge border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                    {novel.genre.name}
                  </span>
                </Link>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <Button size="lg">
                <BookOpen className="h-4 w-4" /> Start Reading
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsBookmarked(!isBookmarked)}>
                <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} /> Bookmark
              </Button>
              <Button variant="ghost" size="lg">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold">Synopsis</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {novel.synopsis || "No synopsis available."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
