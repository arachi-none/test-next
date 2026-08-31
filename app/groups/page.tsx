"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Users, Globe, Lock, Plus, UserPlus } from "lucide-react";

interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string;
  privacy: string;
  total_members: number;
  total_posts: number;
  creator: { username: string; display_name: string };
}

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase
        .from("groups")
        .select("*, creator:profiles(username, display_name)")
        .eq("privacy", "public")
        .order("total_members", { ascending: false });
      setGroups(data || []);
      setLoading(false);
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
          <nav className="flex items-center gap-4">
            <Link href="/groups">
              <Button variant="ghost">Groups</Button>
            </Link>
            {user && (
              <Link href="/groups/new">
                <Button><Plus className="h-4 w-4" /> Create Group</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container-wide py-8">
        <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
        <p className="mt-2 text-muted-foreground">Join communities of readers and writers</p>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-64 w-full" />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No groups found</h3>
            <p className="mt-2 text-muted-foreground">Be the first to create a community!</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Link key={group.id} href={`/group/${group.slug}`}>
                <div className="rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    {group.cover_image_url ? (
                      <img src={group.cover_image_url} alt={group.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold line-clamp-1">{group.name}</h3>
                      {group.privacy === "public" ? (
                        <Globe className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{group.total_members} members</span>
                      <span>{group.total_posts} posts</span>
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
