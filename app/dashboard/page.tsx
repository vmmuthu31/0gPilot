"use client";

import React from "react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { TopNav } from "@/components/Dashboard/TopNav";
import { MainView } from "@/components/Dashboard/MainView";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      {/* Immersive background particles or gradient can be added here if needed to match landing */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />
      
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-y-auto">
        <TopNav />
        <MainView />
      </div>
    </main>
  );
}
