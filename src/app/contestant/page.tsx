"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  name: string;
  phone: string;
  teamName: string;
  project: string;
}

interface RegisteredTeam {
  teamNumber: number;
  teamName: string;
  name: string;
}

export default function ContestantPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    teamName: "",
    project: "",
  });
  const [loading, setLoading] = useState(false);
  const [registeredTeam, setRegisteredTeam] = useState<RegisteredTeam | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contestants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();
      setRegisteredTeam({
        teamNumber: data.teamNumber,
        teamName: data.teamName,
        name: data.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (registeredTeam) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 safe-area-inset">
        <Card className="w-full max-w-sm mx-4 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-xl text-green-600">Registered!</CardTitle>
            <CardDescription>Your team is in the competition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-center text-white shadow-lg">
              <p className="text-sm opacity-90 mb-1">Your Team Number</p>
              <p className="text-6xl font-bold">#{registeredTeam.teamNumber}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-gray-800">{registeredTeam.teamName}</p>
              <p className="text-sm text-gray-500">{registeredTeam.name}</p>
            </div>
            <p className="text-xs text-center text-gray-400">
              Take a screenshot of your team number
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 safe-area-inset">
      <Card className="w-full max-w-sm mx-4 shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Team Registration</CardTitle>
          <CardDescription>
            Register your team for the competition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Team Lead Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="Enter team name"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project / What are you building?</Label>
              <Input
                id="project"
                placeholder="Brief description"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                required
                className="h-12"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Registering..." : "Register Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
