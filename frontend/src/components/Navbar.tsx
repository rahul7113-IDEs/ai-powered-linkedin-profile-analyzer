import { Sparkles, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
        >
          <Sparkles className="h-6 w-6" />
          <span>PROFILE ANALYZER</span>
        </Link>
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link to="/login">
                <Button>Dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
