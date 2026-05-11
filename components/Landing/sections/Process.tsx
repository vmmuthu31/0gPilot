import {
  Code,
  Database,
  FileText,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { cloneElement } from "react";

export const Process = () => {
  const steps = [
    {
      num: "1",
      title: "1. Describe",
      desc: "You describe your idea in natural language.",
      icon: <MessageSquare />,
    },
    {
      num: "2",
      title: "2. Plan",
      desc: "Planner Agent analyzes requirements and creates architecture.",
      icon: <FileText />,
    },
    {
      num: "3",
      title: "3. Build",
      desc: "AI agents generate code, contracts, APIs, and UI components.",
      icon: <Code />,
    },
    {
      num: "4",
      title: "4. Audit",
      desc: "Audit Agent scans and improves your contracts.",
      icon: <Shield />,
    },
    {
      num: "5",
      title: "5. Deploy",
      desc: "Deployment Agent deploys to OG Chain automatically.",
      icon: <Zap />,
    },
    {
      num: "6",
      title: "6. Remember",
      desc: "All project data is stored on OG Storage for long-term memory.",
      icon: <Database />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 relative z-10 border-t border-[var(--border)] bg-gradient-to-b from-transparent to-[#0a0f1c]"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            How OGPilot Works
          </h2>
          <p className="text-[var(--text-secondary)]">
            From idea to deployment — fully autonomous.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="relative"
        >
          <div className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-[2px] bg-[var(--border)]">
            <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] w-full opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#111526] border-2 border-[var(--border)] flex items-center justify-center mb-6 relative z-10 transition-all duration-300 hover:border-[#8b5cf6] hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  {cloneElement(step.icon, {
                    className: "w-8 h-8 text-[#a78bfa]",
                  })}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-[160px] leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
