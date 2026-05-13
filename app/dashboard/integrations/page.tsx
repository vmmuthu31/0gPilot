"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { TopNav } from "@/components/Dashboard/TopNav";
import {
  Triangle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Unlink,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";

type ConnectionStatus = "idle" | "loading" | "success" | "error";

interface IntegrationState {
  token: string;
  teamId?: string;
  showToken: boolean;
  status: ConnectionStatus;
  message: string;
  connectedAs: string | null;
}

const defaultState = (withTeam = false): IntegrationState => ({
  token: "",
  ...(withTeam ? { teamId: "" } : {}),
  showToken: false,
  status: "idle",
  message: "",
  connectedAs: null,
});

function StatusBadge({ connectedAs }: { connectedAs: string | null }) {
  if (!connectedAs) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Not Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      {connectedAs}
    </span>
  );
}

function FeedbackRow({
  status,
  message,
}: {
  status: ConnectionStatus;
  message: string;
}) {
  if (status === "idle" || !message) return null;

  const configs = {
    loading: {
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      cls: "text-blue-400",
    },
    success: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      cls: "text-emerald-400",
    },
    error: { icon: <XCircle className="w-4 h-4" />, cls: "text-red-400" },
  } as const;

  const cfg = configs[status as keyof typeof configs];
  if (!cfg) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-2 text-xs font-medium ${cfg.cls}`}
      >
        {cfg.icon}
        {message}
      </motion.div>
    </AnimatePresence>
  );
}

export default function IntegrationsPage() {
  const [github, setGithub] = useState<IntegrationState>(defaultState());
  const [vercel, setVercel] = useState<IntegrationState>({
    ...defaultState(true),
    teamId: "",
  });

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("og_jwt");
  };

  const connectGitHub = async () => {
    if (!github.token.trim()) return;
    setGithub((s) => ({
      ...s,
      status: "loading",
      message: "Verifying token with GitHub…",
    }));

    try {
      const res = await fetch("/api/integrations/github/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ accessToken: github.token.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setGithub((s) => ({
          ...s,
          status: "success",
          message: `Connected as @${data.login}`,
          connectedAs: `@${data.login}`,
          token: "",
        }));
      } else {
        const msg =
          data?.error?.code === "INVALID_GITHUB_TOKEN"
            ? "Invalid token — check your PAT scopes"
            : data?.error?.message ?? "Connection failed";
        setGithub((s) => ({ ...s, status: "error", message: msg }));
      }
    } catch {
      setGithub((s) => ({
        ...s,
        status: "error",
        message: "Network error — please retry",
      }));
    }
  };

  const connectVercel = async () => {
    if (!vercel.token.trim()) return;
    setVercel((s) => ({
      ...s,
      status: "loading",
      message: "Verifying token with Vercel…",
    }));

    try {
      const body: { accessToken: string; teamId?: string } = {
        accessToken: vercel.token.trim(),
      };
      if (vercel.teamId?.trim()) body.teamId = vercel.teamId.trim();

      const res = await fetch("/api/integrations/vercel/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setVercel((s) => ({
          ...s,
          status: "success",
          message: `Connected as ${data.username}`,
          connectedAs: data.username,
          token: "",
          teamId: "",
        }));
      } else {
        const msg =
          data?.error?.code === "INVALID_VERCEL_TOKEN"
            ? "Invalid token — check your Vercel access token"
            : data?.error?.message ?? "Connection failed";
        setVercel((s) => ({ ...s, status: "error", message: msg }));
      }
    } catch {
      setVercel((s) => ({
        ...s,
        status: "error",
        message: "Network error — please retry",
      }));
    }
  };

  const disconnectGitHub = () => setGithub(defaultState());
  const disconnectVercel = () =>
    setVercel({ ...defaultState(true), teamId: "" });

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />

      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        <TopNav />

        <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-white mb-2">Integrations</h1>
            <p className="text-sm text-slate-400">
              Connect your GitHub and Vercel accounts so 0GPilot can push
              generated code and deploy your apps automatically.
            </p>
          </div>

          <div className="space-y-5">
            {/* GitHub */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[#0B1120] border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <FaGithub className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-base font-bold text-white">GitHub</h2>
                      <StatusBadge connectedAs={github.connectedAs} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Push generated projects to your repositories
                    </p>
                  </div>
                </div>

                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=0GPilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Generate PAT
                </a>
              </div>

              {github.connectedAs ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected as{" "}
                    <span className="font-bold">{github.connectedAs}</span>
                  </div>
                  <button
                    onClick={disconnectGitHub}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      id="github-token"
                      type={github.showToken ? "text" : "password"}
                      value={github.token}
                      onChange={(e) =>
                        setGithub((s) => ({
                          ...s,
                          token: e.target.value,
                          status: "idle",
                          message: "",
                        }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && connectGitHub()}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                    />
                    <button
                      onClick={() =>
                        setGithub((s) => ({ ...s, showToken: !s.showToken }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {github.showToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <FeedbackRow
                      status={github.status}
                      message={github.message}
                    />
                    <button
                      onClick={connectGitHub}
                      disabled={
                        !github.token.trim() || github.status === "loading"
                      }
                      className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      {github.status === "loading" && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      Connect GitHub
                    </button>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-400/80 leading-relaxed">
                      Required scopes:{" "}
                      <span className="font-mono font-bold">repo</span> and{" "}
                      <span className="font-mono font-bold">workflow</span>.
                      Your token is stored encrypted server-side.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Vercel */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-[#0B1120] border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Triangle className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-base font-bold text-white">Vercel</h2>
                      <StatusBadge connectedAs={vercel.connectedAs} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Deploy your generated app to a live URL instantly
                    </p>
                  </div>
                </div>

                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Manage tokens
                </a>
              </div>

              {vercel.connectedAs ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected as{" "}
                    <span className="font-bold">{vercel.connectedAs}</span>
                  </div>
                  <button
                    onClick={disconnectVercel}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      id="vercel-token"
                      type={vercel.showToken ? "text" : "password"}
                      value={vercel.token}
                      onChange={(e) =>
                        setVercel((s) => ({
                          ...s,
                          token: e.target.value,
                          status: "idle",
                          message: "",
                        }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && connectVercel()}
                      placeholder="Vercel access token"
                      className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                    />
                    <button
                      onClick={() =>
                        setVercel((s) => ({ ...s, showToken: !s.showToken }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {vercel.showToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <input
                    id="vercel-team-id"
                    type="text"
                    value={vercel.teamId ?? ""}
                    onChange={(e) =>
                      setVercel((s) => ({ ...s, teamId: e.target.value }))
                    }
                    placeholder="Team ID (optional — for team accounts)"
                    className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                  />

                  <div className="flex items-center justify-between">
                    <FeedbackRow
                      status={vercel.status}
                      message={vercel.message}
                    />
                    <button
                      onClick={connectVercel}
                      disabled={
                        !vercel.token.trim() || vercel.status === "loading"
                      }
                      className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      {vercel.status === "loading" && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      Connect Vercel
                    </button>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-400/80 leading-relaxed">
                      Create a token with full access at{" "}
                      <span className="font-mono font-bold">
                        vercel.com/account/tokens
                      </span>
                      . Team ID is only needed for Vercel team accounts.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10"
            >
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-purple-400 font-semibold">
                  How it works:
                </span>{" "}
                Once connected, every generated project is automatically pushed
                to a new GitHub repo named from your prompt, then deployed to
                Vercel. Contract deployments go directly to the 0G Galileo
                testnet regardless of these integrations.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
