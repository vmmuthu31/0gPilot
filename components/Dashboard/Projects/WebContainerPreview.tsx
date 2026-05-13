"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import {
  Loader2,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  PackageOpen,
  Hammer,
  Rocket,
  Wifi,
} from "lucide-react";

interface Props {
  files: Record<string, string>;
  projectId: string;
}

type Phase =
  | "idle"
  | "booting"
  | "installing"
  | "building"
  | "running"
  | "ready"
  | "error";

const PHASE_LABELS: Record<Phase, string> = {
  idle: "Waiting…",
  booting: "Booting runtime…",
  installing: "Installing dependencies…",
  building: "Building project…",
  running: "Starting dev server…",
  ready: "Live",
  error: "Error",
};

const PHASE_ICONS: Record<Phase, React.ReactNode> = {
  idle: <Loader2 className="w-4 h-4 animate-spin text-slate-500" />,
  booting: <Rocket className="w-4 h-4 animate-pulse text-purple-400" />,
  installing: <PackageOpen className="w-4 h-4 animate-pulse text-blue-400" />,
  building: <Hammer className="w-4 h-4 animate-pulse text-amber-400" />,
  running: <Wifi className="w-4 h-4 animate-pulse text-emerald-400" />,
  ready: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
};

let sharedContainer: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

async function getContainer(): Promise<WebContainer> {
  if (sharedContainer) return sharedContainer;
  if (bootPromise) return bootPromise;
  bootPromise = WebContainer.boot().then((wc) => {
    sharedContainer = wc;
    return wc;
  });
  return bootPromise;
}

function filesToWebContainerFS(
  files: Record<string, string>
): Record<string, unknown> {
  const fs: Record<string, unknown> = {};

  for (const [rawPath, content] of Object.entries(files)) {
    const parts = rawPath.split("/").filter(Boolean);

    let node: Record<string, unknown> = fs;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) {
        node[parts[i]] = { directory: {} };
      }
      node = (node[parts[i]] as { directory: Record<string, unknown> }).directory;
    }

    const filename = parts[parts.length - 1];
    node[filename] = { file: { contents: content } };
  }

  return fs;
}

export function WebContainerPreview({ files, projectId }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const containerRef = useRef<WebContainer | null>(null);
  const startedRef = useRef(false);

  const writeTerminal = useCallback((text: string) => {
    xtermRef.current?.write(text);
  }, []);

  const startContainer = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      setPhase("booting");
      writeTerminal("\r\n\x1b[35m▶ Booting WebContainer runtime…\x1b[0m\r\n");

      const wc = await getContainer();
      containerRef.current = wc;

      const fsTree = filesToWebContainerFS(files);

      writeTerminal("\x1b[34m▶ Mounting project files…\x1b[0m\r\n");
      await wc.mount(fsTree as Parameters<WebContainer["mount"]>[0]);

      wc.on("server-ready", (_port, url) => {
        setPreviewUrl(url);
        setPhase("ready");
        writeTerminal(`\r\n\x1b[32m✔ Dev server ready: ${url}\x1b[0m\r\n`);
      });

      setPhase("installing");
      writeTerminal("\x1b[34m▶ Running npm install…\x1b[0m\r\n");

      const installProc = await wc.spawn("npm", ["install"]);
      installProc.output.pipeTo(
        new WritableStream({
          write(chunk) {
            writeTerminal(chunk);
          },
        })
      );

      const installExit = await installProc.exit;
      if (installExit !== 0) {
        throw new Error(`npm install exited with code ${installExit}`);
      }

      writeTerminal("\r\n\x1b[32m✔ Dependencies installed\x1b[0m\r\n\r\n");
      setPhase("running");
      writeTerminal("\x1b[34m▶ Starting dev server…\x1b[0m\r\n");

      const devProc = await wc.spawn("npm", ["run", "dev"]);
      devProc.output.pipeTo(
        new WritableStream({
          write(chunk) {
            writeTerminal(chunk);
          },
        })
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setPhase("error");
      writeTerminal(`\r\n\x1b[31m✖ Error: ${msg}\x1b[0m\r\n`);
    }
  }, [files, writeTerminal]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const xterm = new XTerm({
      theme: {
        background: "#070d1a",
        foreground: "#e2e8f0",
        cursor: "#7c3aed",
        selectionBackground: "#7c3aed40",
      },
      fontSize: 12,
      fontFamily: "'Geist Mono', 'Fira Code', monospace",
      cursorBlink: true,
      rows: 18,
    });

    xterm.open(terminalRef.current);
    xtermRef.current = xterm;

    xterm.write("\x1b[35m0GPilot WebContainer\x1b[0m\r\n");
    xterm.write("─────────────────────────────────\r\n");

    if (Object.keys(files).length > 0) {
      // Defer to avoid synchronous setState inside effect body
      const timer = setTimeout(() => startContainer(), 0);
      return () => {
        clearTimeout(timer);
        xterm.dispose();
        xtermRef.current = null;
      };
    } else {
      xterm.write("\x1b[33mWaiting for generated files…\x1b[0m\r\n");
    }

    return () => {
      xterm.dispose();
      xtermRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(files).length > 0 && !startedRef.current) {
      startContainer();
    }
  }, [files, startContainer]);

  const restart = () => {
    startedRef.current = false;
    setPhase("idle");
    setPreviewUrl(null);
    setError(null);
    xtermRef.current?.clear();
    xtermRef.current?.write("\x1b[35m0GPilot WebContainer\x1b[0m\r\n");
    xtermRef.current?.write("─────────────────────────────────\r\n");
    startContainer();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050816]">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#070d1a] shrink-0">
        <div className="flex items-center gap-2">
          {PHASE_ICONS[phase]}
          <span
            className={`text-xs font-semibold ${
              phase === "ready"
                ? "text-emerald-400"
                : phase === "error"
                ? "text-red-400"
                : "text-slate-400"
            }`}
          >
            {PHASE_LABELS[phase]}
          </span>
          {phase === "ready" && previewUrl && (
            <span className="text-[10px] text-slate-500 font-mono ml-1">
              {previewUrl}
            </span>
          )}
        </div>
        <button
          onClick={restart}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          title="Restart container"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Split: iframe + terminal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview iframe */}
        <div
          className="border-b border-white/5 transition-all duration-500"
          style={{ height: phase === "ready" ? "60%" : "0%" }}
        >
          {previewUrl && phase === "ready" && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title={`Preview — ${projectId}`}
            />
          )}
        </div>

        {/* Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-[#070d1a] shrink-0">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Terminal
            </span>
          </div>
          <div ref={terminalRef} className="flex-1 overflow-hidden p-2" />
        </div>
      </div>

      {phase === "error" && error && (
        <div className="shrink-0 mx-4 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
