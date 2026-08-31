"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      fetchNovels(session.user.id);
    };
    checkAuth();
  }, []);

  const fetchNovels = async (userId: string) => {
    const { data } = await supabase
      .from("novels")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });
    setNovels(data || []);
    setLoading(false);
  };

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
            <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">Browse</Link>
            <Link href="/dashboard/novels/new" className="btn-primary">New Novel</Link>
          </nav>
        </div>
      </header>

      <main className="container-wide py-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage your novels and track performance</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Novels</p>
            <p className="text-2xl font-bold">{stats.totalNovels}</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Bookmarks</p>
            <p className="text-2xl font-bold">{stats.totalBookmarks.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Avg Rating</p>
            <p className="text-2xl font-bold">{stats.avgRating}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Your Novels</h2>
          {loading ? (
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)}
            </div>
          ) : novels.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground">No novels yet</p>
              <Link href="/dashboard/novels/new" className="btn-primary mt-4">Create Novel</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {novels.map((novel) => (
                <div key={novel.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <h3 className="font-semibold">{novel.title}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className={`badge ${novel.status === 'published' ? 'badge-status' : 'badge-status-draft'}`}>{novel.status}</span>
                      <span>{novel.total_views || 0} views</span>
                      <span>★ {novel.avg_rating || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/novels/${novel.id}`} className="btn-secondary">Edit</Link>
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
