"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import {
  buildGenerationPhases,
  deriveProjectStack,
  getCurrentGenerationPhase,
} from "@/src/lib/project-generation";

const WebContainerPreview = dynamic(
  () =>
    import("@/components/Dashboard/Projects/WebContainerPreview").then(
      (m) => m.WebContainerPreview,
    ),
  { ssr: false },
);
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  ExternalLink,
  GitBranch,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Globe,
  Code2,
  Terminal,
  Maximize2,
  Copy,
  Check,
  Rocket,
  Monitor,
  FlaskConical,
} from "lucide-react";

import { Highlight, themes } from "prism-react-renderer";

interface AgentExecution {
  id: string;
  node: string;
  status: string;
  log: string | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

interface LiveActivityEvent {
  id: string;
  kind: "node" | "file" | "system";
  line: string;
}

interface Project {
  id: string;
  prompt: string;
  framework: string | null;
  blockchain: string | null;
  template?: string | null;
  status: string;
  repoUrl: string | null;
  deploymentUrl: string | null;
  memoryHash: string | null;
  createdAt: string;
  executions: AgentExecution[];
}

type ActiveTab = "preview" | "sandbox" | "code" | "logs";

const FILE_ICONS: Record<string, React.ReactNode> = {
  tsx: <FileCode2 className="w-3.5 h-3.5 text-blue-400" />,
  ts: <FileCode2 className="w-3.5 h-3.5 text-blue-400" />,
  jsx: <FileCode2 className="w-3.5 h-3.5 text-amber-400" />,
  js: <FileCode2 className="w-3.5 h-3.5 text-amber-400" />,
  sol: <FileCode2 className="w-3.5 h-3.5 text-purple-400" />,
  json: <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />,
  md: <FileText className="w-3.5 h-3.5 text-slate-400" />,
  css: <FileCode2 className="w-3.5 h-3.5 text-pink-400" />,
};

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return (
    FILE_ICONS[ext] ?? <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
  );
}

function buildFileTree(files: string[]) {
  const tree: Record<string, string[]> = { "": [] };
  for (const file of files) {
    const parts = file.split("/");
    if (parts.length === 1) {
      tree[""].push(file);
    } else {
      const dir = parts[0];
      if (!tree[dir]) tree[dir] = [];
      tree[dir].push(parts.slice(1).join("/"));
    }
  }
  return tree;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  PENDING: { label: "Queued", color: "text-amber-400", dot: "bg-amber-400" },
  RUNNING: {
    label: "Generating",
    color: "text-blue-400",
    dot: "bg-blue-400 animate-pulse",
  },
  COMPLETED: {
    label: "Generated",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  DEPLOYING: {
    label: "Deploying",
    color: "text-purple-400",
    dot: "bg-purple-400 animate-pulse",
  },
  DEPLOYED: {
    label: "Live",
    color: "text-emerald-400",
    dot: "bg-emerald-400 animate-pulse",
  },
  FAILED: { label: "Failed", color: "text-red-400", dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const PHASE_STYLES = {
  completed: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    ring: "border-emerald-500/20 bg-emerald-500/5",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    label: "Completed",
  },
  running: {
    icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
    ring: "border-blue-500/20 bg-blue-500/5",
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    label: "Running",
  },
  failed: {
    icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    ring: "border-red-500/20 bg-red-500/5",
    badge: "text-red-400 bg-red-500/10 border-red-500/20",
    label: "Failed",
  },
  skipped: {
    icon: <ChevronRight className="w-4 h-4 text-amber-400" />,
    ring: "border-amber-500/20 bg-amber-500/5",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    label: "Skipped",
  },
  pending: {
    icon: <ChevronRight className="w-4 h-4 text-slate-500" />,
    ring: "border-white/5 bg-[#0B1120]",
    badge: "text-slate-400 bg-white/5 border-white/10",
    label: "Pending",
  },
} as const;

export default function ProjectCockpit() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const selectedFileRef = useRef<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>("sandbox");
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [liveExecutions, setLiveExecutions] = useState<AgentExecution[]>([]);
  const [activityFeed, setActivityFeed] = useState<LiveActivityEvent[]>([]);
  const [workerStalled, setWorkerStalled] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const seenFileEventsRef = useRef<Set<string>>(new Set());
  const receivedFirstEventRef = useRef(false);
  // Prevents re-fetching all file contents on every SSE replay after reconnect
  const filesInitializedRef = useRef(false);

  const getAuthHeader = useCallback((): HeadersInit => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("og_jwt") : null;
    return token ? { Authorization: `Bearer ${token}` } : ({} as HeadersInit);
  }, []);

  const jwt =
    typeof window !== "undefined" ? localStorage.getItem("og_jwt") : null;

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setProject(data.project);
    } catch {
      console.log("Failed to fetch project");
    }
  }, [projectId, getAuthHeader]);

  const fetchFiles = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/files`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) return;
      const data = await res.json();
      const fileList: string[] = data.files ?? [];
      setFiles(fileList);

      const contents: Record<string, string> = {};
      await Promise.all(
        fileList.map(async (path) => {
          try {
            const encoded = encodeURIComponent(path);
            const r = await fetch(
              `/api/projects/${projectId}/files?file=${encoded}`,
              { headers: getAuthHeader() },
            );
            if (r.ok) {
              const d = await r.json();
              contents[path] = d.content ?? "";
            }
          } catch {
            console.log(`Failed to fetch content for file ${path}`);
          }
        }),
      );
      setFileContents(contents);
    } catch {
      console.log("Failed to fetch files");
    }
  }, [projectId, getAuthHeader]);

  const loadFileContent = async (filePath: string) => {
    setSelectedFile(filePath);
    setFileContent("");
    try {
      const encoded = encodeURIComponent(filePath);
      const res = await fetch(
        `/api/projects/${projectId}/files?file=${encoded}`,
        {
          headers: getAuthHeader(),
        },
      );
      if (!res.ok) return;
      const data = await res.json();
      setFileContent(data.content ?? "");
    } catch {
      setFileContent("// Error loading file");
    }
  };

  const downloadFile = (filename: string) => {
    const content = fileContents[filename] ?? fileContent;
    const blob = new Blob([content ?? ""], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.split("/").pop() ?? "file.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadProjectZip = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const path of files) {
        const content = fileContents[path] ?? "";
        zip.file(path, content);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectId || "project"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP download failed", err);
      alert(
        "Failed to create ZIP in browser. Try downloading files individually.",
      );
    }
  };

  const openInRemix = async (filename: string) => {
    const content = fileContents[filename] ?? fileContent;
    if (!content) return alert("No file content to open");

    try {
      await navigator.clipboard.writeText(content);
      window.open("https://remix.ethereum.org", "_blank");
      alert(
        "Contract content copied to clipboard. Paste into Remix (Ctrl+V / Cmd+V).",
      );
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
      window.open("https://remix.ethereum.org", "_blank");
    }
  };

  const triggerDeploy = async () => {
    setDeploying(true);
    setDeployError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeployError(data.error?.message ?? "Deployment failed");
      } else {
        await fetchProject();
        setActiveTab("preview");
        setPreviewKey((k) => k + 1);
      }
    } catch {
      setDeployError("Network error — please try again");
    } finally {
      setDeploying(false);
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  useEffect(() => {
    void (async () => {
      await fetchProject();
      await fetchFiles();
    })();
  }, [fetchProject, fetchFiles]);

  // Derived stable value — SSE effect only re-runs when STATUS changes,
  // not on every 5s project poll that updates other fields.
  const projectStatus = project?.status ?? null;

  useEffect(() => {
    if (!projectStatus || !projectId) return;

    const isActive = ["PENDING", "RUNNING", "DEPLOYING"].includes(projectStatus);
    if (!isActive) return;

    // Reset per-session refs when starting a fresh SSE session
    filesInitializedRef.current = false;
    seenFileEventsRef.current = new Set();
    receivedFirstEventRef.current = false;

    const sseUrl = jwt
      ? `/api/stream?projectId=${projectId}&token=${encodeURIComponent(jwt)}`
      : `/api/stream?projectId=${projectId}`;

    const es = new EventSource(sseUrl);

    // If no SSE event arrives within 35s on a PENDING project, the worker
    // is probably not running.
    const stalledTimer = setTimeout(() => {
      if (!receivedFirstEventRef.current) {
        setWorkerStalled(true);
      }
    }, 35_000);

    es.onmessage = (e) => {
      receivedFirstEventRef.current = true;
      setWorkerStalled(false);
      try {
        const data = JSON.parse(e.data);

        if (
          typeof data.status === "string" &&
          data.status.startsWith("NODE_STARTED:")
        ) {
          const nodeName = data.status.replace("NODE_STARTED:", "");
          const startedAt =
            typeof data.payload?.startedAt === "string"
              ? data.payload.startedAt
              : new Date().toISOString();

          setLiveExecutions((prev) => {
            const rest = prev.filter((entry) => entry.node !== nodeName);
            return [
              ...rest,
              {
                id: `live-${nodeName}`,
                node: nodeName,
                status: "RUNNING",
                log: null,
                error: null,
                startedAt,
                completedAt: null,
              },
            ];
          });

          setActivityFeed((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${nodeName}-start`,
              kind: "node",
              line: `$ starting ${nodeName}`,
            },
          ]);
          return;
        }

        if (
          typeof data.status === "string" &&
          data.status.startsWith("NODE_COMPLETED:")
        ) {
          const nodeName = data.status.replace("NODE_COMPLETED:", "");
          const completedAt = new Date().toISOString();

          setLiveExecutions((prev) => {
            const existing = prev.find((entry) => entry.node === nodeName);
            const rest = prev.filter((entry) => entry.node !== nodeName);
            return [
              ...rest,
              {
                id: existing?.id ?? `live-${nodeName}`,
                node: nodeName,
                status: data.payload?.error ? "FAILED" : "COMPLETED",
                log:
                  typeof data.payload?.status === "string"
                    ? data.payload.status
                    : existing?.log ?? null,
                error:
                  typeof data.payload?.error === "string"
                    ? data.payload.error
                    : null,
                startedAt: existing?.startedAt ?? completedAt,
                completedAt,
              },
            ];
          });

          setActivityFeed((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${nodeName}-done`,
              kind: "node",
              line: data.payload?.error
                ? `✖ ${nodeName} failed`
                : `✔ ${nodeName} completed`,
            },
          ]);

          fetchProject();
          return;
        }

        if (data.status === "PROJECT_INIT_STARTED") {
          setActivityFeed((prev) => [
            ...prev,
            {
              id: `${Date.now()}-init-start`,
              kind: "system",
              line: "$ initializing project scaffold",
            },
          ]);
          return;
        }

        if (data.status === "PROJECT_INIT_COMPLETED") {
          setActivityFeed((prev) => [
            ...prev,
            {
              id: `${Date.now()}-init-done`,
              kind: "system",
              line: "✔ scaffold ready",
            },
          ]);
          // Guard: only fetch files once per SSE session.  Without this,
          // every reconnect replays PROJECT_INIT_COMPLETED from the buffer,
          // causing a storm of 12+ parallel file API calls.
          if (!filesInitializedRef.current) {
            filesInitializedRef.current = true;
            fetchFiles();
          }
          return;
        }

        if (data.status === "WORKFLOW_CONFIG_ERROR") {
          const errMsg =
            typeof data.payload?.error === "string"
              ? data.payload.error
              : "Compute service is not configured. Set ZERO_G_API_KEY and ZERO_G_API_URL in your .env file.";
          setDeployError(errMsg);
          setActivityFeed((prev) => [
            ...prev,
            {
              id: `${Date.now()}-config-error`,
              kind: "system",
              line: `✖ Config error: ${errMsg}`,
            },
          ]);
          fetchProject();
          return;
        }

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          fetchProject();
          fetchFiles();
          return;
        }

        if (data.status === "FILE_LINE") {
          const payload = data.payload || {};
          const filePath = payload.path || "";
          const line = typeof payload.line === "string" ? payload.line : "";

          if (!filePath) return;

          if (!seenFileEventsRef.current.has(filePath)) {
            seenFileEventsRef.current.add(filePath);
            setActivityFeed((prev) => [
              ...prev,
              {
                id: `${Date.now()}-${filePath}`,
                kind: "file",
                line: `+ ${filePath}`,
              },
            ]);
          }

          setFiles((prev) => {
            if (prev.includes(filePath)) return prev;
            return [...prev, filePath];
          });

          setFileContents((prev) => {
            const prevContent = prev[filePath] ?? "";
            const nextContent =
              prevContent === "" ? line : `${prevContent}\n${line}`;
            return { ...prev, [filePath]: nextContent };
          });

          setFileContent((prev) => {
            if (selectedFileRef.current !== filePath) return prev;
            return prev === "" ? line : `${prev}\n${line}`;
          });

          return;
        }
      } catch {
        console.error("Failed to parse SSE message:", e.data);
      }
    };

    es.onerror = () => {
      // Don't close — EventSource auto-reconnects. The stalled timer and
      // replay buffer handle catching up.
    };

    const poll = setInterval(fetchProject, 5000);

    return () => {
      clearTimeout(stalledTimer);
      es.close();
      clearInterval(poll);
    };
  // NOTE: `projectStatus` not `project` — prevents the SSE from closing and
  // reopening on every 5s poll that updates non-status project fields.
  }, [projectStatus, projectId, jwt, fetchProject, fetchFiles]);

  const executionsForUi = React.useMemo(() => {
    const byNode = new Map<string, AgentExecution>();

    for (const execution of project?.executions ?? []) {
      byNode.set(execution.node, execution);
    }

    for (const execution of liveExecutions) {
      byNode.set(execution.node, execution);
    }

    return Array.from(byNode.values()).sort((a, b) =>
      a.startedAt.localeCompare(b.startedAt),
    );
  }, [project?.executions, liveExecutions]);

  const fileTree = buildFileTree(files);

  const toggleDir = (dir: string) => {
    setExpandedDirs((prev) => ({ ...prev, [dir]: !prev[dir] }));
  };

  const projectTags = [
    project?.framework ?? "Next.js",
    project?.blockchain ?? "0G Chain",
    "TypeScript",
  ].filter(Boolean);
  const stackProfile = deriveProjectStack({
    prompt: project?.prompt,
    template: project?.template,
    framework: project?.framework,
    blockchain: project?.blockchain,
  });
  const generationPhases = buildGenerationPhases({
    prompt: project?.prompt,
    template: project?.template,
    framework: project?.framework,
    blockchain: project?.blockchain,
    status: project?.status,
    filesCount: files.length,
    executions: executionsForUi,
  });
  const currentPhase = getCurrentGenerationPhase({
    prompt: project?.prompt,
    template: project?.template,
    framework: project?.framework,
    blockchain: project?.blockchain,
    status: project?.status,
    filesCount: files.length,
    executions: executionsForUi,
  });
  const isGenerationActive =
    project?.status === "PENDING" || project?.status === "RUNNING";

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />

      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/5 bg-[#050816]/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
            <span className="hover:text-white cursor-pointer transition-colors">
              Projects
            </span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white truncate max-w-xs">
              {project?.prompt.slice(0, 40) ?? "Loading…"}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-white truncate max-w-lg">
                  {project?.prompt ?? "Loading…"}
                </h1>
                {project && <StatusBadge status={project.status} />}
              </div>
              <div className="flex items-center gap-2">
                {projectTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-300 text-[10px] font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {isGenerationActive && currentPhase && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span className="text-white font-semibold">
                    {currentPhase.title}
                  </span>
                  <span className="text-slate-500">
                    {currentPhase.description}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {project?.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#0B1120] hover:bg-white/5 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  Repo
                </a>
              )}
              {project?.deploymentUrl && (
                <a
                  href={project.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#0B1120] hover:bg-white/5 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Live
                </a>
              )}
              {project &&
                project.status !== "DEPLOYED" &&
                project.status !== "DEPLOYING" && (
                  <button
                    onClick={triggerDeploy}
                    disabled={
                      deploying ||
                      project.status === "PENDING" ||
                      project.status === "RUNNING"
                    }
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deploying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Rocket className="w-3.5 h-3.5" />
                    )}
                    {deploying ? "Deploying…" : "Deploy to Vercel"}
                  </button>
                )}
              {project?.status === "DEPLOYING" && (
                <div className="px-5 py-2 rounded-xl bg-purple-600/20 border border-purple-500/20 text-purple-400 text-xs font-bold flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deploying…
                </div>
              )}
            </div>
          </div>

          {workerStalled && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                <strong>Worker not running.</strong> The generation queue is
                processing no jobs. Start the worker in a second terminal:{" "}
                <code className="font-mono bg-black/30 px-1 rounded">
                  npm run dev:worker
                </code>
              </span>
            </motion.div>
          )}

          {deployError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {deployError}
            </motion.div>
          )}
        </div>

        {/* Cockpit workspace */}
        <div className="flex-1 overflow-hidden flex">
          {/* File Explorer */}
          <div className="w-60 border-r border-white/5 bg-[#070d1a] flex flex-col shrink-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Files
              </span>
              <button
                onClick={fetchFiles}
                className="text-slate-600 hover:text-slate-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {files.length === 0 ? (
                <div className="px-3 py-8 text-center text-slate-600 text-xs">
                  {project?.status === "PENDING" ||
                  project?.status === "RUNNING"
                    ? "Generating files…"
                    : "No files yet"}
                </div>
              ) : (
                <>
                  {/* Folders first */}
                  {Object.entries(fileTree)
                    .filter(([dir]) => dir !== "")
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([dir, dirFiles]) => (
                      <div key={dir}>
                        <button
                          onClick={() => toggleDir(dir)}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
                        >
                          {expandedDirs[dir] ? (
                            <>
                              <ChevronDown className="w-3 h-3 shrink-0 text-slate-500" />
                              <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-3 h-3 shrink-0 text-slate-500" />
                              <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            </>
                          )}
                          <span>{dir}</span>
                        </button>

                        {expandedDirs[dir] && (
                          <div className="ml-4 space-y-0.5 mt-0.5">
                            {dirFiles.map((file) => {
                              const fullPath = `${dir}/${file}`;
                              return (
                                <button
                                  key={fullPath}
                                  onClick={() => loadFileContent(fullPath)}
                                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                                    selectedFile === fullPath
                                      ? "bg-purple-500/15 text-white border border-purple-500/20"
                                      : "text-slate-500 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {getFileIcon(file)}
                                  <span className="truncate">{file}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Root-level files after folders */}
                  {(fileTree[""] ?? []).sort((a, b) => a.localeCompare(b)).map((file) => (
                    <button
                      key={file}
                      onClick={() => loadFileContent(file)}
                      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        selectedFile === file
                          ? "bg-purple-500/15 text-white border border-purple-500/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {getFileIcon(file)}
                      <span className="truncate">{file}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Main panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center border-b border-white/5 bg-[#070d1a] px-4 gap-1">
              {[
                {
                  id: "sandbox",
                  icon: <FlaskConical className="w-3.5 h-3.5" />,
                  label: "Sandbox",
                  badge: "LIVE" as const,
                },
                {
                  id: "preview",
                  icon: <Monitor className="w-3.5 h-3.5" />,
                  label: "Deployed",
                },
                {
                  id: "code",
                  icon: <Code2 className="w-3.5 h-3.5" />,
                  label: "Code",
                },
                {
                  id: "logs",
                  icon: <Terminal className="w-3.5 h-3.5" />,
                  label: "Agent Logs",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-purple-500 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {"badge" in tab && tab.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2 pr-2">
                <button
                  onClick={downloadProjectZip}
                  className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#0B1120] hover:bg-white/5 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download ZIP
                </button>
                {project?.deploymentUrl && activeTab === "preview" && (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-mono max-w-xs truncate">
                      <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{project.deploymentUrl}</span>
                    </div>
                    <button
                      onClick={() => copyUrl(project.deploymentUrl!)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={project.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setPreviewKey((k) => k + 1)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "sandbox" && (
                  <motion.div
                    key="sandbox"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <WebContainerPreview
                      files={fileContents}
                      projectId={projectId}
                      template={project?.template ?? null}
                      framework={project?.framework ?? null}
                      blockchain={project?.blockchain ?? null}
                      activityFeed={activityFeed}
                    />
                  </motion.div>
                )}

                {activeTab === "preview" && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    {project?.deploymentUrl ? (
                      <iframe
                        key={previewKey}
                        ref={iframeRef}
                        src={project.deploymentUrl}
                        className="w-full h-full border-0 bg-white"
                        title="Live Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-center p-8">
                        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          <Rocket className="w-9 h-9 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">
                            No Live Preview Yet
                          </h3>
                          {project?.status === "COMPLETED" ? (
                            <p className="text-sm text-slate-400 max-w-sm">
                              Your project is ready. Connect GitHub + Vercel in{" "}
                              <a
                                href="/dashboard/settings"
                                className="text-purple-400 hover:underline"
                              >
                                Integrations
                              </a>{" "}
                              then click{" "}
                              <span className="text-white font-semibold">
                                Deploy to Vercel
                              </span>
                              .
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400 max-w-sm">
                              {project?.status === "PENDING" ||
                              project?.status === "RUNNING"
                                ? "Your project is being generated. Preview will be available after deployment."
                                : "Deploy your project to see it live here."}
                            </p>
                          )}
                        </div>
                        {project?.status === "COMPLETED" && (
                          <button
                            onClick={triggerDeploy}
                            disabled={deploying}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {deploying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Rocket className="w-4 h-4" />
                            )}
                            {deploying ? "Deploying…" : "Deploy Now"}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "code" && (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col"
                  >
                    {selectedFile ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-[#070d1a]">
                          {getFileIcon(selectedFile)}
                          <span className="text-xs text-slate-300 font-mono">
                            {selectedFile}
                          </span>
                          <div className="ml-auto flex items-center gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    fileContent || "",
                                  );
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                } catch {
                                  alert("Copy failed");
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                            >
                              {copied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => downloadFile(selectedFile!)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {selectedFile?.endsWith(".sol") && (
                              <button
                                onClick={() => openInRemix(selectedFile)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={downloadProjectZip}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          {fileContent ? (
                            <Highlight
                              theme={themes.vsDark}
                              code={fileContent}
                              language={
                                (selectedFile?.split(".").pop() || "") as string
                              }
                            >
                              {({
                                className,
                                style,
                                tokens,
                                getLineProps,
                                getTokenProps,
                              }) => (
                                <pre
                                  className={`${className} p-6 text-xs font-mono rounded-b-lg`}
                                  style={{ ...style, whiteSpace: "pre" }}
                                >
                                  {tokens.map((line, i) => (
                                    <div
                                      key={i}
                                      {...getLineProps({ line })}
                                    >
                                      {line.map((token, key) => (
                                        <span
                                          key={key}
                                          {...getTokenProps({ token })}
                                        />
                                      ))}
                                    </div>
                                  ))}
                                </pre>
                              )}
                            </Highlight>
                          ) : (
                            <div className="p-6 text-slate-600">Loading…</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                        <div className="text-center">
                          <Code2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>Select a file from the explorer</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "logs" && (
                  <motion.div
                    key="logs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full overflow-y-auto p-6 space-y-3"
                  >
                    {!generationPhases.length ? (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        <div className="text-center">
                          <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>No agent logs yet</p>
                        </div>
                      </div>
                    ) : (
                      generationPhases.map((phase) => {
                        const phaseStyle = PHASE_STYLES[phase.state];
                        const timestamp = phase.completedAt ?? phase.startedAt;

                        return (
                        <div
                          key={phase.id}
                          className={`border rounded-2xl p-5 transition-colors ${phaseStyle.ring}`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              {phaseStyle.icon}
                              <div>
                                <div className="text-sm font-bold text-white">
                                  {phase.title}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {phase.description}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${phaseStyle.badge}`}
                              >
                                {phaseStyle.label}
                              </span>
                              {timestamp && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(timestamp).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {phase.log && (
                            <pre className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap bg-black/30 rounded-lg p-3 mt-2 max-h-40 overflow-y-auto">
                              {phase.log}
                            </pre>
                          )}
                          {phase.error && (
                            <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-3 font-mono">
                              {phase.error}
                            </div>
                          )}
                          {phase.state === "running" && !phase.log && (
                            <div className="mt-2 text-xs text-slate-400 bg-black/20 rounded-lg p-3">
                              {phase.title === stackProfile.labels.initialization
                                ? "Scaffolding the project foundation and waiting for generated files to stream in."
                                : "This phase is currently in progress."}
                            </div>
                          )}
                        </div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
