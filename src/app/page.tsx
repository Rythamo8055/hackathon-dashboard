import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 safe-area-inset">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hackathon Dashboard</h1>
          <p className="text-sm text-gray-600">Competition Registration Portal</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg text-blue-600">Team Registration</CardTitle>
            <CardDescription className="text-sm">
              Register your team for the competition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/contestant">
              <Button className="w-full h-12 text-base">
                Register Team
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          For organizers only
        </p>
      </div>
    </div>
  );
}
// test persistence Mon Mar 30 11:26:21 AM IST 2026
