import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Target,
  BarChart,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-4 py-24 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI-Powered LinkedIn & Resume Analysis
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Optimize Your LinkedIn Profile with AI
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Analyze your LinkedIn profile and discover how to stand out to
            recruiters. Get a detailed score, keyword suggestions, and
            AI-generated improvements in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full text-base group"
                    variant="default"
                  >
                    Analyze
                    <Sparkles className="ml-2 h-4 w-4 animate-pulse text-indigo-200" />
                  </Button>
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full text-base group"
                    variant="outline"
                  >
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/analyze" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full text-base group"
                    variant="default"
                  >
                    Analyze Now
                    <Sparkles className="ml-2 h-4 w-4 animate-pulse text-indigo-200" />
                  </Button>
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full text-base group"
                    variant="outline"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-16">
              How it works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="border-none shadow-lg bg-slate-50 dark:bg-slate-950 hover:-translate-y-2 transition-all duration-300 group hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600">
                <CardContent className="pt-8">
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors duration-300">
                    AI Profile Scoring
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-50 transition-colors duration-300">
                    Get an instant score out of 100 based on your headline
                    strength, experience impact, and skills match.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-none shadow-lg bg-slate-50 dark:bg-slate-950 hover:-translate-y-2 transition-all duration-300 group hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600">
                <CardContent className="pt-8">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors duration-300">
                    Keyword Gap Analysis
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-50 transition-colors duration-300">
                    Discover missing ATS keywords for your target role and
                    increase your visibility to technical recruiters.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-none shadow-lg bg-slate-50 dark:bg-slate-950 hover:-translate-y-2 transition-all duration-300 group hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600">
                <CardContent className="pt-8">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors duration-300">
                    AI Suggestions
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-50 transition-colors duration-300">
                    Let AI rewrite your headline and experience section to be
                    more engaging and recruiter-friendly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
        >
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">About PROFILE ANALYZER</h2>
            <p className="text-lg text-indigo-50 mb-8 leading-relaxed">
              Profile Analyzer was built to bridge the gap between talented
              professionals and the applicant tracking systems (ATS) that often
              filter them out. Our AI-driven engine analyzes your LinkedIn
              profile or resume against industry standards, identifying missing
              keywords and formatting issues that could be holding you back.
              With actionable insights and AI-generated suggestions, we empower
              you to present your best professional self and land the interviews
              you deserve.
            </p>
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm shadow-sm border border-white/20">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl font-extrabold">10k+</span>
                <span className="text-sm font-medium text-indigo-100 uppercase tracking-wider">
                  Profiles Analyzed
                </span>
              </div>
              <div className="w-px h-12 bg-white/20 mx-8"></div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl font-extrabold">85%</span>
                <span className="text-sm font-medium text-indigo-100 uppercase tracking-wider">
                  Success Rate
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AI LinkedIn Profile Analyzer.</p>
        </div>
      </footer>
    </div>
  );
}
