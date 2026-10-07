"use client";

import React, { useState } from "react";
import { MatchCandidate } from "../lib/types";
import {
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  ZoomIn,
  SkipBack,
  SkipForward,
  Info,
  Check,
  Search,
  Sliders,
  ShieldAlert,
  Activity,
} from "lucide-react";

interface PossibleSightingsStudioViewProps {
  candidates: MatchCandidate[];
  caseId?: string;
  searchError?: string | null;
  onConfirmSighting: (candidate: MatchCandidate) => void;
  onMarkUncertain: (trackletId: string) => void;
  onRejectSighting: (trackletId: string) => void;
  onLoadDemoData?: () => void;
}

export default function PossibleSightingsStudioView({
  candidates,
  caseId = "MP-2048",
  searchError = null,
  onConfirmSighting,
  onMarkUncertain,
  onRejectSighting,
  onLoadDemoData,
}: PossibleSightingsStudioViewProps) {
  const [selectedTrackletId, setSelectedTrackletId] = useState<string>(
    candidates[0]?.tracklet_id || ""
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [notes, setNotes] = useState<{ [id: string]: string }>({});

  // Resolve active candidate safely
  const selectedCandidate =
    candidates.find((c) => c.tracklet_id === selectedTrackletId) || candidates[0];

  const unreviewedCount = candidates.filter(
    (c) => c.review_status === "UNREVIEWED"
  ).length;

  const handleNotesChange = (text: string) => {
    if (!selectedCandidate) return;
    setNotes((prev) => ({ ...prev, [selectedCandidate.tracklet_id]: text }));
  };

  return (
    <div className="flex-1 bg-[#F4F6FA] flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-8 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold font-mono tracking-tight text-[#0F172A] uppercase">
            POSSIBLE SIGHTINGS
          </h1>
          <span className="text-xs font-mono text-[#D4AF37] font-bold">
            Case: {caseId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {candidates.length > 0 ? (
            <span className="text-xs font-mono text-[#64748B]">
              <strong className="text-[#0F172A]">{candidates.length}</strong> Qdrant matches ({unreviewedCount} unreviewed)
            </span>
          ) : (
            <span className="text-xs font-mono text-[#94A3B8]">
              0 matches in database
            </span>
          )}
          {onLoadDemoData && candidates.length === 0 && (
            <button
              onClick={onLoadDemoData}
              className="px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] rounded text-[10px] font-mono font-semibold transition-all"
            >
              LOAD DEMO DATA
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Body or Empty / Error State */}
      {candidates.length === 0 ? (
        <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
          {searchError ? (
            <div className="bg-[#1A0C0C] text-white p-6 rounded-lg border border-[#EF4444]/60 max-w-lg flex flex-col gap-3 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-[#EF4444] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-mono font-bold text-[#FCA5A5] uppercase">
                    SEARCH SERVICE ERROR
                  </h3>
                  <p className="text-xs font-mono text-[#FCA5A5]/80 mt-1 leading-relaxed">
                    {searchError}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-8 flex flex-col items-center justify-center text-center max-w-md shadow-xs gap-4">
              <div className="w-14 h-14 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                <Search className="w-7 h-7 text-[#94A3B8]" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-[#0F172A] tracking-wider uppercase">
                  NO MATCHING SIGHTINGS FOUND
                </h3>
                <p className="text-xs font-mono text-[#64748B] mt-1.5 leading-relaxed">
                  No candidate person tracklets in the surveillance grid exceeded the similarity threshold (&ge;0.60) for subject <strong>{caseId}</strong>.
                </p>
              </div>

              <div className="bg-[#F8FAFC] p-3.5 rounded border border-[#E2E8F0] text-[11px] font-mono text-[#64748B] text-left flex flex-col gap-1 w-full">
                <span className="font-bold text-[#475569] uppercase text-[10px]">
                  Next Steps:
                </span>
                <span>1. Ingest surveillance footage from relevant cameras via the CCTV Sources tab.</span>
                <span>2. Re-run search with a higher quality frontal reference photo.</span>
              </div>

              {onLoadDemoData && (
                <button
                  onClick={onLoadDemoData}
                  className="mt-1 px-4 py-2 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/50 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>LOAD SAMPLE DEMO CASE (SIMULATION MODE)</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 3-Column Studio Layout */
        <div className="flex-1 p-4 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: EVIDENCE LIST (25%)                                         */}
          {/* ========================================================================= */}
          <div className="col-span-12 lg:col-span-3 bg-white rounded-lg border border-[#E2E8F0] p-3 flex flex-col gap-2.5 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <span className="text-[10px] font-mono font-bold text-[#475569] uppercase tracking-wider">
                EVIDENCE LIST ({candidates.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
              {candidates.map((cand, idx) => {
                const isSelected = cand.tracklet_id === (selectedCandidate?.tracklet_id || selectedTrackletId);
                const similarityScore = Math.round(cand.confidence_score * 100);
                const isUncertain =
                  cand.feasibility_badge === "Unfeasible" || cand.confidence_score < 0.75;
                const isRejected = cand.review_status === "DISMISSED";
                const isConfirmed = cand.review_status === "CONFIRMED";

                return (
                  <div
                    key={cand.tracklet_id || idx}
                    onClick={() => setSelectedTrackletId(cand.tracklet_id)}
                    className={`p-2.5 rounded border transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? "bg-[#FFFDF5] border-[#D4AF37] shadow-xs"
                        : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-14 bg-[#071026] rounded border border-[#152347] flex items-center justify-center shrink-0 overflow-hidden">
                      {cand.crop_url ? (
                        <img
                          src={cand.crop_url}
                          alt="Crop"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-7 border border-[#D4AF37] bg-[#D4AF37]/10 flex items-center justify-center">
                          <User className="w-3 h-3 text-[#D4AF37]" />
                        </div>
                      )}
                      <span className="absolute top-0.5 left-1 text-[7px] font-mono text-[#D4AF37] font-bold">
                        {cand.camera_id}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#0F172A]">
                          {cand.camera_id}
                        </span>
                        {isConfirmed ? (
                          <span className="text-[8px] font-mono font-bold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.2 rounded">
                            CONFIRMED
                          </span>
                        ) : isRejected ? (
                          <span className="text-[8px] font-mono font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.2 rounded">
                            ● REJECTED
                          </span>
                        ) : isUncertain ? (
                          <span className="text-[8px] font-mono font-bold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.2 rounded">
                            ● UNCERTAIN
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.2 rounded">
                            ● UNREVIEWED
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-[#64748B]">
                        {new Date(cand.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>

                      <span className="text-[10px] text-[#475569] truncate">
                        {cand.location_name || `Node ${cand.camera_id}`}
                      </span>

                      {/* Similarity bar */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D4AF37] rounded-full"
                            style={{ width: `${similarityScore}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#64748B]">
                          {similarityScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER COLUMN: CCTV PLAYER STUDIO VIEWPORT (50%)                          */}
          {/* ========================================================================= */}
          <div className="col-span-12 lg:col-span-6 bg-[#071026] rounded-lg border border-[#152347] flex flex-col justify-between overflow-hidden shadow-lg relative">
            {/* Top Video Overlay Banner */}
            <div className="p-3 bg-linear-to-b from-black/80 to-transparent flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-mono font-bold">
                <span>{selectedCandidate?.camera_id || "CAM-01"}</span>
                <span>
                  {selectedCandidate
                    ? new Date(selectedCandidate.timestamp).toLocaleTimeString()
                    : "--:--:--"}
                </span>
                <span className="text-[#E5E7EB] font-normal">● REAL MATCH - </span>
                <span>
                  {selectedCandidate
                    ? `${Math.round(selectedCandidate.confidence_score * 100)}% SIMILARITY`
                    : "0% SIMILARITY"}
                </span>
              </div>
            </div>

            {/* Main Viewport Canvas */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6">
              {/* Ambient Grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#16244e15_1px,transparent_1px),linear-gradient(to_bottom,#16244e15_1px,transparent_1px)] bg-size-[20px_20px]" />

              {selectedCandidate?.crop_url ? (
                <div className="relative z-10 max-h-72 max-w-xs border-2 border-[#D4AF37] rounded overflow-hidden shadow-2xl bg-black/40">
                  <img
                    src={selectedCandidate.crop_url}
                    alt="Best Sharpness Crop"
                    className="max-h-72 object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-[#D4AF37] text-black font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-xs">
                    TRACK A{selectedCandidate.original_track_id ?? "01"}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-[#D4AF37] font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#D4AF37]/40">
                    {Math.round(selectedCandidate.confidence_score * 100)}% Match
                  </div>
                </div>
              ) : (
                /* Target Person Bounding Box fallback */
                <div className="relative z-10 border-2 border-[#D4AF37] bg-[#D4AF37]/10 w-24 h-48 flex flex-col justify-between p-1 animate-pulse">
                  <span className="text-[8px] font-mono bg-[#D4AF37] text-black px-1 py-0.2 font-bold self-start rounded-xs">
                    TRACK A{selectedCandidate?.original_track_id || "01"}
                  </span>

                  <div className="self-center mb-4 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#475569]" />
                    <div className="w-10 h-16 bg-[#475569] rounded-t-md mt-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Video Playback Bar */}
            <div className="bg-[#050B1B] border-t border-[#152347] px-4 py-2.5 flex flex-col gap-1.5 z-10">
              <div className="w-full bg-[#1E2E62] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#D4AF37] h-full w-full" />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-[#E5E7EB] text-xs font-mono">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="hover:text-[#D4AF37] transition-colors">
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button className="hover:text-[#D4AF37] transition-colors">
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#D4AF37] font-bold">
                    {selectedCandidate
                      ? new Date(selectedCandidate.timestamp).toLocaleTimeString()
                      : "--:--:--"}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">
                    GPS: ({selectedCandidate?.lat?.toFixed(4)}, {selectedCandidate?.lon?.toFixed(4)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: EVIDENCE DETAILS & ACTIONS (25%)                           */}
          {/* ========================================================================= */}
          <div className="col-span-12 lg:col-span-3 bg-white rounded-lg border border-[#E2E8F0] p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-xs">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-mono font-bold text-[#475569] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
                EVIDENCE DETAILS
              </span>

              {/* Metadata */}
              <div className="flex flex-col gap-2.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#64748B] block">Camera Node</span>
                  <strong className="text-[#0F172A] font-bold">
                    {selectedCandidate?.camera_id}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Location / GPS</span>
                  <span className="text-[#0F172A] font-medium">
                    {selectedCandidate?.location_name || `Node ${selectedCandidate?.camera_id} (${selectedCandidate?.lat?.toFixed(4)}, ${selectedCandidate?.lon?.toFixed(4)})`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Capture Timestamp</span>
                  <span className="text-[#0F172A] font-medium">
                    {selectedCandidate
                      ? new Date(selectedCandidate.timestamp).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }) + " · " + new Date(selectedCandidate.timestamp).toLocaleTimeString()
                      : "--"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Track ID</span>
                  <span className="text-[#0F172A] font-medium">
                    {selectedCandidate?.original_track_id ? `A${selectedCandidate.original_track_id}` : `ID ${selectedCandidate?.tracklet_id?.slice(0, 8)}`}
                  </span>
                </div>

                {/* Similarity */}
                <div>
                  <span className="text-[10px] text-[#64748B] block mb-1">VISUAL SIMILARITY</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D4AF37] rounded-full"
                        style={{
                          width: `${Math.round((selectedCandidate?.confidence_score || 0) * 100)}%`,
                        }}
                      />
                    </div>
                    <strong className="text-[#D4AF37] text-xs font-bold">
                      {Math.round((selectedCandidate?.confidence_score || 0) * 100)}%
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Kinematics Trajectory</span>
                  <span className={`font-bold ${selectedCandidate?.feasibility_badge === 'Unfeasible' ? 'text-[#EF4444]' : 'text-[#16A34A]'}`}>
                    {selectedCandidate?.feasibility_badge || 'Feasible'} ({selectedCandidate?.kinematics?.velocity_kmh} km/h {selectedCandidate?.kinematics?.transit_mode})
                  </span>
                </div>
              </div>

              {/* AI Disclaimer Box */}
              <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded p-2.5 text-[10px] font-mono text-[#854D0E] italic leading-relaxed">
                <strong className="not-italic text-[#713F12]">AI ASSISTED RESULT:</strong> This
                result indicates visual feature similarity and requires human verification.
              </div>

              {/* Investigator Action Buttons */}
              <div className="flex flex-col gap-2 pt-1 border-t border-[#F1F5F9]">
                <span className="text-[10px] font-mono font-bold text-[#475569] uppercase tracking-wider">
                  INVESTIGATOR ACTIONS
                </span>

                {/* Confirm Sighting */}
                <button
                  onClick={() => selectedCandidate && onConfirmSighting(selectedCandidate)}
                  className="w-full py-2 px-3 bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-[#15803D] rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>CONFIRM SIGHTING</span>
                </button>

                {/* Mark Uncertain */}
                <button
                  onClick={() => selectedCandidate && onMarkUncertain(selectedCandidate.tracklet_id)}
                  className="w-full py-2 px-3 bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] text-[#B45309] rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
                >
                  <span>~ MARK UNCERTAIN</span>
                </button>

                {/* Reject */}
                <button
                  onClick={() => selectedCandidate && onRejectSighting(selectedCandidate.tracklet_id)}
                  className="w-full py-2 px-3 bg-white hover:bg-[#FEE2E2] border border-[#FCA5A5] text-[#DC2626] rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>✕ REJECT</span>
                </button>
              </div>

              {/* Investigator Notes */}
              <div className="flex flex-col gap-1 pt-1 border-t border-[#F1F5F9]">
                <span className="text-[10px] font-mono font-bold text-[#475569] uppercase tracking-wider">
                  INVESTIGATOR NOTES
                </span>
                <textarea
                  rows={3}
                  placeholder="Add notes about this sighting..."
                  value={notes[selectedCandidate?.tracklet_id || ""] || ""}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded p-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

