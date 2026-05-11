import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export const Stats = () => {
  const stats = [
    { label: "Builders", value: "950+" },
    { label: "Projects Built", value: "320+" },
    { label: "On-chain Deployments", value: "1.2M+" },
    { label: "Uptime", value: "99.9%" },
    { label: "Transactions", value: "150K+" },
  ];

  return (
    <section className="py-16 border-b border-[var(--border)] relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-5 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="text-center relative group"
            >
              {i !== stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-[var(--border)]"></div>
              )}
              <div className="text-3xl lg:text-4xl font-bold text-white mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
