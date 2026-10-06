"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  CheckCircle2,
  Activity,
  ArrowRight,
  Clock,
  Search,
  Sliders,
  Check,
  Radio,
} from "lucide-react";
import { TargetPerson } from "../lib/types";

interface AnalyzingCCTVViewProps {
  targetPerson: TargetPerson | null;
  caseId?: string;
  onReviewSightings: () => void;
}

export default function AnalyzingCCTVView({
  targetPerson,
  caseId = "MP-2048",
  onReviewSightings,
}: AnalyzingCCTVViewProps) {
  const [progress, setProgress] = useState(64);
  const [seconds, setSeconds] = useState(525); // 08:45

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
      setProgress((prev) => (prev < 100 ? Math.min(prev + 1, 100) : 100));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activityLogs = [
    { time: "14:32:18", tag: "CAM-07", tagColor: "text-[#0284C7] bg-[#E0F2FE]", msg: "Track A184 detected — high confidence" },
    { time: "14:32:21", tag: "RE-ID", tagColor: "text-[#D4AF37] bg-[#FEF9C3]", msg: "Appearance embedding generated (512-dim)" },
    { time: "14:32:22", tag: "VECTOR", tagColor: "text-[#D4AF37] bg-[#FEF9C3]", msg: "Similarity search completed — 18 candidates" },
    { time: "14:32:23", tag: "ANALYSIS", tagColor: "text-[#D4AF37] bg-[#FEF9C3]", msg: "Possible visual similarity found (87%)" },
    { time: "14:33:01", tag: "CAM-12", tagColor: "text-[#0284C7] bg-[#E0F2FE]", msg: "Track A184 reacquired — Africa Avenue" },
    { time: "14:33:04", tag: "RE-ID", tagColor: "text-[#D4AF37] bg-[#FEF9C3]", msg: "Appearance embedding matched to reference" },
    { time: "14:33:11", tag: "ANALYSIS", tagColor: "text-[#D4AF37] bg-[#FEF9C3]", msg: "Cross-camera sighting correlated (82%)" },
    { time: "14:34:22", tag: "CAM-01", tagColor: "text-[#0284C7] bg-[#E0F2FE]", msg: "Processing frame batch 1200/3840" },
  ];

  return (
    <div className="flex-1 bg-[#F4F6FA] flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold font-mono tracking-tight text-[#0F172A] uppercase">
            ANALYZING CCTV FOOTAGE
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] text-[10px] font-mono font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-ping" />
            PROCESSING
          </span>
        </div>

        <span className="text-xs font-mono text-[#64748B]">
          Case: <strong className="text-[#0F172A]">{caseId}</strong>
        </span>
      </div>

      {/* Main 2-Column Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar grid grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: REFERENCE SUBJECT & PIPELINE STEPS                          */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Reference Subject Card */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-3">
            <div className="relative bg-[#071026] rounded h-48 flex flex-col items-center justify-center overflow-hidden border border-[#152347]">
              {targetPerson?.photoUrl ? (
                <img
                  src={targetPerson.photoUrl}
                  alt="Reference Subject"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#16244E] flex items-center justify-center text-[#475569]">
                  <User className="w-10 h-10 stroke-[1.2]" />
                </div>
              )}
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
                REFERENCE SUBJECT
              </span>
              <strong className="text-sm font-mono text-[#0F172A] font-bold">{caseId}</strong>
            </div>
          </div>

          {/* Processing Pipeline Steps Card */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-3">
            <span className="text-[10px] font-mono font-bold text-[#475569] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
              PROCESSING PIPELINE
            </span>

            <div className="flex flex-col gap-3 text-xs font-mono">
              {/* Step 1: Detection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] block">DETECTION</span>
                    <span className="text-[10px] text-[#64748B]">Person detection in video frames</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A]">✓ COMPLETE</span>
              </div>

              {/* Step 2: Tracking */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] block">TRACKING</span>
                    <span className="text-[10px] text-[#64748B]">Multi-object tracking across frames</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A]">✓ COMPLETE</span>
              </div>

              {/* Step 3: Person Re-ID */}
              <div className="flex items-center justify-between bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-bold text-[#0284C7] block">PERSON RE-ID</span>
                    <span className="text-[10px] text-[#64748B]">Appearance embedding generation</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#0284C7]">● ACTIVE</span>
              </div>

              {/* Step 4: Vector Search */}
              <div className="flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] block">VECTOR SEARCH</span>
                    <span className="text-[10px] text-[#64748B]">Similarity search in feature space</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#94A3B8]">PENDING</span>
              </div>

              {/* Step 5: Sighting Analysis */}
              <div className="flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] block">SIGHTING ANALYSIS</span>
                    <span className="text-[10px] text-[#64748B]">Cross-camera sighting correlation</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#94A3B8]">PENDING</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PROGRESS, STATS & ACTIVITY STREAM                          */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {/* Overall Progress Bar Card */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#475569] uppercase tracking-wider">
                OVERALL PROGRESS
              </span>
              <span className="font-bold text-[#D4AF37] text-sm">{progress}%</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 4 Stat Tiles Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-xs">
              <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                PEOPLE DETECTED
              </span>
              <span className="text-xl font-bold font-mono text-[#0F172A] mt-1 block">1,842</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-xs">
              <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                TRACKS GENERATED
              </span>
              <span className="text-xl font-bold font-mono text-[#0F172A] mt-1 block">426</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-xs">
              <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                POTENTIAL SIGHTINGS
              </span>
              <span className="text-xl font-bold font-mono text-[#0F172A] mt-1 block">18</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-xs">
              <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
                PROCESSING TIME
              </span>
              <span className="text-xl font-bold font-mono text-[#0F172A] mt-1 block">
                {formatTimer(seconds)}
              </span>
            </div>
          </div>

          {/* Activity Stream Card */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              <span className="text-xs font-mono font-bold text-[#475569] uppercase tracking-wider">
                ACTIVITY STREAM
              </span>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {activityLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-3 py-1 border-b border-[#F8FAFC]">
                  <span className="text-[#94A3B8] text-[11px] w-16 shrink-0">{log.time}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${log.tagColor}`}
                  >
                    {log.tag}
                  </span>
                  <span className="text-[#334155] text-xs truncate">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Button: Review Sightings */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onReviewSightings}
              className="px-8 py-3 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/50 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-xs active:scale-98"
            >
              <span>REVIEW SIGHTINGS</span>
              <ArrowRight className="w-4 h-4 stroke-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
