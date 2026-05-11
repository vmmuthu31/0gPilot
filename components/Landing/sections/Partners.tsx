import { Cpu, Database, Layers, Shield, Terminal } from "lucide-react";

const Partners = () => (
  <div className="border-y border-[var(--border)] bg-[var(--surface)]/50 relative z-20 py-5">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
        Powered by OG Modular Infrastructure
      </span>
      <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-80">
        {[
          { name: "OG Compute", icon: <Cpu /> },
          { name: "OG Storage", icon: <Database /> },
          { name: "OG Chain", icon: <Layers /> },
          { name: "OpenClaw", icon: <Terminal /> },
          { name: "Agent ID", icon: <Shield /> },
        ].map((partner, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm font-bold text-white transition-colors cursor-pointer hover:text-[#a78bfa]"
          >
            <div className="text-[#a78bfa]">{partner.icon}</div>
            {partner.name}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Partners;
