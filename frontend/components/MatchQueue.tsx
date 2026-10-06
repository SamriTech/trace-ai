"use client";

import React, { useState } from "react";
import { MatchCandidate } from "../lib/types";
import {
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from "lucide-react";

interface MatchQueueProps {
  candidates: MatchCandidate[];
  selectedCandidateId?: string | null;
  onSelectCandidate?: (id: string) => void;
  onReviewEvidence: (candidate: MatchCandidate) => void;
  onConfirmMatch: (candidate: MatchCandidate) => void;
  onDismissMatch: (trackletId: string) => void;
}

type FilterType = "ALL" | "UNREVIEWED" | "HIGH_SIM" | "CONFIRMED";

export default function MatchQueue({
  candidates = [],
  selectedCandidateId,
  onSelectCandidate,
  onReviewEvidence,
  onConfirmMatch,
  onDismissMatch,
}: MatchQueueProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filteredCandidates = candidates.filter((c) => {
    if (filter === "UNREVIEWED") return c.review_status === "UNREVIEWED";
    if (filter === "CONFIRMED") return c.review_status === "CONFIRMED";
    if (filter === "HIGH_SIM") return c.confidence_score >= 0.85;
    return true; // ALL
  });

  const unreviewedCount = candidates.filter((c) => c.review_status === "UNREVIEWED").length;

  return (
    <div className="flex-1 bg-[#111C44] rounded-lg border border-[#1E2E62] p-4 flex flex-col justify-between overflow-hidden shadow-lg">
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#1E2E62] pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold text-[#06B6D4] tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#06B6D4] rounded-none" />
                MATCH QUEUE
              </h2>
              <span className="text-[10px] font-mono bg-[#070D1D] text-[#D4AF37] px-2 py-0.5 rounded border border-[#1E2E62] font-bold">
                {candidates.length} CANDIDATES
              </span>
            </div>
            {unreviewedCount > 0 && (
              <span className="text-[9px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/30 animate-pulse">
                {unreviewedCount} PENDING REVIEW
              </span>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 mt-2.5 bg-[#070D1D] p-1 rounded border border-[#1E2E62]">
            {(
              [
                { key: "ALL", label: "ALL" },
                { key: "UNREVIEWED", label: "PENDING" },
                { key: "HIGH_SIM", label: ">85% SIM" },
                { key: "CONFIRMED", label: "REVIEWED" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`text-[10px] font-mono py-1 rounded transition-all ${
                  filter === tab.key
                    ? "bg-[#111C44] text-[#D4AF37] font-bold shadow-sm"
                    : "text-[#94A3B8] hover:text-[#E5E7EB]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1 pb-2">
          {filteredCandidates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#94A3B8]">
              <span className="text-xs font-mono font-semibold tracking-wider">
                {candidates.length === 0
                  ? "AWAITING TARGET RE-ID QUERY..."
                  : "NO CANDIDATES MATCH CURRENT FILTER"}
              </span>
              <span className="text-[10px] text-[#64748B] font-mono mt-1 max-w-50">
                {candidates.length === 0
                  ? "Upload a target photo and run search to populate candidates."
                  : "Switch filters to view other potential CCTV matches."}
              </span>
            </div>
          ) : (
            filteredCandidates.map((c) => {
              const isSelected = c.tracklet_id === selectedCandidateId;
              const isConfirmed = c.review_status === "CONFIRMED";
              const isFeasible = c.feasibility_badge !== "Unfeasible";
              const similarityScore = c.confidence_score * 100;

              return (
                <div
                  key={c.tracklet_id}
                  onClick={() => onSelectCandidate && onSelectCandidate(c.tracklet_id)}
                  className={`relative bg-[#070D1D] rounded-md border p-3 flex flex-col gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                      : isConfirmed
                      ? "border-[#22C55E]/60 hover:border-[#22C55E]"
                      : "border-[#1E2E62] hover:border-[#06B6D4]/60"
                  }`}
                >
                  {/* Top Bar: Camera, Track #, Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-[#E5E7EB]">
                          {c.camera_id}
                        </span>
                        {c.original_track_id && (
                          <span className="text-[9px] font-mono text-[#94A3B8] bg-[#111C44] px-1.5 py-0.2 rounded border border-[#1E2E62]">
                            Track #{c.original_track_id}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#94A3B8] line-clamp-1 mt-0.5">
                        {c.location_name || "Addis Ababa CCTV Corridor"}
                      </span>
                    </div>

                    {/* Review Status Badge */}
                    <div className="shrink-0">
                      {isConfirmed ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded border border-[#22C55E]/30">
                          <Check className="w-2.5 h-2.5" />
                          REVIEWED
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/30">
                          POSSIBLE MATCH
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Thumbnail Crop + Similarity Meter */}
                  <div className="flex gap-3">
                    {/* Crop Thumbnail */}
                    <div className="relative w-16 h-20 bg-[#111C44] rounded border border-[#1E2E62] overflow-hidden shrink-0 flex items-center justify-center">
                      {c.crop_url ? (
                        <img
                          src={c.crop_url}
                          alt="CCTV Crop"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-1 text-[8px] font-mono text-[#06B6D4]">
                          <span>CCTV CROP</span>
                          <span>#{c.original_track_id || "42"}</span>
                        </div>
                      )}
                    </div>

                    {/* Similarity Meter & Kinematics */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        {/* Similarity Score */}
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="text-[#94A3B8] text-[10px]">VISUAL SIMILARITY</span>
                          <span className="font-bold text-[#D4AF37]">
                            {similarityScore.toFixed(1)}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-[#111C44] rounded-full overflow-hidden border border-[#1E2E62]">
                          <div
                            className={`h-full rounded-full ${
                              similarityScore >= 90
                                ? "bg-[#22C55E]"
                                : similarityScore >= 80
                                ? "bg-[#D4AF37]"
                                : "bg-[#06B6D4]"
                            }`}
                            style={{ width: `${Math.min(similarityScore, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Timestamp & Kinematics */}
                      <div className="flex flex-col gap-1 mt-1 text-[10px] font-mono">
                        <span className="text-[#94A3B8]">
                          {new Date(c.timestamp).toLocaleString()}
                        </span>
                        <div
                          className={`inline-flex items-center gap-1 text-[9px] font-semibold ${
                            isFeasible ? "text-[#22C55E]" : "text-[#EF4444]"
                          }`}
                        >
                          {isFeasible ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>
                                FEASIBLE — {c.kinematics.transit_mode.toUpperCase()} (
                                {c.kinematics.velocity_kmh.toFixed(1)} km/h)
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>
                                INFEASIBLE TRAJECTORY ({c.kinematics.velocity_kmh.toFixed(1)} km/h)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#1E2E62]/70">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReviewEvidence(c);
                      }}
                      className="flex-1 bg-[#111C44] hover:bg-[#1E2E62] border border-[#D4AF37]/50 text-[#D4AF37] hover:text-[#E5E7EB] py-1.5 rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3 h-3" />
                      REVIEW EVIDENCE
                    </button>

                    {!isConfirmed ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfirmMatch(c);
                        }}
                        className="bg-[#22C55E]/10 hover:bg-[#22C55E] text-[#22C55E] hover:text-black border border-[#22C55E]/40 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold transition-all"
                        title="Confirm Sighting"
                      >
                        CONFIRM
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissMatch(c.tracklet_id);
                        }}
                        className="bg-[#EF4444]/10 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/40 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold transition-all"
                        title="Remove Confirmation"
                      >
                        REMOVE
                      </button>
                    )}

                    {!isConfirmed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissMatch(c.tracklet_id);
                        }}
                        className="bg-[#070D1D] hover:bg-[#EF4444]/20 text-[#64748B] hover:text-[#EF4444] border border-[#1E2E62] px-2 py-1.5 rounded text-[10px] font-mono transition-all"
                        title="Dismiss Match"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
