"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Users, BookOpen, FileText, MessageCircle, Flag, Settings, 
  TrendingUp, Eye, Star, BarChart3, Shield, Bell, Calendar
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalNovels: number;
  totalChapters: number;
  totalReviews: number;
  totalComments: number;
  pendingReports: number;
  totalViews: number;
  newUsersToday: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [users, novels, chapters, reviews, comments, reports] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("novels").select("id", { count: "exact" }),
        supabase.from("novel_chapters").select("id", { count: "exact" }),
        supabase.from("reviews").select("id", { count: "exact" }),
        supabase.from("comments").select("id", { count: "exact" }),
        supabase.from("reports").select("id", { count: "exact" }).eq("status", "pending"),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalNovels: novels.count || 0,
        totalChapters: chapters.count || 0,
        totalReviews: reviews.count || 0,
        totalComments: comments.count || 0,
        pendingReports: reports.count || 0,
        totalViews: 0,
        newUsersToday: 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600" },
    { label: "Total Novels", value: stats?.totalNovels || 0, icon: BookOpen, color: "text-green-600" },
    { label: "Total Chapters", value: stats?.totalChapters || 0, icon: FileText, color: "text-purple-600" },
    { label: "Total Reviews", value: stats?.totalReviews || 0, icon: Star, color: "text-yellow-600" },
    { label: "Total Comments", value: stats?.totalComments || 0, icon: MessageCircle, color: "text-pink-600" },
    { label: "Pending Reports", value: stats?.pendingReports || 0, icon: Flag, color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container-wide py-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Platform overview and management</p>

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/users">
              <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <Users className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 font-semibold">Manage Users</h3>
                <p className="mt-1 text-sm text-muted-foreground">View and manage user accounts</p>
              </div>
            </Link>
            <Link href="/admin/novels">
              <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <BookOpen className="h-8 w-8 text-green-600" />
                <h3 className="mt-4 font-semibold">Manage Novels</h3>
                <p className="mt-1 text-sm text-muted-foreground">Review and moderate novels</p>
              </div>
            </Link>
            <Link href="/admin/reports">
              <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <Flag className="h-8 w-8 text-red-600" />
                <h3 className="mt-4 font-semibold">Reports</h3>
                <p className="mt-1 text-sm text-muted-foreground">Handle user reports</p>
              </div>
            </Link>
            <Link href="/admin/settings">
              <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <Settings className="h-8 w-8 text-gray-600" />
                <h3 className="mt-4 font-semibold">Settings</h3>
                <p className="mt-1 text-sm text-muted-foreground">Platform configuration</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
