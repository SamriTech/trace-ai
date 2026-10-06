"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Video,
  Clock,
  MapPin,
  FileText,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Camera,
  Search,
  Sliders,
  X,
  Play,
} from "lucide-react";
import { Camera as CameraType } from "../lib/types";
import { ADDIS_ABABA_CAMERAS } from "../lib/mockData";

interface NewInvestigationWizardProps {
  onComplete: (data: {
    caseName: string;
    caseId: string;
    lastKnownLocation: string;
    lastKnownTime: string;
    notes: string;
    file: File | null;
    videoFiles: File[];
  }) => void;
  onCancel: () => void;
  onBeginAnalysis?: () => void;
  cameras?: CameraType[];
}

type Step = 1 | 2;

export default function NewInvestigationWizard({
  onComplete,
  onCancel,
  onBeginAnalysis,
  cameras = ADDIS_ABABA_CAMERAS,
}: NewInvestigationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1 Form Data
  const [caseName, setCaseName] = useState("");
  const [caseId, setCaseId] = useState("MP-2048");
  const [lastKnownLocation, setLastKnownLocation] = useState("Bole, Addis Ababa");
  const [lastKnownTime, setLastKnownTime] = useState("10:42");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Step 2 Video Footage Data
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setVideoFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleBeginAnalysis = () => {
    if (onBeginAnalysis) {
      onBeginAnalysis();
    } else {
      onComplete({
        caseName: caseName || "Bole Road Incident",
        caseId: caseId || "MP-2048",
        lastKnownLocation: lastKnownLocation || "Bole, Addis Ababa",
        lastKnownTime: lastKnownTime || "10:42",
        notes,
        file,
        videoFiles,
      });
    }
  };

  return (
    <div className="flex-1 bg-[#F4F6FA] flex flex-col h-full overflow-hidden select-none">
      {/* Top Header Bar for New Investigation */}
      <div className="bg-white border-b border-[#E2E8F0] px-8 pt-5 pb-0 shrink-0">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl font-bold font-mono tracking-tight text-[#0F172A] uppercase">
            NEW INVESTIGATION
          </h1>
          <span className="text-[10px] font-mono text-[#64748B] tracking-widest uppercase">
            AUDIT LOG ACTIVE
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-6 font-mono text-xs">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              currentStep === 1
                ? "border-[#D4AF37] text-[#D4AF37] font-bold"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span>01 SUBJECT</span>
          </button>
          <span className="text-[#CBD5E1] text-[10px] mb-3">➔</span>

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              currentStep === 2
                ? "border-[#D4AF37] text-[#D4AF37] font-bold"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span>02 CCTV SOURCES</span>
          </button>
          <span className="text-[#CBD5E1] text-[10px] mb-3">➔</span>

          {/* Step 3 */}
          <div className="pb-3 flex items-center gap-2 border-b-2 border-transparent text-[#94A3B8]">
            <span>03 PROCESSING</span>
          </div>
          <span className="text-[#CBD5E1] text-[10px] mb-3">➔</span>

          {/* Step 4 */}
          <div className="pb-3 flex items-center gap-2 border-b-2 border-transparent text-[#94A3B8]">
            <span>04 REVIEW</span>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between max-w-4xl mx-auto w-full">
        {/* ========================================================================= */}
        {/* STEP 01: REFERENCE SUBJECT                                               */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5">
            <span className="text-[11px] font-mono font-bold text-[#475569] tracking-wider uppercase">
              STEP 01: REFERENCE SUBJECT
            </span>

            {/* Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border-2 border-dashed border-[#CBD5E1] hover:border-[#D4AF37] rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative group"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {preview ? (
                <div className="relative max-h-48 flex flex-col items-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-44 object-contain rounded border border-[#CBD5E1]"
                  />
                  <span className="text-[10px] font-mono text-[#D4AF37] mt-2 font-bold">
                    {file?.name} (Click to change)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] group-hover:text-[#D4AF37] transition-colors">
                    <Upload className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] mt-1">
                    Upload Reference Photograph
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Upload a clear photograph of the person being searched for.
                  </p>
                  <span className="text-[10px] font-mono text-[#94A3B8] mt-1">
                    Drag and drop or click to select · JPG, PNG · Max 20MB
                  </span>
                </div>
              )}
            </div>

            {/* Form Fields: Case Name & Case ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-[#475569] uppercase block mb-1">
                  CASE NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bole Road Incident"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#475569] uppercase block mb-1">
                  CASE ID
                </label>
                <input
                  type="text"
                  placeholder="MP-2048"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Form Fields: Last Known Location & Last Known Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-[#475569] uppercase block mb-1">
                  LAST KNOWN LOCATION
                </label>
                <input
                  type="text"
                  placeholder="Bole, Addis Ababa"
                  value={lastKnownLocation}
                  onChange={(e) => setLastKnownLocation(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#475569] uppercase block mb-1">
                  LAST KNOWN TIME
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={lastKnownTime}
                    onChange={(e) => setLastKnownTime(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <Clock className="w-4 h-4 text-[#94A3B8] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Investigator Notes */}
            <div>
              <label className="text-[10px] font-mono font-bold text-[#475569] uppercase block mb-1">
                INVESTIGATOR NOTES
              </label>
              <textarea
                rows={3}
                placeholder="Context, circumstances, or additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Security Notice */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-3 flex items-start gap-2.5 text-xs text-[#64748B] font-mono italic">
              <Shield className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5 not-italic" />
              <span>
                <strong>SECURITY NOTICE:</strong> Upload only legally authorized investigation material.
                All uploads are logged to the audit trail and subject to institutional policy.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 02: CCTV SOURCES (Matching User's Screenshot 1)                     */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-5">
            <span className="text-[11px] font-mono font-bold text-[#475569] tracking-wider uppercase">
              STEP 02: CCTV SOURCES
            </span>

            {/* Large Dashed Box: ADD CCTV FOOTAGE */}
            <div
              onClick={() => videoInputRef.current?.click()}
              className="bg-white border-2 border-dashed border-[#CBD5E1] hover:border-[#D4AF37] rounded-lg p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-2xs"
            >
              <input
                type="file"
                ref={videoInputRef}
                accept="video/mp4,video/x-msvideo,video/quicktime,video/x-matroska"
                multiple
                className="hidden"
                onChange={handleVideoUpload}
              />

              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-12 rounded bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-center text-[#94A3B8] group-hover:text-[#D4AF37] group-hover:border-[#D4AF37] transition-all">
                  <Video className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-bold font-mono text-[#0F172A] tracking-wider uppercase mt-1">
                  ADD CCTV FOOTAGE
                </h3>
                <p className="text-xs text-[#64748B]">
                  Upload video files from CCTV cameras · MP4, AVI, MKV
                </p>
                <span className="text-[10px] font-mono text-[#94A3B8] mt-1">
                  Drag and drop or browse to select multiple camera files
                </span>
              </div>
            </div>

            {/* List of uploaded footage files if any */}
            {videoFiles.length > 0 && (
              <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold text-[#0F172A] uppercase">
                  READY FOR INGESTION ({videoFiles.length} FILES)
                </span>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {videoFiles.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <Video className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="font-bold text-[#0F172A]">{v.name}</span>
                        <span className="text-[#94A3B8] text-[10px]">
                          ({(v.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      <span className="text-[#16A34A] text-[10px] font-bold">READY</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between mt-6">
          {currentStep === 1 ? (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 border border-[#CBD5E1] hover:bg-white rounded text-xs font-mono font-bold text-[#475569] tracking-wider transition-all"
            >
              CANCEL
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2.5 border border-[#CBD5E1] hover:bg-white rounded text-xs font-mono font-bold text-[#475569] tracking-wider transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK
            </button>
          )}

          <div className="flex items-center gap-3">
            {currentStep === 1 ? (
              <button
                onClick={() => setCurrentStep(2)}
                className="px-8 py-2.5 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/50 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-xs active:scale-98"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4 stroke-2" />
              </button>
            ) : (
              <button
                onClick={handleBeginAnalysis}
                className="px-10 py-2.5 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/50 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-xs active:scale-98"
              >
                <span>BEGIN ANALYSIS</span>
                <ArrowRight className="w-4 h-4 stroke-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
