import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Calendar, ChevronRight, Sparkles, Search, Filter, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { getAnalysisHistory, deleteAnalysis } from '@/lib/api';

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

export default function Recommendations() {
    const [history, setHistory] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getAnalysisHistory();
                // response is the backend body { status: 'success', data: [...] }
                if (response.data) {
                    setHistory(response.data);
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item => 
        item.originalText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            await deleteAnalysis(id);
            setHistory(prev => prev.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error deleting recommendation:', error);
        }
    };

    return (
        <AppShell title="AI Recommendations">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Recommendations</h1>
                        <p className="text-slate-500 mt-1">Review your past profile analyses and AI-generated improvements.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search analyses..."
                                className="pl-10 h-10 w-full md:w-64 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                            Analysis History
                        </CardTitle>
                        <CardDescription>
                            Showing {filteredHistory.length} past analyses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                                <p className="text-slate-500 animate-pulse">Loading your recommendations...</p>
                            </div>
                        ) : filteredHistory.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredHistory.map((profile) => (
                                    <div 
                                        key={profile._id} 
                                        className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <BarChart className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate pr-8">
                                                    {profile.originalText.substring(0, 80)}...
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2">
                                                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(profile.createdAt).toLocaleDateString(undefined, { 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        profile.atsScore >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        profile.atsScore >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`}>
                                                        {Math.round(profile.atsScore || 0)}% Match Score
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 md:gap-3">
                                            <Link to={`/analysis/${profile._id}`} className="flex-1 md:flex-none">
                                                <Button variant="ghost" size="sm" className="w-full md:w-auto group-hover:bg-primary group-hover:text-white transition-colors">
                                                    View Details
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                onClick={(e) => handleDelete(profile._id, e)}
                                                title="Delete recommendation"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 group-hover:scale-110 transition-transform">
                                    <Sparkles className="h-10 w-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No recommendations yet</h3>
                                <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                                    Analyze your LinkedIn profile or resume to see AI-powered recommendations and track your progress.
                                </p>
                                <Link to="/analyze">
                                    <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                                        Start Your First Analysis
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
