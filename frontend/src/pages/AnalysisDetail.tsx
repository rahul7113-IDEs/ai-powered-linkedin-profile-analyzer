import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { AnalysisResult } from '@/components/AnalysisResult';
import { getProfileDetail } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function AnalysisDetail() {
    const { id } = useParams<{ id: string }>();
    const [analysis, setAnalysis] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            try {
                setIsLoading(true);
                const response = await getProfileDetail(id);
                setAnalysis(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load analysis details. It may have been deleted or you don\'t have permission to view it.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return (
        <AppShell title="Analysis Details">
            <div className="max-w-4xl mx-auto pb-12">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link to="/recommendations">
                            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-slate-500">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Recommendations
                            </Button>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">Analysis Breakdown</h2>
                        <p className="text-slate-500">Detailed AI feedback for your profile analysis on {analysis?.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : '...'}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Loading analysis details...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-6 flex flex-col items-center text-center gap-4 text-red-700 shadow-sm">
                        <AlertCircle className="h-10 w-10" />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Error Loading Data</h3>
                            <p>{error}</p>
                        </div>
                        <Link to="/dashboard">
                            <Button variant="outline" className="mt-2 border-red-200 hover:bg-red-100">Return to Dashboard</Button>
                        </Link>
                    </div>
                ) : (
                    analysis && <AnalysisResult data={analysis} />
                )}
            </div>
        </AppShell>
    );
}
