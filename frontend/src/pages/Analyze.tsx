import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  UploadCloud,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { analyzeProfile, uploadResume, extractTextFromImage } from "@/lib/api";
import { AnalysisResult } from "@/components/AnalysisResult";

interface AnalysisResponse {
  message: string;
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
    createdAt: string;
  };
}

export default function Analyze() {
  const [profileText, setProfileText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeProfile({
        text: profileText,
        targetRole: targetRole || undefined,
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze profile. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1MB Size Limit Validation
    if (file.size > 1 * 1024 * 1024) {
      setError("File size too large. Please upload a PDF under 1MB.");
      // Clear the input value so the same file can be selected again
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadResume(file);
      setProfileText(response.text);
      // Clear any previous results when new text is uploaded
      setResult(null);
    } catch (err) {
      console.error(err);
      setError("Failed to extract text from resume. Please try again.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valid formats
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PNG or JPEG image.");
      event.target.value = "";
      return;
    }

    // 2MB Size Limit for Images
    if (file.size > 2 * 1024 * 1024) {
      setError("Image too large. Please upload an image under 2MB.");
      event.target.value = "";
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const response = await extractTextFromImage(file);
      setProfileText(response.text);
      setResult(null);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to extract text from image. Please ensure Tesseract is installed on the server.",
      );
    } finally {
      setIsExtracting(false);
      event.target.value = "";
    }
  };

  return (
    <AppShell title="PROFILE ANALYZER">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 select-none cursor-default">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Optimize Your Profile
          </h2>
          <p className="text-slate-500">
            Paste your LinkedIn profile or upload your resume to get instant,
            AI-powered feedback.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="shadow-lg border-primary/20 h-fit">
              <form onSubmit={handleAnalyze}>
                <CardHeader className="select-none cursor-default">
                  <CardTitle>Text Input</CardTitle>
                  <CardDescription>
                    Paste your LinkedIn sections (Headline, About, Experience)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Role</label>
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g. Full Stack Developer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Profile Content
                    </label>
                    <textarea
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Paste your LinkedIn headline, summary, and experience here..."
                      required
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="pb-6">
                  <Button
                    type="submit"
                    className="w-full select-none cursor-pointer active:scale-[0.98] transition-all"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing
                      ? "Analyzing Profile..."
                      : "Analyze Profile Text"}
                    {!isAnalyzing && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="bg-indigo-50 dark:bg-indigo-950/20 border-none select-none cursor-default">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                      Pro Tip
                    </h4>
                    <p className="text-sm text-indigo-700/80 dark:text-indigo-300">
                      Include both your headline and about section for the most
                      accurate keyword analysis. Don't forget to specify your
                      target role!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6 h-full">
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors flex-1 flex flex-col">
              <CardContent className="flex-1 p-10 text-center flex flex-col items-center justify-center space-y-4 select-none cursor-default">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Upload Resume</h3>
                  <p className="text-sm text-slate-500 mb-1">
                    Extract your resume text to analyze it below.
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full inline-block">
                    Supports PDF up to 1MB
                  </p>
                </div>
                <label className="inline-flex items-center justify-center pt-2">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                  <Button
                    variant="outline"
                    disabled={isUploading}
                    className="pointer-events-none"
                  >
                    {isUploading ? "Uploading..." : "Choose PDF File"}
                  </Button>
                </label>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-primary/20 hover:border-primary/50 transition-colors bg-primary/5 dark:bg-primary/10 flex-1 flex flex-col">
              <CardContent className="flex-1 p-10 text-center flex flex-col items-center justify-center space-y-4 select-none cursor-default">
                <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Extract from Image (OCR)
                  </h3>
                  <p className="text-sm text-slate-500 mb-1">
                    Upload a screenshot of your LinkedIn profile.
                  </p>
                  <p className="text-[10px] text-primary font-medium bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full inline-block">
                    Supports PNG, JPG up to 2MB
                  </p>
                </div>
                <label className="inline-flex items-center justify-center pt-2 select-none cursor-pointer group w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isExtracting}
                  />
                  <Button
                    variant="outline"
                    disabled={isExtracting}
                    className="pointer-events-none border-primary/20 text-primary hover:bg-primary/10 w-full select-none"
                  >
                    {isExtracting ? "Extracting Text..." : "Choose Image File"}
                  </Button>
                </label>
              </CardContent>
            </Card>
          </div>
        </div>
        {(error || result) && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 shadow-sm">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {result && result.data && (
              <div className="space-y-8 select-none cursor-default">
                <AnalysisResult data={result.data} />

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResult(null);
                      setProfileText("");
                    }}
                    className="w-full sm:w-auto"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Analyze New Profile
                  </Button>
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto">
                      View History in Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
