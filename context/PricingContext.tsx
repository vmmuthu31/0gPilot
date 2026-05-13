"use client";

import React, { createContext, useContext, useState } from "react";

type Plan = {
  name: string;
  price: string;
  desc: string;
  features: string[];
  buttonText: string;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
};

type PricingContextType = {
  isOpen: boolean;
  openModal: (plan?: Plan) => void;
  closeModal: () => void;
  selectedPlan: Plan | null;
};

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const openModal = (plan?: Plan) => {
    if (plan) setSelectedPlan(plan);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <PricingContext.Provider value={{ isOpen, openModal, closeModal, selectedPlan }}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
};
