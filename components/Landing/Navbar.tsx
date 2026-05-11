import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { Button } from "../ui/button";
import { DiGithub } from "react-icons/di";

const Navbar = () => (
  <motion.nav
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer">
        <img
          src="/logo.png"
          alt="0GPilot Logo"
          className="w-auto h-8 rounded-full flex items-center justify-center"
        />
        <span className="text-xl font-bold tracking-tight text-white">
          OGPilot
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
        {[
          "Features",
          "How it Works",
          "Use Cases",
          "Architecture",
          "Docs",
          "Pricing",
          "Blog",
        ].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:text-white transition-colors"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          className="hidden sm:flex items-center gap-2 rounded-xl px-4 text-white/80 hover:text-white"
        >
          <DiGithub className="w-4 h-4" />
          Star on GitHub
        </Button>

        <Button
          className="px-5 text-sm bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white rounded-lg hover:opacity-90 transition-opacity font-medium border-0 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
        >
          Launch App
        </Button>
      </div>
    </div>
  </motion.nav>
);

export default Navbar;
