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
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.login({ email, password });
      login(response.data.user, response.token);
    } catch (err:any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mb-4">
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-4 scale-110">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            PROFILE ANALYZER
          </h1>
          <p className="text-slate-500 mt-2">
            Welcome back! Sign in to your account.
          </p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full h-11 rounded-xl shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              <p className="text-sm text-center text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary font-bold hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
