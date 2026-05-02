import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Calendar, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getAnalysisHistory, getDashboardStats } from "@/lib/api";

interface Profile {
  _id: string;
  originalText: string;
  atsScore: number;
  skillMatchPercent: number;
  predictedRoles: string[];
  missingKeywords: string[];
  suggestions: any;
  targetRole: string;
  createdAt: string;
}

interface DashboardStats {
  avgScore: number;
  totalChecks: number;
  targetFocus: number;
  topCategory: string;
}

export default function Dashboard() {
  const [history, setHistory] = useState<Profile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    avgScore: 0,
    totalChecks: 0,
    targetFocus: 0,
    topCategory: "N/A",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, statsRes] = await Promise.all([
          getAnalysisHistory(),
          getDashboardStats(),
        ]);

        // historyRes is the backend body { status: 'success', data: [...] }
        if (historyRes.data) {
          setHistory(historyRes.data);
        }

        // statsRes is the backend body { status: 'success', data: { ... } }
        if (statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AppShell title="PROFILE ANALYZER">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="select-none cursor-default">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Avg. Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgScore}%</div>
              <p className="text-xs text-indigo-500 font-medium mt-1">
                Based on {stats.totalChecks} profiles
              </p>
            </CardContent>
          </Card>
          <Card className="select-none cursor-default">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Recent Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalChecks}</div>
              <p className="text-xs text-slate-400 mt-1">
                Across all categories
              </p>
            </CardContent>
          </Card>
          <Card className="select-none cursor-default">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Target Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.targetFocus}%</div>
              <p className="text-xs text-slate-400 mt-1">ATS Consistency</p>
            </CardContent>
          </Card>
          <Card className="select-none cursor-default">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Top Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold truncate">
                {stats.topCategory}
              </div>
              <p className="text-xs text-slate-400 mt-1">Most analyzed role</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  A history of your last profile analyses
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/recommendations">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
                <Link to="/analyze">
                  <Button variant="outline" size="sm">
                    New Analysis
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((profile) => (
                    <Link
                      key={profile._id}
                      to={`/analysis/${profile._id}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 group-hover:border-primary/20 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-900/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-tighter">
                            {profile.targetRole
                              ? profile.targetRole.substring(0, 2)
                              : "AI"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                              {profile.targetRole ||
                                profile.originalText.substring(0, 40) + "..."}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(
                                  profile.createdAt,
                                ).toLocaleDateString()}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                {Math.round(profile.atsScore || 0)}% Score
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                  <BarChart className="h-12 w-12 mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
                    No analyses yet
                  </h3>
                  <p className="max-w-xs mx-auto mb-6">
                    Start your career journey by analyzing your first LinkedIn
                    profile.
                  </p>
                  <Link to="/analyze">
                    <Button>Start Analysis</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
