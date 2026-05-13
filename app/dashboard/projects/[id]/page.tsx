"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { ProjectSidebar } from "@/components/Dashboard/Projects/ProjectSidebar";

const WebContainerPreview = dynamic(
  () =>
    import("@/components/Dashboard/Projects/WebContainerPreview").then(
      (m) => m.WebContainerPreview
    ),
  { ssr: false }
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

interface AgentExecution {
  id: string;
  node: string;
  status: string;
  log: string | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

interface Project {
  id: string;
  prompt: string;
  framework: string | null;
  blockchain: string | null;
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
  return FILE_ICONS[ext] ?? <FileCode2 className="w-3.5 h-3.5 text-slate-400" />;
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

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: { label: "Queued", color: "text-amber-400", dot: "bg-amber-400" },
  RUNNING: { label: "Generating", color: "text-blue-400", dot: "bg-blue-400 animate-pulse" },
  COMPLETED: { label: "Generated", color: "text-emerald-400", dot: "bg-emerald-400" },
  DEPLOYING: { label: "Deploying", color: "text-purple-400", dot: "bg-purple-400 animate-pulse" },
  DEPLOYED: { label: "Live", color: "text-emerald-400", dot: "bg-emerald-400 animate-pulse" },
  FAILED: { label: "Failed", color: "text-red-400", dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function ProjectCockpit() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>("sandbox");
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const jwtRef = useRef<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("og_jwt") : null
  );
  const jwt = jwtRef.current;

  const getAuthHeader = useCallback(
    () => (jwtRef.current ? { Authorization: `Bearer ${jwtRef.current}` } : {}),
    []
  );

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
      // silent
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
              { headers: getAuthHeader() }
            );
            if (r.ok) {
              const d = await r.json();
              contents[path] = d.content ?? "";
            }
          } catch {
            // skip
          }
        })
      );
      setFileContents(contents);
    } catch {
      // silent
    }
  }, [projectId, getAuthHeader]);

  const loadFileContent = async (filePath: string) => {
    setSelectedFile(filePath);
    setFileContent("");
    try {
      const encoded = encodeURIComponent(filePath);
      const res = await fetch(`/api/projects/${projectId}/files?file=${encoded}`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setFileContent(data.content ?? "");
    } catch {
      setFileContent("// Error loading file");
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
    void (async () => {
      await fetchProject();
      await fetchFiles();
    })();
  }, [fetchProject, fetchFiles]);

  useEffect(() => {
    if (!project || !projectId) return;

    const isActive = ["PENDING", "RUNNING", "DEPLOYING"].includes(project.status);
    if (!isActive) return;


    // SSE for real-time agent events
    const sseUrl = jwt
      ? `/api/stream?projectId=${projectId}&token=${encodeURIComponent(jwt)}`
      : `/api/stream?projectId=${projectId}`;

    const es = new EventSource(sseUrl);

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (
          event.type === "node_complete" ||
          event.type === "workflow_complete" ||
          event.type === "node_start"
        ) {
          fetchProject();
          if (event.type === "workflow_complete") {
            fetchFiles();
          }
        }
      } catch {
        // malformed event
      }
    };

    es.onerror = () => es.close();

    // Light fallback poll every 5s
    const poll = setInterval(fetchProject, 5000);

    return () => {
      es.close();
      clearInterval(poll);
    };
  }, [project?.status, projectId, jwt, fetchProject, fetchFiles]);

  const fileTree = buildFileTree(files);

  const toggleDir = (dir: string) => {
    setExpandedDirs((prev) => ({ ...prev, [dir]: !prev[dir] }));
  };

  const projectTags = [
    project?.framework ?? "Next.js",
    project?.blockchain ?? "0G Chain",
    "TypeScript",
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />

      <ProjectSidebar />

      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/5 bg-[#050816]/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
            <span className="hover:text-white cursor-pointer transition-colors">Projects</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white truncate max-w-xs">{project?.prompt.slice(0, 40) ?? "Loading…"}</span>
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
                  <span key={tag} className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-300 text-[10px] font-bold">
                    {tag}
                  </span>
                ))}
              </div>
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
              {project && project.status !== "DEPLOYED" && project.status !== "DEPLOYING" && (
                <button
                  onClick={triggerDeploy}
                  disabled={deploying || project.status === "PENDING" || project.status === "RUNNING"}
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
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Files</span>
              <button onClick={fetchFiles} className="text-slate-600 hover:text-slate-300 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {files.length === 0 ? (
                <div className="px-3 py-8 text-center text-slate-600 text-xs">
                  {project?.status === "PENDING" || project?.status === "RUNNING"
                    ? "Generating files…"
                    : "No files yet"}
                </div>
              ) : (
                <>
                  {(fileTree[""] ?? []).map((file) => (
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

                  {Object.entries(fileTree)
                    .filter(([dir]) => dir !== "")
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
                </>
              )}
            </div>
          </div>

          {/* Main panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center border-b border-white/5 bg-[#070d1a] px-4 gap-1">
              {(
                [
                  { id: "sandbox", icon: <FlaskConical className="w-3.5 h-3.5" />, label: "Sandbox", badge: "LIVE" as const },
                  { id: "preview", icon: <Monitor className="w-3.5 h-3.5" />, label: "Deployed" },
                  { id: "code", icon: <Code2 className="w-3.5 h-3.5" />, label: "Code" },
                  { id: "logs", icon: <Terminal className="w-3.5 h-3.5" />, label: "Agent Logs" },
                ]
              ).map((tab) => (
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
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
                          <h3 className="text-lg font-bold text-white mb-2">No Live Preview Yet</h3>
                          {project?.status === "COMPLETED" ? (
                            <p className="text-sm text-slate-400 max-w-sm">
                              Your project is ready. Connect GitHub + Vercel in{" "}
                              <a href="/dashboard/integrations" className="text-purple-400 hover:underline">
                                Integrations
                              </a>{" "}
                              then click{" "}
                              <span className="text-white font-semibold">Deploy to Vercel</span>.
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400 max-w-sm">
                              {project?.status === "PENDING" || project?.status === "RUNNING"
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
                            {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
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
                          <span className="text-xs text-slate-300 font-mono">{selectedFile}</span>
                          <button
                            onClick={() => copyUrl(fileContent)}
                            className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex-1 overflow-auto">
                          <pre className="p-6 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {fileContent || <span className="text-slate-600">Loading…</span>}
                          </pre>
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
                    {!project?.executions?.length ? (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        <div className="text-center">
                          <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>No agent logs yet</p>
                        </div>
                      </div>
                    ) : (
                      project.executions.map((exec) => (
                        <div
                          key={exec.id}
                          className="bg-[#0B1120] border border-white/5 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {exec.status === "COMPLETED" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : exec.status === "FAILED" ? (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              ) : (
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                              )}
                              <span className="text-sm font-bold text-white capitalize">
                                {exec.node.replace(/_/g, " ")} Agent
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(exec.startedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {exec.log && (
                            <pre className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap bg-black/30 rounded-lg p-3 mt-2 max-h-40 overflow-y-auto">
                              {exec.log}
                            </pre>
                          )}
                          {exec.error && (
                            <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-3 font-mono">
                              {exec.error}
                            </div>
                          )}
                        </div>
                      ))
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
