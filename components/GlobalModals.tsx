"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricing } from "@/context/PricingContext";
import { plans } from "@/components/Landing/sections/Pricing";

export const GlobalModals = () => {
  const { isOpen, closeModal } = usePricing();
  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(null);

  const handleSubscribe = (planName: string) => {
    setSubscribedPlan(planName);
    // Auto close after 2 seconds
    setTimeout(() => {
      setSubscribedPlan(null);
      closeModal();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-[#050816]/95 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full ${subscribedPlan ? 'max-w-md' : 'max-w-5xl'} bg-[#0B1120] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-3xl overflow-hidden transition-all duration-500`}
          >
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <AnimatePresence mode="wait">
              {subscribedPlan ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center text-center py-12"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-8">
                    <PartyPopper className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Subscription Active!</h2>
                  <p className="text-slate-400 text-lg mb-2">
                    Welcome to the <span className="text-white font-bold">{subscribedPlan}</span> plan.
                  </p>
                  <p className="text-emerald-400 font-medium">You are now a pro user!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="plans"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h2>
                    <p className="text-slate-400">Upgrade to unlock advanced AI capabilities and higher limits.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.name}
                        className={`relative group rounded-3xl border ${
                          plan.popular ? "border-purple-500/50 bg-purple-500/5" : "border-white/5 bg-white/5"
                        } p-6 transition-all hover:border-purple-500/40`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 border border-white/5`}>
                          {React.cloneElement(plan.icon as React.ReactElement, { className: "w-5 h-5" })}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-2xl font-bold text-white">
                            {plan.price === "Custom" ? "" : "$"}
                            {plan.price}
                          </span>
                          {plan.price !== "Custom" && <span className="text-slate-500 text-[10px]">/mo</span>}
                        </div>

                        <div className="space-y-2 mb-6">
                          {plan.features.slice(0, 4).map((feature) => (
                            <div key={feature} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-purple-400" />
                              <span className="text-[10px] text-slate-400 line-clamp-1">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button 
                          onClick={() => handleSubscribe(plan.name)}
                          className={`w-full py-5 rounded-xl text-xs font-bold transition-all ${
                            plan.popular 
                              ? "bg-[#7C3AED] hover:bg-[#8B5CF6] text-white" 
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          {plan.buttonText}
                        </Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
