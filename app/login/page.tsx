"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebug("Starting login...");
    
    try {
      setDebug("Calling supabase.auth.signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setDebug(`Error: ${error.message}`);
        setError(error.message);
      } else {
        setDebug(`Success! User: ${data.user?.email}`);
        // Wait a bit for session to be set
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setDebug(`Exception: ${err.message}`);
      setError(err.message || "An error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your NovelSpace account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          {debug && (
            <div className="rounded-md bg-muted p-3 text-xs font-mono">
              Debug: {debug}
            </div>
          )}
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>Test accounts:</p>
          <p>admin@novel.space / Admin12345</p>
          <p>writer@novel.space / Writer12345</p>
        </div>
      </div>
    </div>
  );
}
