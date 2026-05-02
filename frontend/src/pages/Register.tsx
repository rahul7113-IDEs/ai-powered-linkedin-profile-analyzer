import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to authentication backend
    console.log("Registration attempt:", { name, email });
    // Simulate successful registration
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300 relative">
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-2xl text-primary mb-8 hover:opacity-80 transition-opacity"
      >
        <Sparkles className="h-8 w-8" />
        <span>PROFILE ANALYZER</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent dark:border-slate-700 dark:focus:ring-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent dark:border-slate-700 dark:focus:ring-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent dark:border-slate-700 dark:focus:ring-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="ml-1 text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
