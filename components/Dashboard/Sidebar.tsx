"use client";

import React from "react";
import { 
  Home, 
  Folders, 
  LayoutTemplate, 
  Users, 
  Rocket, 
  Blocks, 
  Settings,
  Sparkles,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const menuItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Folders, label: "Projects", href: "/dashboard/projects" },
  { icon: LayoutTemplate, label: "Templates", href: "/dashboard/templates" },
  { icon: Users, label: "Agents", href: "/dashboard/agents" },
  { icon: Rocket, label: "Deployments", href: "/dashboard/deployments" },
  { icon: Blocks, label: "Integrations", href: "/dashboard/integrations" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[#050816]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 p-1">
            <div className="w-full h-full rounded-full bg-[#050816] flex items-center justify-center">
               <Image src="/logo.png" width={20} height={20} alt="Logo" className="rounded-full" />
            </div>
          </div>
          <span className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
            OGPilot
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-purple-400" : "group-hover:text-purple-400"}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        <button className="w-full p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-500/10 border border-purple-500/20 flex flex-col gap-2 group hover:border-purple-500/40 transition-all">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Upgrade Pro</span>
          </div>
          <p className="text-[10px] text-slate-500 text-left leading-tight">
            Get 10x more generations and advanced agents.
          </p>
        </button>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold text-white">0xPilot...7a83</span>
                <span className="text-[10px] text-emerald-400 font-medium">Connected</span>
             </div>
          </div>
          <button className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
