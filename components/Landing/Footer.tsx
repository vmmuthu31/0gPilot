import Image from "next/image";
import { FaDiscord, FaGithub, FaTwitter, FaYoutube } from "react-icons/fa";

export const Footer = () => (
  <footer className="bg-[var(--background)] pt-16 pb-8 relative z-10">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 cursor-pointer">
            <Image
              src="/logo.png"
              alt="0GPilot Logo"
              width={32}
              height={32}
              className="h-8 rounded-full"
              style={{ width: "auto" }}
            />
            <span className="text-xl font-bold tracking-tight text-white">
              OGPilot
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs leading-relaxed">
            Autonomous AI software engineer for Web3. Build, audit, deploy, and
            scale on OG.
          </p>
          <div className="flex items-center gap-4 text-[var(--text-secondary)]">
            <FaTwitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <FaDiscord className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <FaGithub className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <FaYoutube className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            {[
              "Features",
              "How it Works",
              "Use Cases",
              "Pricing",
              "Roadmap",
            ].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-[#a78bfa] transition-colors">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Resources</h4>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            {[
              "Documentation",
              "API Reference",
              "Tutorials",
              "Blog",
              "Changelog",
            ].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-[#a78bfa] transition-colors">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Ecosystem</h4>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            {[
              "OG Website",
              "OG Docs",
              "OpenClaw",
              "Agent ID",
              "OG Explorer",
            ].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-[#a78bfa] transition-colors">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Company</h4>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            {[
              "About Us",
              "Careers",
              "Contact",
              "Privacy Policy",
              "Terms of Service",
            ].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-[#a78bfa] transition-colors">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
        <p>© 2025 OGPilot. All rights reserved.</p>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-4 md:mt-0 w-8 h-8 rounded-full bg-[#111526] border border-[var(--border)] flex items-center justify-center hover:bg-[#8b5cf6] hover:text-white transition-colors cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  </footer>
);
