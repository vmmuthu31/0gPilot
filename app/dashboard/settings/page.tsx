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
  User,
  Bell,
  Blocks,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { useAuth } from "@/src/client/auth/AuthProvider";

type ConnectionStatus = "idle" | "loading" | "success" | "error";
type SettingsTab = "profile" | "integrations" | "preferences";
type SettingsTab = "profile" | "integrations" | "preferences";

interface IntegrationState {
  token: string;
  teamId?: string;
  showToken: boolean;
  status: ConnectionStatus;
  message: string;
  connectedAs: string | null;
}

const defaultIntegrationState = (withTeam = false): IntegrationState => ({
  token: "",
  ...(withTeam ? { teamId: "" } : {}),
  showToken: false,
  status: "idle",
  message: "",
  connectedAs: null,
});

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  { id: "integrations", label: "Integrations", icon: <Blocks className="w-4 h-4" /> },
  { id: "preferences", label: "Preferences", icon: <Bell className="w-4 h-4" /> },
];

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

function FeedbackRow({ status, message }: { status: ConnectionStatus; message: string }) {
  if (status === "idle" || !message) return null;

  const configs = {
    loading: { icon: <Loader2 className="w-4 h-4 animate-spin" />, cls: "text-blue-400" },
    success: { icon: <CheckCircle2 className="w-4 h-4" />, cls: "text-emerald-400" },
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

function ProfileSection() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const address = user?.address ?? null;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1">Wallet</h3>
        <p className="text-xs text-slate-500 mb-5">Your connected wallet address is used as your identity.</p>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#050816] border border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {address ? address.slice(2, 4).toUpperCase() : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{shortAddress}</p>
            <p className="text-[11px] text-slate-500">SIWE Authentication</p>
          </div>
          <button
            onClick={handleCopy}
            disabled={!address}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1">Plan</h3>
        <p className="text-xs text-slate-500 mb-5">Your current subscription tier.</p>

        <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <div>
            <p className="text-sm font-bold text-purple-400">Free Tier</p>
            <p className="text-[11px] text-slate-500 mt-0.5">5 generations per month</p>
          </div>
          <a
            href="/pricing"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Upgrade
          </a>
        </div>
      </div>

      <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6">
        <h3 className="text-base font-bold text-red-400 mb-1">Danger Zone</h3>
        <p className="text-xs text-slate-500 mb-5">Irreversible account actions.</p>

        <button className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-colors">
          Delete Account
        </button>
      </div>
    </motion.div>
  );
}

function IntegrationsSection() {
  const [github, setGithub] = useState<IntegrationState>(defaultIntegrationState());
  const [vercel, setVercel] = useState<IntegrationState>({ ...defaultIntegrationState(true), teamId: "" });

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("og_jwt");
  };

  const connectGitHub = async () => {
    if (!github.token.trim()) return;
    setGithub((s) => ({ ...s, status: "loading", message: "Verifying token with GitHub…" }));
    try {
      const res = await fetch("/api/integrations/github/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ accessToken: github.token.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGithub((s) => ({ ...s, status: "success", message: `Connected as @${data.login}`, connectedAs: `@${data.login}`, token: "" }));
      } else {
        const msg = data?.error?.code === "INVALID_GITHUB_TOKEN" ? "Invalid token — check your PAT scopes" : data?.error?.message ?? "Connection failed";
        setGithub((s) => ({ ...s, status: "error", message: msg }));
      }
    } catch {
      setGithub((s) => ({ ...s, status: "error", message: "Network error — please retry" }));
    }
  };

  const connectVercel = async () => {
    if (!vercel.token.trim()) return;
    setVercel((s) => ({ ...s, status: "loading", message: "Verifying token with Vercel…" }));
    try {
      const body: { accessToken: string; teamId?: string } = { accessToken: vercel.token.trim() };
      if (vercel.teamId?.trim()) body.teamId = vercel.teamId.trim();
      const res = await fetch("/api/integrations/vercel/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVercel((s) => ({ ...s, status: "success", message: `Connected as ${data.username}`, connectedAs: data.username, token: "", teamId: "" }));
      } else {
        const msg = data?.error?.code === "INVALID_VERCEL_TOKEN" ? "Invalid token — check your Vercel access token" : data?.error?.message ?? "Connection failed";
        setVercel((s) => ({ ...s, status: "error", message: msg }));
      }
    } catch {
      setVercel((s) => ({ ...s, status: "error", message: "Network error — please retry" }));
    }
  };

  const disconnectGitHub = () => setGithub(defaultIntegrationState());
  const disconnectVercel = () => setVercel({ ...defaultIntegrationState(true), teamId: "" });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* GitHub */}
      <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6">
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
              <p className="text-xs text-slate-500">Push generated projects to your repositories</p>
            </div>
          </div>
          <a href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=0GPilot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-purple-400 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Generate PAT
          </a>
        </div>

        {github.connectedAs ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Connected as <span className="font-bold">{github.connectedAs}</span>
            </div>
            <button onClick={disconnectGitHub} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors">
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input id="github-token" type={github.showToken ? "text" : "password"} value={github.token} onChange={(e) => setGithub((s) => ({ ...s, token: e.target.value, status: "idle", message: "" }))} onKeyDown={(e) => e.key === "Enter" && connectGitHub()} placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono" />
              <button onClick={() => setGithub((s) => ({ ...s, showToken: !s.showToken }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {github.showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <FeedbackRow status={github.status} message={github.message} />
              <button onClick={connectGitHub} disabled={!github.token.trim() || github.status === "loading"} className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                {github.status === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Connect GitHub
              </button>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-400/80 leading-relaxed">
                Required scopes: <span className="font-mono font-bold">repo</span> and <span className="font-mono font-bold">workflow</span>. Your token is stored encrypted server-side.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Vercel */}
      <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6">
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
              <p className="text-xs text-slate-500">Deploy your generated app to a live URL instantly</p>
            </div>
          </div>
          <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-purple-400 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Manage tokens
          </a>
        </div>

        {vercel.connectedAs ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Connected as <span className="font-bold">{vercel.connectedAs}</span>
            </div>
            <button onClick={disconnectVercel} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors">
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input id="vercel-token" type={vercel.showToken ? "text" : "password"} value={vercel.token} onChange={(e) => setVercel((s) => ({ ...s, token: e.target.value, status: "idle", message: "" }))} onKeyDown={(e) => e.key === "Enter" && connectVercel()} placeholder="Vercel access token" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono" />
              <button onClick={() => setVercel((s) => ({ ...s, showToken: !s.showToken }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {vercel.showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input id="vercel-team-id" type="text" value={vercel.teamId ?? ""} onChange={(e) => setVercel((s) => ({ ...s, teamId: e.target.value }))} placeholder="Team ID (optional — for team accounts)" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono" />
            <div className="flex items-center justify-between">
              <FeedbackRow status={vercel.status} message={vercel.message} />
              <button onClick={connectVercel} disabled={!vercel.token.trim() || vercel.status === "loading"} className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                {vercel.status === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Connect Vercel
              </button>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-400/80 leading-relaxed">
                Create a token with full access at <span className="font-mono font-bold">vercel.com/account/tokens</span>. Team ID is only needed for Vercel team accounts.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="text-purple-400 font-semibold">How it works:</span>{" "}
          Once connected, every generated project is automatically pushed to a new GitHub repo named from your prompt, then deployed to Vercel. Contract deployments go directly to the 0G Galileo testnet regardless of these integrations.
        </p>
      </div>
    </motion.div>
  );
}

function PreferencesSection() {
  const [notifications, setNotifications] = useState({ deploySuccess: true, deployFail: true, agentUpdates: false, weeklyDigest: false });
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1">Notifications</h3>
        <p className="text-xs text-slate-500 mb-5">Choose what you want to be notified about.</p>

        <div className="space-y-3">
          {([
            { key: "deploySuccess" as const, label: "Successful deployments", desc: "Get notified when a deployment succeeds" },
            { key: "deployFail" as const, label: "Failed deployments", desc: "Get notified when a deployment fails" },
            { key: "agentUpdates" as const, label: "Agent status updates", desc: "Real-time agent progress notifications" },
            { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of your weekly activity" },
          ]).map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-[#050816] border border-white/10">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotification(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications[item.key] ? "bg-purple-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications[item.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1">Default Network</h3>
        <p className="text-xs text-slate-500 mb-5">Select the default deployment target for new projects.</p>

        <select className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer">
          <option value="galileo">0G Galileo Testnet</option>
          <option value="mainnet">0G Mainnet (coming soon)</option>
        </select>
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />

      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        <TopNav />

        <div className="flex-1 overflow-y-auto p-8 mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
            <p className="text-sm text-slate-400">Manage your account, integrations, and preferences.</p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B1120] border border-white/5 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? "bg-purple-600/15 text-purple-400 border border-purple-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "profile" && <ProfileSection key="profile" />}
            {activeTab === "integrations" && <IntegrationsSection key="integrations" />}
            {activeTab === "preferences" && <PreferencesSection key="preferences" />}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
