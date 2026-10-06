"use client";

import React from "react";
import { Sighting } from "../lib/types";
import { Clock, MapPin, CheckCircle2, AlertTriangle, ArrowDown } from "lucide-react";

interface TimelineViewProps {
  sightings: Sighting[];
  selectedSightingId?: string | null;
  onSelectSighting?: (id: string) => void;
}

export default function TimelineView({
  sightings,
  selectedSightingId,
  onSelectSighting,
}: TimelineViewProps) {
  const sorted = [...sightings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="flex-1 bg-[#F4F6FA] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-mono font-bold text-[#0F172A] tracking-wider uppercase">
          CHRONOLOGICAL SIGHTING TIMELINE
        </h2>
        <p className="text-xs text-[#64748B] font-mono">
          Sequential transit progression of confirmed subject sightings
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 text-center text-[#64748B] font-mono text-xs">
          NO CONFIRMED SIGHTINGS YET.
          <p className="mt-1 text-[11px] text-[#94A3B8]">
            Review candidate matches in Overview or Possible Sightings to plot the chronological route.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl flex flex-col gap-4 relative">
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-[#CBD5E1] z-0" />

          {sorted.map((s, idx) => {
            const isSelected = s.id === selectedSightingId;
            const isFeasible = s.feasibility_badge !== "Unfeasible";

            return (
              <div key={s.id || idx} className="flex items-start gap-5 relative z-10">
                {/* Numbered Node Badge */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm shrink-0 border-2 shadow-sm ${
                    isSelected
                      ? "bg-[#D4AF37] text-black border-white shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                      : "bg-[#071026] text-[#D4AF37] border-[#D4AF37]"
                  }`}
                >
                  #{s.sequenceNumber || idx + 1}
                </div>

                {/* Event Card */}
                <div
                  onClick={() => onSelectSighting && onSelectSighting(s.id)}
                  className={`flex-1 bg-white rounded-lg border p-4 shadow-xs cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#0F172A]">
                          {s.camera_id}
                        </span>
                        <span className="text-xs text-[#64748B]">{s.location_name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#64748B] block mt-0.5">
                        {new Date(s.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                      {(s.similarity_score * 100).toFixed(1)}% SIMILARITY
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#64748B]">
                      Transit Mode: <strong className="text-[#334155] uppercase">{s.kinematics.transit_mode}</strong> (
                      {s.kinematics.velocity_kmh.toFixed(1)} km/h)
                    </span>
                    <span
                      className={`font-semibold ${
                        isFeasible ? "text-[#16A34A]" : "text-[#DC2626]"
                      }`}
                    >
                      {isFeasible ? "✓ FEASIBLE TRANSIT" : "⚠ INFEASIBLE"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
