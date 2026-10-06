"use client";

import React, { useState, useRef } from "react";
import { MatchCandidate, Sighting, TargetPerson } from "../lib/types";
import {
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Camera,
  Info,
  ArrowRight,
  Upload,
  Eye,
  Check,
} from "lucide-react";

interface OverviewViewProps {
  targetPerson: TargetPerson | null;
  onUpdateTargetPhoto?: (file: File) => void;
  candidates: MatchCandidate[];
  onReviewCandidate: (candidate: MatchCandidate) => void;
  onViewAllSightings: () => void;
}

type FilterOption = "ALL" | "UNREVIEWED" | "HIGH_SIMILARITY";

export default function OverviewView({
  targetPerson,
  onUpdateTargetPhoto,
  candidates,
  onReviewCandidate,
  onViewAllSightings,
}: OverviewViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCandidates = candidates.filter((c) => {
    if (activeFilter === "UNREVIEWED") return c.review_status === "UNREVIEWED";
    if (activeFilter === "HIGH_SIMILARITY") return c.confidence_score >= 0.85;
    return true;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdateTargetPhoto) {
      onUpdateTargetPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 bg-[#F4F6FA] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: MISSING PERSON + STATS                                      */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Missing Person Header */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono font-bold text-[#475569] tracking-wider uppercase">
              MISSING PERSON
            </span>

            {/* Missing Person Card */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs flex flex-col gap-4">
              {/* Photo Box with Tactical Reticles */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative bg-[#071026] rounded-md h-60 flex flex-col items-center justify-center overflow-hidden cursor-pointer group border border-[#152347]"
              >
                {/* Yellow Reticle Corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                {targetPerson?.photoUrl ? (
                  <img
                    src={targetPerson.photoUrl}
                    alt="Reference photograph"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3">
                    {/* Head + Body Silhouette */}
                    <div className="w-20 h-20 rounded-full bg-[#16244E] flex items-center justify-center text-[#475569] group-hover:text-[#D4AF37] transition-colors">
                      <User className="w-12 h-12 stroke-[1.2]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#D4AF37] tracking-widest uppercase">
                      REFERENCE PHOTOGRAPH
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 px-2 py-1 rounded text-[9px] font-mono text-[#D4AF37]">
                  Click to Change Photo
                </div>
              </div>

              {/* Case Details Grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-[10px] text-[#64748B] block">Case ID</span>
                  <strong className="text-[#0F172A] font-bold text-sm">MP-2048</strong>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Status</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    ACTIVE
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Last Known Location</span>
                  <span className="text-[#0F172A] font-medium">Bole, Addis Ababa</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Last Known Time</span>
                  <span className="text-[#0F172A] font-medium">10:42</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Investigator</span>
                  <span className="text-[#0F172A] font-medium">Yonas Tesfaye</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Date Opened</span>
                  <span className="text-[#0F172A] font-medium">21 Sep 2026</span>
                </div>

                <div className="col-span-2 pt-2 border-t border-[#F1F5F9]">
                  <span className="text-[10px] text-[#64748B] block">CCTV Footage Analyzed</span>
                  <span className="text-[#0F172A] font-medium">6 sources (11h 42m total)</span>
                </div>
              </div>

              {/* Review All Sightings CTA Button */}
              <button
                onClick={onViewAllSightings}
                className="w-full mt-2 py-3 px-4 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] font-mono font-bold text-xs tracking-wider rounded flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
              >
                <span>REVIEW ALL SIGHTINGS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2x2 Metric Stat Tiles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                POSSIBLE SIGHTINGS
              </span>
              <div className="mt-2">
                <span className="text-2xl font-bold font-mono text-[#0F172A] leading-none">18</span>
                <span className="text-[10px] font-mono text-[#64748B] block mt-1">
                  4 require review
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                CAMERAS ANALYZED
              </span>
              <div className="mt-2">
                <span className="text-2xl font-bold font-mono text-[#0F172A] leading-none">6</span>
                <span className="text-[10px] font-mono text-[#64748B] block mt-1">
                  2 processing
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                TRACKS IDENTIFIED
              </span>
              <div className="mt-2">
                <span className="text-2xl font-bold font-mono text-[#0F172A] leading-none">426</span>
                <span className="text-[10px] font-mono text-[#64748B] block mt-1">
                  across all footage
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                CONFIDENCE HIGH
              </span>
              <div className="mt-2">
                <span className="text-2xl font-bold font-mono text-[#0F172A] leading-none">3</span>
                <span className="text-[10px] font-mono text-[#64748B] block mt-1">
                  ≥85% similarity
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: POSSIBLE SIGHTINGS LIST                                     */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-3">
          {/* Header Bar: Title + Filter Tabs */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#475569] tracking-wider uppercase">
              POSSIBLE SIGHTINGS
            </span>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={`px-3 py-1 rounded border transition-all ${
                  activeFilter === "ALL"
                    ? "bg-white border-[#D4AF37] text-[#D4AF37] font-bold shadow-xs"
                    : "bg-white/60 border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setActiveFilter("UNREVIEWED")}
                className={`px-3 py-1 rounded border transition-all ${
                  activeFilter === "UNREVIEWED"
                    ? "bg-white border-[#D4AF37] text-[#D4AF37] font-bold shadow-xs"
                    : "bg-white/60 border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                UNREVIEWED
              </button>
              <button
                onClick={() => setActiveFilter("HIGH_SIMILARITY")}
                className={`px-3 py-1 rounded border transition-all ${
                  activeFilter === "HIGH_SIMILARITY"
                    ? "bg-white border-[#D4AF37] text-[#D4AF37] font-bold shadow-xs"
                    : "bg-white/60 border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                HIGH SIMILARITY
              </button>
            </div>
          </div>

          {/* Sighting Cards List */}
          <div className="flex flex-col gap-3">
            {filteredCandidates.map((cand, idx) => {
              const similarityScore = Math.round(cand.confidence_score * 100);
              const isUncertain = cand.feasibility_badge === "Unfeasible" || cand.confidence_score < 0.75;
              const isReviewed = cand.review_status === "CONFIRMED";

              return (
                <div
                  key={cand.tracklet_id || idx}
                  className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex items-center justify-between gap-4 shadow-xs hover:border-[#CBD5E1] transition-all"
                >
                  {/* Left Side: Thumbnail Preview */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-24 h-20 bg-[#071026] rounded border border-[#152347] flex flex-col items-center justify-center overflow-hidden shrink-0">
                      {cand.crop_url ? (
                        <img
                          src={cand.crop_url}
                          alt="CCTV Crop"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          {/* Yellow Bounding Frame Silhouette Indicator */}
                          <div className="w-8 h-10 border border-[#D4AF37] bg-[#D4AF37]/10 rounded-xs flex items-center justify-center">
                            <User className="w-5 h-5 text-[#D4AF37]" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-1 left-1.5 px-1 py-0.2 bg-black/80 rounded text-[8px] font-mono text-[#D4AF37] font-bold">
                        {cand.camera_id}
                      </div>
                    </div>

                    {/* Middle Details */}
                    <div className="flex-1 flex flex-col justify-between h-20 py-0.5">
                      {/* Line 1: Camera ID, Track #, Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#0F172A]">
                          {cand.camera_id}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          Track #{cand.original_track_id || (164 + idx * 30)}
                        </span>
                        {isReviewed ? (
                          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
                            <Check className="w-2.5 h-2.5" />
                            REVIEWED
                          </span>
                        ) : isUncertain ? (
                          <span className="text-[9px] font-mono font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
                            ● UNCERTAIN
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                            ● UNREVIEWED
                          </span>
                        )}
                      </div>

                      {/* Line 2: Location Name */}
                      <span className="text-xs text-[#475569] font-medium line-clamp-1">
                        {cand.location_name || "Bole Road — East Entrance"}
                      </span>

                      {/* Line 3: Timestamp */}
                      <span className="text-[10px] font-mono text-[#64748B]">
                        {new Date(cand.timestamp).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {new Date(cand.timestamp).toLocaleTimeString("en-GB")}
                      </span>

                      {/* Line 4: Similarity Meter Bar */}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-mono font-bold text-[#64748B] tracking-wider uppercase">
                          SIMILARITY
                        </span>
                        <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden max-w-70">
                          <div
                            className="h-full bg-[#D4AF37] rounded-full"
                            style={{ width: `${similarityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-[#64748B]">
                          {similarityScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action: Review Evidence Button */}
                  <div className="shrink-0">
                    <button
                      onClick={() => onReviewCandidate(cand)}
                      className="px-4 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#94A3B8] rounded text-xs font-mono font-bold text-[#0F172A] tracking-wider transition-all shadow-2xs active:scale-98"
                    >
                      REVIEW EVIDENCE
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Legal / Forensic AI Disclaimer Bar */}
          <div className="mt-2 bg-[#FEFCE8] border border-[#FEF08A] rounded-md p-3 flex items-start gap-2.5 text-xs text-[#854D0E] font-mono italic leading-relaxed">
            <Info className="w-4 h-4 text-[#CA8A04] shrink-0 mt-0.5 not-italic" />
            <span>
              <strong>AI-ASSISTED RESULT:</strong> Similarity scores indicate visual similarity
              only and require human verification. These results do not constitute identification or
              legal evidence without authorized review.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
