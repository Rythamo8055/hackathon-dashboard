"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string; credentials?: unknown } | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/setup", { method: "POST" });
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: "Failed to connect" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Database Setup</CardTitle>
          <CardDescription>Initialize your Turso database with tables and default credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result ? (
            <Button onClick={handleSetup} className="w-full h-12" disabled={loading}>
              {loading ? "Setting up..." : "Initialize Database"}
            </Button>
          ) : result.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
                <p className="font-semibold">{result.message}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-sm">Login Credentials:</p>
                <p className="text-sm"><strong>Organizer:</strong> admin / admin123</p>
                <p className="text-sm"><strong>Judges:</strong> judge1, judge2, judge3 / judge123</p>
              </div>
              <div className="space-y-2">
                <a href="/contestant" className="block">
                  <Button variant="outline" className="w-full">Go to Registration</Button>
                </a>
                <a href="/judge/hackathon2026" className="block">
                  <Button variant="outline" className="w-full">Go to Judge Portal</Button>
                </a>
                <a href="/organizer/admin2026" className="block">
                  <Button variant="outline" className="w-full">Go to Organizer</Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <p className="font-semibold">Error: {result.error}</p>
                <p className="text-sm mt-2">Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in Vercel.</p>
              </div>
              <Button onClick={handleSetup} className="w-full" variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
