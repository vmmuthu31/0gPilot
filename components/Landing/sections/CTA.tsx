import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CTA = () => (
  <section className="py-24 relative overflow-hidden z-10 border-y border-[var(--border)]">
    <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-[800px] h-[800px] rounded-full border border-[var(--border)] opacity-20"></div>
    <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] rounded-full bg-[#7c3aed]/10 blur-[100px]"></div>

    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="glass-card rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#0a0f1c]/90 border border-[var(--border)]"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to build the future with AI + Web3?
          </h2>
          <p className="text-[var(--text-secondary)]">
            Join 950+ builders building on OG with OGPilot.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
          <Link href="/dashboard">
            <Button
              className="px-8 py-4 text-base w-full sm:w-auto bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white rounded-xl hover:opacity-90 transition-opacity font-semibold border-0 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              Start Building Now
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="px-8 py-4 text-base w-full sm:w-auto bg-[#111526]"
          >
            View Documentation
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);
