"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  FileJson,
  MoreHorizontal,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProjectListItem = {
  id: string;
  prompt?: string | null;
  framework?: string | null;
  blockchain?: string | null;
  status?: string | null;
  createdAt?: string | null;
  deploymentUrl?: string | null;
  repoUrl?: string | null;
};

type ProjectTab = "all" | "in_progress" | "deployed";

const defaultColorForStatus = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "DEPLOYED":
      return {
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    case "RUNNING":
    case "PENDING":
      return {
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    default:
      return {
        color: "text-slate-400",
        bg: "bg-white/5",
        border: "border-white/10",
      };
  }
};

const tabConfig: { id: ProjectTab; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "in_progress", label: "In Progress" },
  { id: "deployed", label: "Deployed" },
];

function ProjectMenu({
  projectId,
  onDelete,
}: {
  projectId: string;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 w-44 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                router.push(`/dashboard/projects/${projectId}`);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Project
            </button>
            <div className="border-t border-white/5" />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onDelete(projectId);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmDeleteModal({
  projectName,
  onConfirm,
  onCancel,
  deleting,
}: {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1120] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Delete Project</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">&quot;{projectName}&quot;</span>?
          All generated files, logs, and deployment history will be permanently removed.
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-sm font-bold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const ProjectsList = ({ onCreateNew }: { onCreateNew: () => void }) => {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("og_jwt") : null;
    return token ? { Authorization: `Bearer ${token}` } : ({} as HeadersInit);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects", { headers: getAuthHeaders() });
        if (!res.ok) {
          setProjects([]);
          return;
        }
        const data = await res.json();
        setProjects(data.projects ?? []);
      } catch (err) {
        console.error("Failed to load projects", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getAuthHeaders]);

  const handleDeleteRequest = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const name = project?.prompt?.slice(0, 60) ?? projectId;
    setDeleteTarget({ id: projectId, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }
    } catch (err) {
      console.error("Failed to delete project", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = projects.filter((p) => {
    const upper = (p.status ?? "").toUpperCase();
    if (activeTab === "in_progress") return upper === "PENDING" || upper === "RUNNING" || upper === "DEPLOYING";
    if (activeTab === "deployed") return upper === "DEPLOYED" || upper === "COMPLETED";
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">My Projects</h1>
          <p className="text-sm text-slate-400">
            Manage all your projects and deployments.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex items-center gap-8 border-b border-white/5 mb-8 overflow-x-auto pb-px">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-bold pb-4 relative transition-colors ${
              activeTab === tab.id ? "text-purple-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        ))}
        <button
          onClick={() => router.push("/dashboard/templates")}
          className="text-sm font-bold pb-4 relative transition-colors text-slate-400 hover:text-white"
        >
          Templates
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading projects…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileJson className="w-10 h-10 text-slate-600 mb-4" />
            <p className="text-sm font-bold text-slate-400 mb-1">
              {activeTab === "all"
                ? "No projects found"
                : `No ${tabConfig.find((t) => t.id === activeTab)?.label.toLowerCase()} projects`}
            </p>
            <p className="text-xs text-slate-600">Create a new project to get started.</p>
          </div>
        ) : (
          filtered.map((project, i) => {
            const name = project.prompt ?? project.id;
            const date = project.createdAt
              ? new Date(project.createdAt).toLocaleDateString()
              : "";
            const stack = [
              project.blockchain ?? "OG Chain",
              project.framework ?? "Next.js",
              "TypeScript",
            ].filter(Boolean);
            const colors = defaultColorForStatus(project.status ?? undefined);
            return (
              <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-[#0B1120] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-6 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-purple-500/20 shrink-0">
                      <FileJson className="w-6 h-6 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
                        {name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {project.repoUrl ? "Connected repo" : ""}
                      </p>
                      <div className="flex items-center gap-3">
                        {stack.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-2 ${colors.bg} ${colors.color} border ${colors.border}`}
                      >
                        {project.status &&
                        project.status.toUpperCase() === "DEPLOYED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {project.status ?? "Unknown"}
                      </div>
                      <p className="text-[10px] text-slate-500">{date}</p>
                    </div>
                    <ProjectMenu
                      projectId={project.id}
                      onDelete={handleDeleteRequest}
                    />
                  </div>
                </motion.div>
              </Link>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDeleteModal
            projectName={deleteTarget.name}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
            deleting={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
