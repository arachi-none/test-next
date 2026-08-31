"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase-client";
import { Button } from "../../components/ui/button";
import { BookOpen, Star, Users, Eye, Calendar, MapPin, Globe, Edit } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  cover_image_url: string;
  bio: string;
  website: string;
  social_links: { [key: string]: string };
  role: string;
  is_verified: boolean;
  created_at: string;
  writer_profile: {
    pen_name: string;
    about_the_author: string;
    total_novels: number;
    total_views: number;
    total_bookmarks: number;
    avg_rating: number;
    followers_count: number;
  } | null;
}

interface Novel {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string;
  status: string;
  total_views: number;
  avg_rating: number;
  total_chapters: number;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*, writer_profile:writer_profiles(*)")
        .eq("username", username)
        .single();
      setProfile(profileData);

      if (profileData) {
        const { data: novelsData } = await supabase
          .from("novels")
          .select("id, title, slug, cover_image_url, status, total_views, avg_rating, total_chapters")
          .eq("author_id", profileData.id)
          .eq("status", "published")
          .order("total_views", { ascending: false });
        setNovels(novelsData || []);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="skeleton h-64 w-full" />
        <div className="container-wide py-8">
          <div className="skeleton h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <Link href="/browse" className="mt-4 inline-block text-primary hover:underline">Browse novels</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <div className="h-64 w-full bg-muted">
        {profile.cover_image_url && (
          <img src={profile.cover_image_url} alt={profile.display_name} className="h-full w-full object-cover" />
        )}
      </div>

      <main className="container-wide">
        {/* Profile Header */}
        <div className="relative -mt-16 flex items-end gap-6">
          <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold">
                {profile.display_name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{profile.display_name}</h1>
              {profile.is_verified && (
                <span className="badge border-transparent bg-blue-100 text-blue-800">Verified</span>
              )}
            </div>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          <div className="pb-4">
            <Button variant="outline"><Edit className="h-4 w-4" /> Edit Profile</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{profile.writer_profile?.total_novels || 0}</p>
            <p className="text-sm text-muted-foreground">Novels</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{(profile.writer_profile?.total_views || 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{(profile.writer_profile?.total_bookmarks || 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Bookmarks</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{profile.writer_profile?.avg_rating || "0.0"}</p>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <h2 className="text-xl font-semibold">About</h2>
            <p className="mt-2 text-muted-foreground">{profile.bio || "No bio yet."}</p>

            {/* Novels */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Published Novels</h2>
              {novels.length === 0 ? (
                <p className="mt-4 text-muted-foreground">No novels published yet.</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {novels.map((novel) => (
                    <Link key={novel.id} href={`/novel/${novel.slug}`}>
                      <div className="rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
                        <div className="aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
                          {novel.cover_image_url ? (
                            <img src={novel.cover_image_url} alt={novel.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <BookOpen className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium line-clamp-1">{novel.title}</h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{novel.total_chapters} ch</span>
                            <span>★ {novel.avg_rating || "0.0"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold">Details</h3>
              <div className="mt-3 space-y-2 text-sm">
                {profile.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {profile.writer_profile && (
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold">Writer Stats</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-medium">{profile.writer_profile.followers_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Views</span>
                    <span className="font-medium">{profile.writer_profile.total_views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Bookmarks</span>
                    <span className="font-medium">{profile.writer_profile.total_bookmarks.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
