import {
  Code,
  Database,
  FileText,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { cloneElement, useEffect, useState, type ReactElement } from "react";

export const Process = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [isMoving, setIsMoving] = useState(false);
  const [dotSource, setDotSource] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeStep !== null && activeStep < 5) {
        const current = activeStep;
        setDotSource(current);
        // 1. Step finishes and sends signal immediately
        setActiveStep(null); 
        setCompletedSteps(prev => [...new Set([...prev, current])]);
        setIsMoving(true);

        // 2. Signal travels for 800ms
        setTimeout(() => {
          setIsMoving(false);
          setActiveStep(current + 1);
        }, 800);
      } else if (activeStep === 5) {
        // Pause at the end
        setTimeout(() => {
          setCompletedSteps([]);
          setActiveStep(0);
        }, 2000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [activeStep]);

  const steps = [
    {
      title: "Describe",
      desc: "Describe your idea in natural language prompts.",
      icon: <MessageSquare />,
    },
    {
      title: "Plan",
      desc: "Planner Agent analyzes and creates architecture.",
      icon: <FileText />,
    },
    {
      title: "Build",
      desc: "AI agents generate code, contracts, and UI.",
      icon: <Code />,
    },
    {
      title: "Audit",
      desc: "Audit Agent scans and improves security.",
      icon: <Shield />,
    },
    {
      title: "Deploy",
      desc: "Deployment Agent deploys to OG Chain.",
      icon: <Zap />,
    },
    {
      title: "Remember",
      desc: "Project data stored for long-term memory.",
      icon: <Database />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 relative z-10 overflow-hidden"
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
          <p className="text-slate-400">
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
          {/* Static Connection Line */}
          <div className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-[2px] bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
            
            {/* Moving Signal Dot - Only travels BETWEEN steps ONCE */}
            <AnimatePresence>
              {isMoving && (
                <motion.div
                  key={`dot-${dotSource}`}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_20px_#a855f7] z-0"
                  initial={{ left: `${(dotSource / 5) * 100}%`, opacity: 0 }}
                  animate={{ 
                    left: [`${(dotSource / 5) * 100}%`, `${((dotSource + 1) / 5) * 100}%`],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{ 
                    duration: 0.8,
                    times: [0, 0.1, 0.9, 1],
                    ease: "easeInOut"
                  }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-4">
            {steps.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isActive = activeStep === i;

              return (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-700
                    ${isCompleted ? "bg-[#050816] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : 
                      isActive ? "bg-[#050816] border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] scale-110" : 
                      "bg-[#050816] border-white/10"}
                    border-2
                  `}>
                    <div className="relative">
                      {cloneElement(step.icon as ReactElement<{ className?: string }>, {
                        className: `w-6 h-6 transition-colors duration-500 ${isCompleted ? "text-emerald-400" : isActive ? "text-white" : "text-slate-500"}`,
                      })}
                      
                      {isActive && (
                        <motion.div 
                          className="absolute inset-0 bg-purple-400 blur-md opacity-50"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* Step Number Badge */}
                    <div className={`
                      absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border transition-colors duration-500
                      ${isCompleted ? "bg-emerald-500 border-emerald-400 text-white" : 
                        isActive ? "bg-purple-600 border-purple-400 text-white" : 
                        "bg-[#0f172a] border-white/10 text-slate-500"}
                    `}>
                      {i + 1}
                    </div>
                  </div>

                  <h3 className={`text-sm font-bold mb-2 transition-colors duration-500 ${isCompleted ? "text-emerald-400" : isActive ? "text-white" : "text-slate-400"}`}>
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-[140px] group-hover:text-slate-300 transition-colors">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
