"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase-client";
import { Button } from "../../components/ui/button";
import { BookOpen, Plus, Edit, Eye, Star, TrendingUp } from "lucide-react";

interface Novel {
  id: string;
  title: string;
  slug: string;
  status: string;
  total_views: number;
  total_bookmarks: number;
  avg_rating: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchNovels = async () => {
      const { data } = await supabase
        .from("novels")
        .select("id, title, slug, status, total_views, total_bookmarks, avg_rating, created_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });
      setNovels(data || []);
      setLoading(false);
    };
    fetchNovels();
  }, [user]);

  const stats = {
    totalNovels: novels.length,
    totalViews: novels.reduce((sum, n) => sum + (n.total_views || 0), 0),
    totalBookmarks: novels.reduce((sum, n) => sum + (n.total_bookmarks || 0), 0),
    avgRating: novels.length > 0 ? (novels.reduce((sum, n) => sum + (n.avg_rating || 0), 0) / novels.length).toFixed(1) : "0.0",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard/novels/new">
              <Button><Plus className="h-4 w-4" /> New Novel</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container-wide py-8">
        <h1 className="text-3xl font-bold tracking-tight">Writer Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage your novels and track performance</p>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Novels", value: stats.totalNovels, icon: BookOpen },
            { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye },
            { label: "Bookmarks", value: stats.totalBookmarks.toLocaleString(), icon: Star },
            { label: "Avg Rating", value: stats.avgRating, icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Novels List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Your Novels</h2>
          {loading ? (
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 w-full" />
              ))}
            </div>
          ) : novels.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No novels yet</h3>
              <p className="mt-2 text-muted-foreground">Start writing your first novel</p>
              <Link href="/dashboard/novels/new">
                <Button className="mt-4"><Plus className="h-4 w-4" /> Create Novel</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {novels.map((novel) => (
                <div key={novel.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <h3 className="font-semibold">{novel.title}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className={`badge ${novel.status === 'published' ? 'badge-status' : 'badge-status-draft'}`}>
                        {novel.status}
                      </span>
                      <span>{novel.total_views || 0} views</span>
                      <span>{novel.total_bookmarks || 0} bookmarks</span>
                      <span>★ {novel.avg_rating || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/novels/${novel.id}`}>
                      <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <Link href={`/novel/${novel.slug}`} target="_blank">
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </Link>
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
