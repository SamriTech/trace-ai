"use client";

import React from "react";
import { Plus, User, ShieldCheck } from "lucide-react";

interface NavbarProps {
  caseId?: string;
  investigatorName?: string;
  onNewInvestigation?: () => void;
}

export default function Navbar({
  caseId = "MP-2048",
  investigatorName = "INV. YONAS TESFAYE",
  onNewInvestigation,
}: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between shrink-0 select-none shadow-xs">
      {/* Left Title: INVESTIGATION | Case #MP-2048 | ACTIVE */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold font-mono tracking-tight text-[#0F172A] uppercase">
          INVESTIGATION
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-[#D4AF37]">
            Case #{caseId}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC] text-[10px] font-mono font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            ACTIVE
          </div>
        </div>
      </div>

      {/* Right Controls: Authorized User + New Investigation Button */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#64748B]">
          <User className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>AUTHORIZED USER: <strong className="text-[#334155]">{investigatorName}</strong></span>
        </div>

        {onNewInvestigation && (
          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-1.5 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/60 px-4 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all shadow-sm active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>NEW INVESTIGATION</span>
          </button>
        )}
      </div>
    </header>
  );
}
