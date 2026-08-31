"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase-client";
import { Input } from "../../components/ui/input";
import { Search, BookOpen, User, Star, Eye } from "lucide-react";

interface SearchResult {
  type: "novel" | "user" | "genre";
  id: string;
  title: string;
  subtitle: string;
  url: string;
  image?: string;
  stats?: { views?: number; rating?: number; novels?: number };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);

      const [novels, users] = await Promise.all([
        supabase
          .from("novels")
          .select("id, title, slug, total_views, avg_rating, cover_image_url")
          .ilike("title", `%${query}%`)
          .eq("status", "published")
          .limit(10),
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, role")
          .ilike("display_name", `%${query}%`)
          .limit(10),
      ]);

      const novelResults: SearchResult[] = (novels.data || []).map((n: any) => ({
        type: "novel",
        id: n.id,
        title: n.title,
        subtitle: `${n.total_views} views`,
        url: `/novel/${n.slug}`,
        image: n.cover_image_url,
        stats: { views: n.total_views, rating: n.avg_rating },
      }));

      const userResults: SearchResult[] = (users.data || []).map((u: any) => ({
        type: "user",
        id: u.id,
        title: u.display_name,
        subtitle: `@${u.username}`,
        url: `/${u.username}`,
        image: u.avatar_url,
      }));

      setResults([...novelResults, ...userResults]);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
        </div>
      </header>

      <main className="container-narrow py-8">
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="mt-2 text-muted-foreground">Find novels, writers, and more</p>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search novels, authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {loading && (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && query.length >= 2 && (
          <div className="mt-6 rounded-lg border border-dashed p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No results found</h3>
            <p className="mt-2 text-muted-foreground">Try a different search term</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="mt-6 space-y-2">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.url}
                className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                  {result.image ? (
                    <img src={result.image} alt={result.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {result.type === "novel" ? (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{result.title}</p>
                  <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                </div>
                {result.stats && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {result.stats.views && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {result.stats.views}
                      </span>
                    )}
                    {result.stats.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" /> {result.stats.rating}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
