"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase-client";
import { Input } from "../../components/ui/input";
import { Search, Star, Eye, BookOpen } from "lucide-react";

interface Novel {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  cover_image_url: string;
  total_views: number;
  total_bookmarks: number;
  avg_rating: number;
  total_chapters: number;
  status: string;
  author: { username: string; display_name: string };
}

export default function BrowsePage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNovels = async () => {
      const { data } = await supabase
        .from("novels")
        .select("*, author:profiles(username, display_name)")
        .eq("status", "published")
        .order("total_views", { ascending: false });
      setNovels(data || []);
      setLoading(false);
    };
    fetchNovels();
  }, []);

  const filteredNovels = novels.filter((novel) =>
    novel.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            NovelSpace
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-accent px-4 py-2">
                Sign in
              </button>
            </Link>
            <Link href="/register">
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Get started
              </button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container-wide py-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Novels</h1>
        <p className="mt-2 text-muted-foreground">Discover your next favorite read</p>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search novels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="skeleton h-80 w-full" />
            ))}
          </div>
        ) : filteredNovels.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No novels found</h3>
            <p className="mt-2 text-muted-foreground">
              {search ? "Try a different search" : "Be the first to publish!"}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredNovels.map((novel) => (
              <Link key={novel.id} href={`/novel/${novel.slug}`} className="group">
                <div className="rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-t-lg bg-muted">
                    {novel.cover_image_url ? (
                      <img
                        src={novel.cover_image_url}
                        alt={novel.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1">{novel.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {novel.author?.display_name || "Unknown"}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {novel.total_views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" /> {novel.avg_rating || "0.0"}
                      </span>
                      <span>{novel.total_chapters} ch</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
