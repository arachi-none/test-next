"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase-client";

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      setResult({ step: "getSession", data: { hasSession: !!data.session }, error: error?.message });
    } catch (err: any) {
      setResult({ step: "getSession", error: err.message });
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@novel.space",
        password: "Admin12345",
      });
      setResult({
        step: "signIn",
        hasUser: !!data.user,
        userId: data.user?.id,
        error: error?.message,
      });
    } catch (err: any) {
      setResult({ step: "signIn", error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold">Debug Page</h1>
      <p className="mt-2 text-muted-foreground">Test Supabase connection</p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Test Connection
        </button>
        <button
          onClick={testLogin}
          disabled={loading}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Test Login
        </button>
      </div>

      {loading && <p className="mt-4">Loading...</p>}

      {result && (
        <div className="mt-6 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Result:</h2>
          <pre className="mt-2 overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 rounded-lg border bg-card p-4">
        <h2 className="font-semibold">Environment:</h2>
        <pre className="mt-2 text-sm">
          NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET"}
          {"\n"}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET"}
        </pre>
      </div>
    </div>
  );
}
