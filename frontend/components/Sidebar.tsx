"use client";

import React from "react";
import PoliceEmblem from "./PoliceEmblem";
import {
  Home,
  FolderOpen,
  Camera,
  Search,
  Clock,
  Map,
  Radio,
  Settings,
  Shield,
  Activity,
  ChevronRight,
} from "lucide-react";

export type NavTab =
  | "overview"
  | "investigations"
  | "cctv_sources"
  | "possible_sightings"
  | "timeline"
  | "investigation_map"
  | "live_cctv"
  | "settings";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  caseId?: string;
  backendOnline?: boolean;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  caseId = "MP-2048",
  backendOnline = true,
}: SidebarProps) {
  const navItems = [
    { id: "overview" as NavTab, label: "Overview", icon: Home },
    { id: "investigations" as NavTab, label: "Investigations", icon: FolderOpen },
    { id: "cctv_sources" as NavTab, label: "CCTV Sources", icon: Camera },
    { id: "possible_sightings" as NavTab, label: "Possible Sightings", icon: Search },
    { id: "timeline" as NavTab, label: "Timeline", icon: Clock },
    { id: "investigation_map" as NavTab, label: "Investigation Map", icon: Map },
    { id: "live_cctv" as NavTab, label: "Live CCTV", icon: Radio },
    { id: "settings" as NavTab, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#071026] text-[#E5E7EB] flex flex-col justify-between border-r border-[#152347] shrink-0 select-none h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      {/* Top Branding Section */}
      <div className="flex flex-col">
        {/* Police Branding Header */}
        <div className="p-4 border-b border-[#152347] flex items-center gap-3">
          <PoliceEmblem className="w-9 h-9 shrink-0 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
          <div className="flex flex-col">
            <h1 className="text-[11px] font-bold tracking-wider text-[#D4AF37] leading-tight uppercase font-mono">
              ETHIOPIAN FEDERAL POLICE
            </h1>
            <span className="text-[9px] font-mono text-[#94A3B8] tracking-widest uppercase">
              AI INVESTIGATION PLATFORM
            </span>
          </div>
        </div>

        {/* Active Case Header Card */}
        <div className="px-5 py-3.5 border-b border-[#152347] bg-[#0B1736]/40">
          <span className="text-[9px] font-mono text-[#94A3B8] tracking-widest uppercase block">
            ACTIVE CASE
          </span>
          <span className="text-base font-bold text-[#D4AF37] tracking-wider font-mono">
            {caseId}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-mono font-medium transition-all text-left group ${
                  isActive
                    ? "bg-[#111C44] text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-[inset_0_1px_0_rgba(212,175,55,0.2)] font-semibold"
                    : "text-[#94A3B8] hover:text-[#E5E7EB] hover:bg-[#0E1A3D]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-[#D4AF37]" : "text-[#64748B] group-hover:text-[#94A3B8]"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status Section */}
      <div className="p-4 border-t border-[#152347] bg-[#050B1B] flex flex-col gap-3">
        <div className="flex flex-col gap-1.5 text-[10px] font-mono">
          <span className="text-[9px] font-bold text-[#94A3B8] tracking-wider uppercase mb-0.5">
            SYSTEM STATUS
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendOnline ? "bg-[#22C55E] shadow-[0_0_6px_#22C55E]" : "bg-[#EF4444]"
              }`}
            />
            <span className="text-[#CBD5E1]">
              AI Engine {backendOnline ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E]" />
            <span className="text-[#CBD5E1]">CCTV Network Connected</span>
          </div>

          <span className="text-[#64748B] text-[9px] mt-0.5">Last sync: 12 sec ago</span>
        </div>

        {/* Secure Session Button */}
        <div className="pt-1">
          <div className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded border border-[#D4AF37]/40 bg-[#111C44]/50 text-[#D4AF37] text-[10px] font-mono font-semibold tracking-wider">
            <Shield className="w-3 h-3" />
            <span>SECURE SESSION</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
