import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, CheckCircle2, TrendingUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisResultProps {
    data: {
        atsScore: number;
        skillMatchPercent: number;
        predictedRoles: string[];
        missingKeywords: string[];
        smartSuggestions: string[];
        linkedinSuggestions: {
            headline?: string;
            about?: string;
            experience?: string[];
        };
        targetRole?: string;
    };
}

export function AnalysisResult({ data }: AnalysisResultProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 bg-gradient-to-br from-indigo-500 to-primary text-white border-none shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-white/80 text-sm font-medium uppercase tracking-wider">Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative flex items-center justify-center">
                            <svg className="h-32 w-32 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-white/20"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="58"
                                    stroke="white"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={364}
                                    strokeDashoffset={364 - (364 * (data.atsScore || 0)) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <span className="absolute text-4xl font-bold">{Math.round(data.atsScore || 0)}</span>
                        </div>
                        <p className="mt-4 text-white/90 font-medium">
                            {(data.atsScore || 0) >= 80 ? 'Excellent!' : (data.atsScore || 0) >= 60 ? 'Getting There' : 'Needs Work'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Optimization Summary
                        </CardTitle>
                        <CardDescription>Based on your target role: <span className="font-semibold text-slate-900">{data.targetRole || 'General'}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {data.missingKeywords && data.missingKeywords.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                    Missing Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.missingKeywords.map((kw, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* General top-level suggestions */}
                        {data.smartSuggestions && data.smartSuggestions.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 font-outfit uppercase tracking-wider text-[11px]">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                    Smart Suggestions
                                </h4>
                                <div className="grid gap-2">
                                    {data.smartSuggestions.map((sug, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-800/20 text-slate-700 dark:text-slate-300">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <p className="text-xs leading-relaxed">{sug}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* LinkedIn Profile Section Fixes */}
                        {data.linkedinSuggestions && (
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-outfit uppercase tracking-wider text-[11px]">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                                        LinkedIn Profile Enhancements
                                    </h4>
                                    {(!data.linkedinSuggestions.headline && !data.linkedinSuggestions.about && (!data.linkedinSuggestions.experience || data.linkedinSuggestions.experience.length === 0)) && (
                                        <span className="text-[10px] text-amber-500 font-medium">Data currently unavailable</span>
                                    )}
                                </div>
                                
                                <ul className="space-y-3">
                                    {data.linkedinSuggestions.headline && (
                                        <li className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                                <div className="mt-1 p-1 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 text-indigo-600 font-bold text-[8px] uppercase tracking-tighter">Headline</div>
                                                <div>
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">Recommended Headline:</span> 
                                                    <span className="text-slate-700 dark:text-slate-300 italic">"{data.linkedinSuggestions.headline}"</span>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => copyToClipboard(data.linkedinSuggestions.headline!, 'headline')}
                                            >
                                                {copiedId === 'headline' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                                            </Button>
                                        </li>
                                    )}

                                    {data.linkedinSuggestions.about && (
                                        <li className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                                <div className="mt-1 p-1 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 text-indigo-600 font-bold text-[8px] uppercase tracking-tighter">About</div>
                                                <div>
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">Recommended About Section:</span> 
                                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{data.linkedinSuggestions.about}</p>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => copyToClipboard(data.linkedinSuggestions.about!, 'about')}
                                            >
                                                {copiedId === 'about' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                                            </Button>
                                        </li>
                                    )}

                                    {data.linkedinSuggestions.experience?.map((s, idx) => (
                                        <li key={idx} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                                <div className="mt-1 p-1 bg-indigo-50 dark:bg-indigo-900/40 rounded text-indigo-700 dark:text-indigo-400 font-bold text-[8px] uppercase tracking-tighter">Bullet</div>
                                                <div>
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">Experience Fix {idx + 1}:</span> 
                                                    <span className="text-slate-700 dark:text-slate-300">{s}</span>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => copyToClipboard(s, `exp-${idx}`)}
                                            >
                                                {copiedId === `exp-${idx}` ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {data.predictedRoles && data.predictedRoles.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-indigo-500" />
                                    AI-Detected Career Path
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.predictedRoles.map((role, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 italic">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-2 text-[10px] text-slate-400 italic">This AI prediction represents the most likely roles indicated by your current profile content.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
