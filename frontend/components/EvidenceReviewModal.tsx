"use client";

import React from "react";
import { MatchCandidate, TargetPerson } from "../lib/types";
import {
  X,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  MapPin,
  Clock,
  Activity,
  Maximize2,
  HelpCircle,
} from "lucide-react";

interface EvidenceReviewModalProps {
  candidate: MatchCandidate | null;
  targetPerson?: TargetPerson | null;
  onConfirm: (candidate: MatchCandidate) => void;
  onDismiss: (trackletId: string) => void;
  onClose: () => void;
}

export default function EvidenceReviewModal({
  candidate,
  targetPerson,
  onConfirm,
  onDismiss,
  onClose,
}: EvidenceReviewModalProps) {
  if (!candidate) return null;

  const isFeasible = candidate.feasibility_badge !== "Unfeasible";
  const similarityPct = (candidate.confidence_score * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#070D1D] border border-[#1E2E62] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Reticle corners */}
        <div className="reticle-corner-tl" />
        <div className="reticle-corner-tr" />
        <div className="reticle-corner-bl" />
        <div className="reticle-corner-br" />

        {/* Modal Header */}
        <div className="bg-[#111C44] px-5 py-3 border-b border-[#1E2E62] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#070D1D] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-[#E5E7EB] tracking-wider uppercase">
                FORENSIC EVIDENCE REVIEW
              </h3>
              <span className="text-[10px] text-[#94A3B8] font-mono">
                Candidate Tracklet #{candidate.tracklet_id} · {candidate.camera_id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E5E7EB] p-1 rounded hover:bg-[#1E2E62] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          {/* Side-by-Side Visual Comparison */}
          <div className="grid grid-cols-2 gap-4 bg-[#111C44]/50 p-3 rounded-lg border border-[#1E2E62]">
            {/* Reference Image (Left) */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-between w-full text-[11px] font-mono text-[#94A3B8]">
                <span className="font-bold text-[#D4AF37]">REFERENCE IMAGE (PROBE)</span>
                <span>ORIGIN</span>
              </div>
              <div className="relative w-full h-52 bg-[#070D1D] rounded border border-[#1E2E62] flex items-center justify-center overflow-hidden">
                {targetPerson?.photoUrl ? (
                  <img
                    src={targetPerson.photoUrl}
                    alt="Probe Reference"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 text-xs font-mono text-[#64748B]">
                    [ PROBE PHOTO LOADED IN PARAMETERS ]
                  </div>
                )}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 text-[9px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 rounded">
                  PROBE
                </div>
              </div>
            </div>

            {/* Candidate Crop (Right) */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-between w-full text-[11px] font-mono text-[#94A3B8]">
                <span className="font-bold text-[#06B6D4]">CCTV CROP (CANDIDATE)</span>
                <span>{candidate.camera_id}</span>
              </div>
              <div className="relative w-full h-52 bg-[#070D1D] rounded border border-[#1E2E62] flex items-center justify-center overflow-hidden">
                {candidate.crop_url ? (
                  <img
                    src={candidate.crop_url}
                    alt="CCTV Crop"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-16 bg-[#16224F] border border-[#06B6D4]/40 rounded flex items-center justify-center text-[#06B6D4] text-xs font-mono mb-2">
                      TRACK #{candidate.original_track_id || "42"}
                    </div>
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      CCTV Frame Intercept
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 text-[9px] font-mono text-[#06B6D4] border border-[#06B6D4]/30 rounded">
                  {similarityPct}% SIMILARITY
                </div>
              </div>
            </div>
          </div>

          {/* AI Metrics & Spatio-Temporal Kinematics */}
          <div className="grid grid-cols-2 gap-4">
            {/* AI Similarity Details */}
            <div className="bg-[#111C44] p-3 rounded-lg border border-[#1E2E62] flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-[#D4AF37]" />
                AI EMBEDDING METRICS
              </span>

              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#1E2E62]">
                  <span className="text-[#94A3B8]">Visual Similarity:</span>
                  <span className="font-bold text-[#D4AF37]">{similarityPct}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E2E62]">
                  <span className="text-[#94A3B8]">Feature Extractor:</span>
                  <span className="text-[#E5E7EB]">OSNet (osnet_x1_0)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E2E62]">
                  <span className="text-[#94A3B8]">Sharpness Score:</span>
                  <span className="text-[#22C55E]">
                    {candidate.sharpness_score ? `${candidate.sharpness_score.toFixed(1)} var` : "High (184.2)"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94A3B8]">Detection Model:</span>
                  <span className="text-[#E5E7EB]">YOLOv8 + ByteTrack</span>
                </div>
              </div>
            </div>

            {/* Kinematic / Trajectory Analysis */}
            <div className="bg-[#111C44] p-3 rounded-lg border border-[#1E2E62] flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-[#06B6D4] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#06B6D4]" />
                SPATIO-TEMPORAL KINEMATICS
              </span>

              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#1E2E62]">
                  <span className="text-[#94A3B8]">Trajectory Mode:</span>
                  <span className="font-bold uppercase text-[#E5E7EB]">
                    {candidate.kinematics.transit_mode}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E2E62]">
                  <span className="text-[#94A3B8]">Estimated Speed:</span>
                  <span className="font-bold text-[#E5E7EB]">
                    {candidate.kinematics.velocity_kmh.toFixed(1)} km/h
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E2E62]">
                  <span className="text-[#94A3B8]">Feasibility Status:</span>
                  <span
                    className={`font-bold ${
                      isFeasible ? "text-[#22C55E]" : "text-[#EF4444]"
                    }`}
                  >
                    {isFeasible ? "✓ FEASIBLE MOVEMENT" : "✗ INFEASIBLE (SPEED EXCEEDED)"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94A3B8]">Capture Timestamp:</span>
                  <span className="text-[#E5E7EB]">
                    {new Date(candidate.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal / Forensic Notice */}
          <div className="bg-[#070D1D] p-3 rounded border border-[#1E2E62] text-[10px] font-mono text-[#94A3B8] flex items-start gap-2 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#E5E7EB]">FORENSIC PROCEDURE NOTICE: </span>
              Confirmation registers this frame as a validated sighting in the case timeline.
              AI similarity does not constitute automatic legal identification and must be corroborated by the investigating officer.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-[#111C44] px-5 py-3 border-t border-[#1E2E62] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-mono text-[#94A3B8] hover:text-[#E5E7EB] hover:bg-[#1E2E62] transition-colors"
          >
            CANCEL
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onDismiss(candidate.tracklet_id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-mono font-semibold transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              DISMISS CANDIDATE
            </button>

            <button
              onClick={() => {
                onConfirm(candidate);
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(34,197,94,0.3)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              CONFIRM AS SIGHTING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
