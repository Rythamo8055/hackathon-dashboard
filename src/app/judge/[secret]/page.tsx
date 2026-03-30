"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const JUDGE_SECRET = "hackathon2026";

interface Judge {
  id: string;
  username: string;
  name: string;
}

interface Contestant {
  id: string;
  name: string;
  phone: string;
  teamName: string;
  project: string;
  teamNumber: number;
  ratings: Rating[];
}

interface Rating {
  id: string;
  contestantId: string;
  judgeId: string;
  round: number;
  score: number;
  reason: string;
}

interface ContestantWithRatings extends Contestant {
  myRatings: { [round: number]: Rating };
}

export default function JudgePortalPage() {
  const params = useParams();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [judge, setJudge] = useState<Judge | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [contestants, setContestants] = useState<ContestantWithRatings[]>([]);
  const [selectedContestant, setSelectedContestant] = useState<ContestantWithRatings | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [ratingForm, setRatingForm] = useState({ score: 5, reason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const secret = params.secret as string;
    if (secret === JUDGE_SECRET) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  }, [params.secret]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const judgeData = await response.json();
      setJudge(judgeData);
      fetchContestants(judgeData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchContestants = async (judgeId: string) => {
    try {
      // Single optimized API call instead of 2
      const response = await fetch(`/api/dashboard/judge?judgeId=${judgeId}`);
      const data = await response.json();

      setContestants(data.contestants);
    } catch (err) {
      console.error("Error fetching contestants:", err);
    }
  };

  const handleSubmitRating = async (contestantId: string) => {
    if (!judge) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestantId,
          judgeId: judge.id,
          round: currentRound,
          score: ratingForm.score,
          reason: ratingForm.reason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit rating");
      }

      await fetchContestants(judge.id);
      setRatingForm({ score: 5, reason: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const selectContestant = (contestant: ContestantWithRatings, round: number) => {
    setSelectedContestant(contestant);
    setCurrentRound(round);
    const existingRating = contestant.myRatings[round];
    setRatingForm({
      score: existingRating?.score ?? 5,
      reason: existingRating?.reason ?? "",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-700 border-green-300";
    if (score >= 5) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  // Unauthorized access
  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>This page is restricted</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Loading state
  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Login Screen
  if (!judge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Judge Login</CardTitle>
            <CardDescription>
              Login to rate competition teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login as Judge"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Judge Dashboard - Original Layout
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Judge Dashboard</h1>
            <p className="text-gray-600">Welcome, {judge.name}</p>
          </div>
          <Button variant="outline" onClick={() => setJudge(null)}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList>
            <TabsTrigger value="teams">All Teams</TabsTrigger>
            <TabsTrigger value="rate">Rate Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contestants.map((c) => (
                <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => selectContestant(c, 1)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Team #{c.teamNumber}</CardTitle>
                      <Badge variant="outline">{c.teamName}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600">{c.project}</p>
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[1, 2, 3].map((round) => (
                        <div key={round} className="space-y-1">
                          <p className="text-xs text-gray-500">Round {round}</p>
                          {c.myRatings[round] ? (
                            <Badge className={getScoreColor(c.myRatings[round].score)}>
                              {c.myRatings[round].score}/10
                            </Badge>
                          ) : (
                            <Badge variant="secondary">-</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rate" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Team Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Team</CardTitle>
                  <CardDescription>Choose a team to rate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {contestants.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedContestant?.id === c.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => selectContestant(c, currentRound)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Team #{c.teamNumber} - {c.teamName}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Rating Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedContestant
                      ? `Rate Team #${selectedContestant.teamNumber}`
                      : "Select a team"}
                  </CardTitle>
                  {selectedContestant && (
                    <CardDescription>{selectedContestant.teamName}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedContestant ? (
                    <div className="space-y-4">
                      {/* Round Selection */}
                      <div className="space-y-2">
                        <Label>Round</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3].map((round) => (
                            <Button
                              key={round}
                              variant={currentRound === round ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setCurrentRound(round);
                                const existingRating = selectedContestant.myRatings[round];
                                setRatingForm({
                                  score: existingRating?.score ?? 5,
                                  reason: existingRating?.reason ?? "",
                                });
                              }}
                            >
                              Round {round}
                              {selectedContestant.myRatings[round] && (
                                <Badge variant="secondary" className="ml-2">
                                  {selectedContestant.myRatings[round].score}
                                </Badge>
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="space-y-2">
                        <Label>Score (1-10)</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="range"
                            min="1"
                            max="10"
                            value={ratingForm.score}
                            onChange={(e) =>
                              setRatingForm({ ...ratingForm, score: parseInt(e.target.value) })
                            }
                            className="flex-1"
                          />
                          <Badge className={`text-lg px-4 py-1 ${getScoreColor(ratingForm.score)}`}>
                            {ratingForm.score}
                          </Badge>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="space-y-2">
                        <Label>Reason / Comments</Label>
                        <textarea
                          className="w-full min-h-24 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Provide feedback for this rating..."
                          value={ratingForm.reason}
                          onChange={(e) => setRatingForm({ ...ratingForm, reason: e.target.value })}
                        />
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => handleSubmitRating(selectedContestant.id)}
                        disabled={loading || !ratingForm.reason}
                      >
                        {loading
                          ? "Submitting..."
                          : selectedContestant.myRatings[currentRound]
                          ? "Update Rating"
                          : "Submit Rating"}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Select a team from the list to rate
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
