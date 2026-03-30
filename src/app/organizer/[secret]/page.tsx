"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ORGANIZER_SECRET = "admin2026";

interface Organizer {
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
  ratings: { id: string; score: number; round: number }[];
}

interface Judge {
  id: string;
  username: string;
  name: string;
  ratings: { id: string }[];
}

interface TeamFormData {
  name: string;
  phone: string;
  teamName: string;
  project: string;
}

interface JudgeFormData {
  username: string;
  password: string;
  name: string;
}

export default function OrganizerPage() {
  const params = useParams();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Team Dialog states
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
  const [showEditTeamDialog, setShowEditTeamDialog] = useState(false);
  const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Contestant | null>(null);

  // Judge Dialog states
  const [showAddJudgeDialog, setShowAddJudgeDialog] = useState(false);
  const [showEditJudgeDialog, setShowEditJudgeDialog] = useState(false);
  const [showDeleteJudgeDialog, setShowDeleteJudgeDialog] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);

  // Form states
  const [teamForm, setTeamForm] = useState<TeamFormData>({
    name: "",
    phone: "",
    teamName: "",
    project: "",
  });

  const [judgeForm, setJudgeForm] = useState<JudgeFormData>({
    username: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    const secret = params.secret as string;
    if (secret === ORGANIZER_SECRET) {
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
      const response = await fetch("/api/auth/organizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const organizerData = await response.json();
      setOrganizer(organizerData);
      fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Single optimized API call for all dashboard data
      const response = await fetch("/api/dashboard/organizer");
      const data = await response.json();
      setContestants(data.contestants);
      setJudges(data.judges);
      // Stats available in data.stats if needed
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // Team handlers
  const handleAddTeam = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contestants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add team");
      }

      await fetchDashboardData();
      setShowAddTeamDialog(false);
      setTeamForm({ name: "", phone: "", teamName: "", project: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add team");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/contestants/${selectedTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update team");
      }

      await fetchDashboardData();
      setShowEditTeamDialog(false);
      setSelectedTeam(null);
      setTeamForm({ name: "", phone: "", teamName: "", project: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/contestants/${selectedTeam.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete team");
      }

      await fetchDashboardData();
      setShowDeleteTeamDialog(false);
      setSelectedTeam(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team");
    } finally {
      setLoading(false);
    }
  };

  // Judge handlers
  const handleAddJudge = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(judgeForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add judge");
      }

      await fetchDashboardData();
      setShowAddJudgeDialog(false);
      setJudgeForm({ username: "", password: "", name: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add judge");
    } finally {
      setLoading(false);
    }
  };

  const handleEditJudge = async () => {
    if (!selectedJudge) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/judges/${selectedJudge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(judgeForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update judge");
      }

      await fetchDashboardData();
      setShowEditJudgeDialog(false);
      setSelectedJudge(null);
      setJudgeForm({ username: "", password: "", name: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update judge");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJudge = async () => {
    if (!selectedJudge) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/judges/${selectedJudge.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete judge");
      }

      await fetchDashboardData();
      setShowDeleteJudgeDialog(false);
      setSelectedJudge(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete judge");
    } finally {
      setLoading(false);
    }
  };

  // Dialog openers
  const openEditTeamDialog = (team: Contestant) => {
    setSelectedTeam(team);
    setTeamForm({
      name: team.name,
      phone: team.phone,
      teamName: team.teamName,
      project: team.project,
    });
    setShowEditTeamDialog(true);
  };

  const openDeleteTeamDialog = (team: Contestant) => {
    setSelectedTeam(team);
    setShowDeleteTeamDialog(true);
  };

  const openEditJudgeDialog = (judge: Judge) => {
    setSelectedJudge(judge);
    setJudgeForm({
      username: judge.username,
      password: "",
      name: judge.name,
    });
    setShowEditJudgeDialog(true);
  };

  const openDeleteJudgeDialog = (judge: Judge) => {
    setSelectedJudge(judge);
    setShowDeleteJudgeDialog(true);
  };

  const getAverageScore = (ratings: Contestant["ratings"]) => {
    if (ratings.length === 0) return "-";
    const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
    return avg.toFixed(1);
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
            <CardDescription>This page is restricted to organizers</CardDescription>
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
  if (!organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Organizer Login</CardTitle>
            <CardDescription>
              Login to manage teams and judges
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
                {loading ? "Logging in..." : "Login as Organizer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Organizer Dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="text-gray-600">Welcome, {organizer.name}</p>
          </div>
          <Button variant="outline" onClick={() => setOrganizer(null)}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="teams">Teams ({contestants.length})</TabsTrigger>
            <TabsTrigger value="judges">Judges ({judges.length})</TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Teams</h2>
              <Button onClick={() => setShowAddTeamDialog(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Team
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{contestants.length}</div>
                  <p className="text-sm text-gray-500">Total Teams</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {contestants.reduce((sum, c) => sum + c.ratings.length, 0)}
                  </div>
                  <p className="text-sm text-gray-500">Total Ratings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {contestants.filter((c) => c.ratings.length > 0).length}
                  </div>
                  <p className="text-sm text-gray-500">Rated Teams</p>
                </CardContent>
              </Card>
            </div>

            {/* Teams Table */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Team #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Team Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Lead</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Avg Score</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestants.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <Badge variant="outline">#{c.teamNumber}</Badge>
                          </td>
                          <td className="py-3 px-4 font-medium">{c.teamName}</td>
                          <td className="py-3 px-4">{c.name}</td>
                          <td className="py-3 px-4 text-gray-600">{c.phone}</td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{c.project}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={
                              getAverageScore(c.ratings) === "-" ? "bg-gray-100 text-gray-600" :
                              parseFloat(getAverageScore(c.ratings) as string) >= 8 ? "bg-green-100 text-green-700" :
                              parseFloat(getAverageScore(c.ratings) as string) >= 5 ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }>
                              {getAverageScore(c.ratings)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditTeamDialog(c)}>Edit</Button>
                              <Button variant="destructive" size="sm" onClick={() => openDeleteTeamDialog(c)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {contestants.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No teams registered yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Judges Tab */}
          <TabsContent value="judges" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Judges</h2>
              <Button onClick={() => { setJudgeForm({ username: "", password: "", name: "" }); setShowAddJudgeDialog(true); }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Judge
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Username</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Ratings Given</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {judges.map((j) => (
                        <tr key={j.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono">{j.username}</td>
                          <td className="py-3 px-4">{j.name}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline">{j.ratings.length}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditJudgeDialog(j)}>Edit</Button>
                              <Button variant="destructive" size="sm" onClick={() => openDeleteJudgeDialog(j)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {judges.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No judges created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Team Dialog */}
      <Dialog open={showAddTeamDialog} onOpenChange={setShowAddTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>Add a new team to the competition.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div className="space-y-2">
              <Label>Team Lead Name</Label>
              <Input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Enter name" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={teamForm.phone} onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })} placeholder="Enter phone" />
            </div>
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} placeholder="Enter team name" />
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Input value={teamForm.project} onChange={(e) => setTeamForm({ ...teamForm, project: e.target.value })} placeholder="Brief description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTeamDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTeam} disabled={loading}>{loading ? "Adding..." : "Add Team"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={showEditTeamDialog} onOpenChange={setShowEditTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team #{selectedTeam?.teamNumber}</DialogTitle>
            <DialogDescription>Update team details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div className="space-y-2">
              <Label>Team Lead Name</Label>
              <Input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={teamForm.phone} onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Input value={teamForm.project} onChange={(e) => setTeamForm({ ...teamForm, project: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTeamDialog(false)}>Cancel</Button>
            <Button onClick={handleEditTeam} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={showDeleteTeamDialog} onOpenChange={setShowDeleteTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team #{selectedTeam?.teamNumber}?</DialogTitle>
            <DialogDescription>This will permanently delete {selectedTeam?.teamName} and all their ratings.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteTeamDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={loading}>{loading ? "Deleting..." : "Delete Team"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Judge Dialog */}
      <Dialog open={showAddJudgeDialog} onOpenChange={setShowAddJudgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Judge</DialogTitle>
            <DialogDescription>Create a new judge account for rating teams.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={judgeForm.username} onChange={(e) => setJudgeForm({ ...judgeForm, username: e.target.value })} placeholder="e.g., judge4" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={judgeForm.password} onChange={(e) => setJudgeForm({ ...judgeForm, password: e.target.value })} placeholder="Enter password" />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={judgeForm.name} onChange={(e) => setJudgeForm({ ...judgeForm, name: e.target.value })} placeholder="e.g., Judge Four" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddJudgeDialog(false)}>Cancel</Button>
            <Button onClick={handleAddJudge} disabled={loading}>{loading ? "Adding..." : "Add Judge"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Judge Dialog */}
      <Dialog open={showEditJudgeDialog} onOpenChange={setShowEditJudgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Judge: {selectedJudge?.username}</DialogTitle>
            <DialogDescription>Update judge credentials. Leave password empty to keep current.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={judgeForm.username} onChange={(e) => setJudgeForm({ ...judgeForm, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Password (leave empty to keep current)</Label>
              <Input type="password" value={judgeForm.password} onChange={(e) => setJudgeForm({ ...judgeForm, password: e.target.value })} placeholder="New password (optional)" />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={judgeForm.name} onChange={(e) => setJudgeForm({ ...judgeForm, name: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditJudgeDialog(false)}>Cancel</Button>
            <Button onClick={handleEditJudge} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Judge Dialog */}
      <Dialog open={showDeleteJudgeDialog} onOpenChange={setShowDeleteJudgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Judge: {selectedJudge?.username}?</DialogTitle>
            <DialogDescription>This will permanently delete the judge and all their ratings. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteJudgeDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteJudge} disabled={loading}>{loading ? "Deleting..." : "Delete Judge"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
