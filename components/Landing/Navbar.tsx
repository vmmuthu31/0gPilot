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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center p-[1px]">
          <div className="w-full h-full bg-[var(--background)] rounded-full flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
        </div>
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
          variant="ghost"
          className="hidden sm:flex px-3 py-1.5 text-xs text-[var(--text-secondary)]"
        >
          <DiGithub className="w-4 h-4" /> Star on GitHub
        </Button>
        <Button
          variant="link"
          className="px-4 py-2 text-sm bg-gradient-to-r from-[#7c3aed] to-[#3b82f6]"
        >
          Launch App
        </Button>
      </div>
    </div>
  </motion.nav>
);

export default Navbar;
