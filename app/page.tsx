"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { BookOpen, PenTool, Search, Star } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            NovelSpace
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard"><Button variant="outline">Dashboard</Button></Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost">Sign in</Button></Link>
                <Link href="/register"><Button>Get started</Button></Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="container-wide py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Where stories come alive
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Discover, publish, and read novels from talented writers around the world.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register"><Button size="lg">Start writing</Button></Link>
          <Link href="/browse"><Button size="lg" variant="outline">Browse novels</Button></Link>
        </div>
      </section>

      <section className="border-t bg-muted/50 py-20">
        <div className="container-wide">
          <h2 className="text-center text-3xl font-bold tracking-tight">Everything you need</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, title: "Read", desc: "Discover thousands of novels across every genre" },
              { icon: PenTool, title: "Write", desc: "Create and publish your stories with ease" },
              { icon: Search, title: "Discover", desc: "Find your next read with smart recommendations" },
              { icon: Star, title: "Review", desc: "Rate and review novels, build your reputation" },
            ].map((feature, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container-wide text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NovelSpace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
