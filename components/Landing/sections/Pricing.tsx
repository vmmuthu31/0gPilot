"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export const plans = [
  {
    name: "Free",
    price: "0",
    desc: "Perfect for hobbyists and individual developers.",
    features: [
      "1,000 AI generations/month",
      "Standard agent access",
      "Public deployments only",
      "Community support",
      "Basic smart contract templates",
    ],
    buttonText: "Get Started",
    icon: <Zap className="w-6 h-6 text-blue-400" />,
    color: "from-blue-500/20 to-cyan-500/10",
  },
  {
    name: "Pro",
    price: "49",
    desc: "For serious builders and fast-growing startups.",
    features: [
      "10,000 AI generations/month",
      "Advanced agent suite",
      "Private deployments",
      "Priority priority support",
      "Custom security audits",
      "Long-term agent memory",
    ],
    buttonText: "Upgrade Now",
    icon: <Crown className="w-6 h-6 text-purple-400" />,
    color: "from-purple-500/20 to-pink-500/10",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Advanced solutions for large-scale operations.",
    features: [
      "Unlimited AI generations",
      "Custom agent development",
      "Dedicated infrastructure",
      "24/7 VIP support",
      "SLA guarantees",
      "On-premise options",
    ],
    buttonText: "Contact Sales",
    icon: <Building2 className="w-6 h-6 text-emerald-400" />,
    color: "from-emerald-500/20 to-teal-500/10",
  },
];

import { usePricing } from "@/context/PricingContext";

export const Pricing = () => {
  const { openModal } = usePricing();

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl bg-purple-600/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-lg">
            Choose the plan that best fits your development needs. Scale as you grow.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className={`relative group rounded-3xl border ${
                plan.popular ? "border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]" : "border-white/10"
              } bg-[#0B1120]/80 backdrop-blur-xl p-8 transition-all flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 border border-white/5`}>
                {plan.icon}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">
                  {plan.price === "Custom" ? "" : "$"}
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className="text-slate-500 font-medium">/month</span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-8 line-clamp-2">
                {plan.desc}
              </p>

              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => openModal(plan)}
                className={`w-full py-6 rounded-2xl font-bold transition-all ${
                  plan.popular 
                    ? "bg-[#7C3AED] hover:bg-[#8B5CF6] text-white shadow-[0_0_25px_rgba(124,58,237,0.4)]" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
