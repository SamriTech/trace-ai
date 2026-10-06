"use client";

import React from "react";
import { Sighting } from "../lib/types";
import { Clock, MapPin, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface TimelineScrubberProps {
  sightings: Sighting[];
  selectedSightingId?: string | null;
  onSelectSighting?: (id: string) => void;
}

export default function TimelineScrubber({
  sightings = [],
  selectedSightingId,
  onSelectSighting,
}: TimelineScrubberProps) {
  const sortedSightings = [...sightings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="w-full h-full bg-[#111C44] rounded-lg border border-[#1E2E62] p-3 flex flex-col justify-between shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2E62] pb-1.5 mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <h3 className="text-xs font-mono font-bold text-[#E5E7EB] tracking-wider uppercase">
            SIGHTING TIMELINE
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#D4AF37] bg-[#070D1D] px-2 py-0.5 rounded border border-[#1E2E62]">
            {sightings.length} VERIFIED {sightings.length === 1 ? "NODE" : "NODES"}
          </span>
        </div>
      </div>

      {/* Scrubber Track */}
      <div className="flex-1 flex items-center relative overflow-x-auto custom-scrollbar pb-1">
        {sortedSightings.length === 0 ? (
          <div className="w-full py-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-mono text-[#94A3B8] tracking-wider font-semibold">
              NO CONFIRMED SIGHTINGS YET
            </span>
            <span className="text-[10px] text-[#64748B] font-mono mt-0.5">
              Review candidates in the match queue to plot trajectory nodes.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-max min-w-full px-2 py-1">
            {sortedSightings.map((sighting, idx) => {
              const isSelected = sighting.id === selectedSightingId;
              const isFeasible = sighting.feasibility_badge !== "Unfeasible";
              const timeFormatted = new Date(sighting.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div key={sighting.id || idx} className="flex items-center gap-3 shrink-0">
                  {/* Event Card */}
                  <div
                    onClick={() => onSelectSighting && onSelectSighting(sighting.id)}
                    className={`cursor-pointer p-2.5 rounded-md border transition-all flex flex-col gap-1 min-w-42.5 select-none ${
                      isSelected
                        ? "bg-[#070D1D] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                        : "bg-[#070D1D]/80 border-[#1E2E62] hover:border-[#D4AF37]/50"
                    }`}
                  >
                    {/* Card Top: Node Number & Time */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#111C44] px-1.5 py-0.2 rounded border border-[#1E2E62]">
                        NODE #{sighting.sequenceNumber || idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-[#E5E7EB] font-semibold">
                        {timeFormatted}
                      </span>
                    </div>

                    {/* Camera & Location */}
                    <div className="flex flex-col mt-0.5">
                      <span className="text-xs font-mono font-bold text-[#E5E7EB] truncate">
                        {sighting.camera_id}
                      </span>
                      <span className="text-[9px] text-[#94A3B8] truncate" title={sighting.location_name}>
                        {sighting.location_name}
                      </span>
                    </div>

                    {/* Similarity & Feasibility */}
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#1E2E62]/70 text-[10px] font-mono">
                      <span className="text-[#06B6D4] font-bold">
                        {(sighting.similarity_score * 100).toFixed(1)}% SIM
                      </span>
                      <span
                        className={`flex items-center gap-0.5 text-[9px] font-semibold ${
                          isFeasible ? "text-[#22C55E]" : "text-[#EF4444]"
                        }`}
                      >
                        {isFeasible ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            FEASIBLE
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-2.5 h-2.5" />
                            INFEASIBLE
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Connecting Trajectory Step Arrow */}
                  {idx < sortedSightings.length - 1 && (
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="w-4 h-0.5 bg-[#D4AF37]/60" />
                      <div className="text-[8px] font-mono text-[#94A3B8]">➔</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
