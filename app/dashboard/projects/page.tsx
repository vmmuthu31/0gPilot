"use client";

import  { useState } from "react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { TopNav } from "@/components/Dashboard/TopNav";
import { ProjectsList } from "@/components/Dashboard/Projects/ProjectsList";
import { CreateProjectFlow } from "@/components/Dashboard/Projects/CreateProjectFlow";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectsPage() {
  const [isCreating, setIsCreating] = useState(false);
  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />
      
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        <TopNav />
        
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!isCreating ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                <ProjectsList onCreateNew={() => setIsCreating(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                <CreateProjectFlow onCancel={() => setIsCreating(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
