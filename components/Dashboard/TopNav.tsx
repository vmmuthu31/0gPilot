"use client";

import React from "react";
import { 
  Bell, 
  BookOpen, 
  MessageSquare,
  Search,
  Command
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const TopNav = () => {
  return (
    <div className="h-16 border-b border-white/5 bg-[#050816]/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects, agents, docs..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/40 focus:bg-white/10 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-slate-500">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
          <BookOpen className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
          <MessageSquare className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#050816]" />
        </button>
        
        <div className="h-8 w-px bg-white/10 mx-2" />
        
        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
      </div>
    </div>
  );
};
