"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, MessageSquare, Pin, Lock, Plus, Eye, MessageCircle } from "lucide-react";

interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  total_posts: number;
  total_views: number;
  last_post_at: string;
  created_at: string;
  author: { username: string; display_name: string };
  forum: { name: string; slug: string };
}

export default function ForumsPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      const { data } = await supabase
        .from("forum_topics")
        .select("*, author:profiles(username, display_name), forum:forums(name, slug)")
        .order("is_pinned", { ascending: false })
        .order("last_post_at", { ascending: false })
        .limit(50);
      setTopics(data || []);
      setLoading(false);
    };
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
          <nav className="flex items-center gap-4">
            <Link href="/forums">
              <Button variant="ghost">Forums</Button>
            </Link>
            {user && (
              <Link href="/forums/new">
                <Button><Plus className="h-4 w-4" /> New Topic</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container-wide py-8">
        <h1 className="text-3xl font-bold tracking-tight">Forums</h1>
        <p className="mt-2 text-muted-foreground">Discuss novels, writing, and everything in between</p>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No topics yet</h3>
            <p className="mt-2 text-muted-foreground">Start a discussion!</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Topic</th>
                  <th className="px-4 py-3 text-left font-medium">Forum</th>
                  <th className="px-4 py-3 text-left font-medium">Author</th>
                  <th className="px-4 py-3 text-center font-medium">Replies</th>
                  <th className="px-4 py-3 text-center font-medium">Views</th>
                  <th className="px-4 py-3 text-left font-medium">Last Post</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((topic) => (
                  <tr key={topic.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <Link href={`/forum/${topic.forum.slug}/${topic.slug}`} className="flex items-center gap-2 font-medium hover:underline">
                        {topic.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                        {topic.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        {topic.is_solved && <span className="text-xs text-green-600">✓</span>}
                        {topic.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{topic.forum?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{topic.author?.display_name}</td>
                    <td className="px-4 py-3 text-center">{topic.total_posts}</td>
                    <td className="px-4 py-3 text-center">{topic.total_views}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(topic.last_post_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
