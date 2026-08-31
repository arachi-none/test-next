"use client";

import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useState } from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
          <nav className="flex items-center gap-4">
            <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">Browse</Link>
            <Link href="/login" className="btn-secondary">Sign in</Link>
            <Link href="/register" className="btn-primary">Get started</Link>
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
          <Link href="/register" className="btn-primary">Start writing</Link>
          <Link href="/browse" className="btn-secondary">Browse novels</Link>
        </div>
      </section>
    </div>
  );
}
