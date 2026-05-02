import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import {
  Menu,
  Sparkles,
  User,
  LogOut,
  Key,
  Trash2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Modal } from "./ui/modal";
import * as api from "../lib/api";

interface AppShellProps {
  title?: string;
  rightContent?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  title = "PROFILE ANALYZER",
  rightContent,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();

  // Modal States
  const [activeModal, setActiveModal] = useState<
    "edit" | "password" | "delete" | null
  >(null);
  const [loading, setLoading] = useState(false);

  // Form States
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [passForm, setPassForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    if (user?.name) setEditName(user.name);
    if (user?.email) setEditEmail(user.email);
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitEditProfile = async () => {
    if (!editName || !editEmail) {
      showToast("Name and Email are required", "error");
      return;
    }

    if (editName === user?.name && editEmail === user?.email) {
      setActiveModal(null);
      return;
    }

    setLoading(true);
    try {
      const response = await api.updateMe({ name: editName, email: editEmail });
      const updatedUser = response.data.user;

      // Update AuthContext reactively instead of using localStorage + reload
      updateUser(updatedUser);

      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to update profile.",
        "error",
      );
    } finally {
      setLoading(false);
      setActiveModal(null);
    }
  };

  const submitChangePassword = async () => {
    if (!passForm.current || !passForm.new || !passForm.confirm) {
      showToast("Please fill all fields", "error");
      return;
    }
    if (passForm.new !== passForm.confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (passForm.new.length < 6) {
      showToast("New password too short", "error");
      return;
    }

    setLoading(true);
    try {
      await api.updatePassword({
        passwordCurrent: passForm.current,
        password: passForm.new,
      });
      showToast("Password changed successfully!", "success");
      setActiveModal(null);
      setPassForm({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to change password.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.deleteAccount();
      showToast("Account deleted permanently.", "info");
      setTimeout(() => logout(), 1000);
    } catch (err) {
      showToast("Failed to delete account.", "error");
    } finally {
      setLoading(false);
      setActiveModal(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden">
      {sidebarOpen && <Sidebar />}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-50 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen((prev: boolean) => !prev)}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
              >
                <Sparkles className="h-6 w-6" />
                <span>PROFILE ANALYZER</span>
              </Link>
              {title !== "PROFILE ANALYZER" && (
                <>
                  <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden md:block"></span>
                  <span className="text-lg font-semibold hidden md:inline-block text-slate-600 dark:text-slate-400">
                    {title}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {rightContent}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
              >
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-left hidden sm:block mr-1">
                  <p className="text-[10px] font-bold text-slate-400 leading-none uppercase tracking-tighter">
                    Welcome
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight truncate max-w-[80px]">
                    {user?.name || "Account"}
                  </p>
                </div>
                <ChevronDown
                  className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setActiveModal("edit");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => {
                        setActiveModal("password");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Key className="h-4 w-4 text-slate-400" />
                      Change Password
                    </button>

                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-slate-400" />
                      Log out
                    </button>

                    <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setActiveModal("delete");
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>

      {/* --- MODALS --- */}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={activeModal === "edit"}
        onClose={() => setActiveModal(null)}
        title="Edit Profile"
        description="Update your personal information"
        footer={
          <>
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={submitEditProfile}
              className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Your Name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Your Email"
            />
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={activeModal === "password"}
        onClose={() => setActiveModal(null)}
        title="Change Password"
        description="Ensure your account is using a long, random password to stay secure."
        footer={
          <>
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={submitChangePassword}
              className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Update Password
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Password
            </label>
            <input
              type="password"
              value={passForm.current}
              onChange={(e) =>
                setPassForm({ ...passForm, current: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              value={passForm.new}
              onChange={(e) =>
                setPassForm({ ...passForm, new: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passForm.confirm}
              onChange={(e) =>
                setPassForm({ ...passForm, confirm: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        title="Delete Account"
        description="Are you absolutely sure you want to delete your account? This action cannot be undone."
        footer={
          <>
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={submitDeleteAccount}
              className="px-4 py-2 text-sm font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Permanently
            </button>
          </>
        }
      >
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 flex gap-3 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold mb-1">Critical Warning</p>
            <p className="opacity-80">
              All your resume analyses, profile scores, and personal data will
              be purged from our servers immediately.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
