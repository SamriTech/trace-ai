"use client";

import React, { useState } from "react";
import { Camera, CameraStatus } from "../lib/types";
import { ADDIS_ABABA_CAMERAS } from "../lib/mockData";
import { Camera as CameraIcon, Upload, Activity, CheckCircle, Video, Plus } from "lucide-react";
import { indexVideo } from "../lib/api";

export default function CCTVSourcesView() {
  const [cameras, setCameras] = useState<Camera[]>(ADDIS_ABABA_CAMERAS);
  const [selectedCam, setSelectedCam] = useState<string>("CAM-07");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleIndexVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadSuccess(null);

    try {
      const result = await indexVideo(uploadFile, selectedCam, 0.0);
      setUploadSuccess(`Successfully indexed footage for ${selectedCam}. (${result.indexed_tracklets || "Multiple"} tracklets saved)`);
      setUploadFile(null);
    } catch (err: any) {
      alert(`Indexing error: ${err.message || "Could not process footage."}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F4F6FA] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono font-bold text-[#0F172A] tracking-wider uppercase">
            CCTV SOURCES & VIDEO INGESTION
          </h2>
          <p className="text-xs text-[#64748B] font-mono">
            Authorized CCTV Grid · Addis Ababa Police Surveillance Network
          </p>
        </div>
      </div>

      {/* Grid of Cameras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cameras.map((cam) => (
          <div
            key={cam.id}
            className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-[#CBD5E1] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-sm text-[#0F172A] block">
                  {cam.id}
                </span>
                <span className="text-xs font-semibold text-[#334155]">{cam.name}</span>
                <span className="text-[10px] text-[#64748B] block mt-0.5">{cam.location}</span>
              </div>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                  cam.status === "ONLINE"
                    ? "bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]"
                    : cam.status === "PROCESSING"
                    ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                    : "bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]"
                }`}
              >
                {cam.status}
              </span>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span>{cam.zone}</span>
              <span>{cam.resolution}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Video Footage Ingestion Card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs max-w-2xl">
        <h3 className="text-xs font-mono font-bold text-[#0F172A] tracking-wider uppercase flex items-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-[#D4AF37]" />
          INGEST NEW CCTV FOOTAGE INTO RE-ID PIPELINE
        </h3>
        <p className="text-xs text-[#64748B] font-mono mb-4">
          Upload recorded MP4/AVI surveillance footage to run YOLOv8 ByteTrack detection, OSNet extraction, and Qdrant vector indexing.
        </p>

        <form onSubmit={handleIndexVideo} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#475569] block mb-1">
                ASSIGNED CAMERA NODE
              </label>
              <select
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#475569] block mb-1">
                FOOTAGE FILE (MP4, AVI)
              </label>
              <input
                type="file"
                accept="video/mp4,video/x-msvideo,video/quicktime"
                onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-1.5 text-xs font-mono text-[#0F172A] file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-mono file:bg-[#071026] file:text-[#D4AF37]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!uploadFile || isUploading}
            className="w-full py-2.5 bg-[#071026] hover:bg-[#0F1A3A] disabled:opacity-50 text-[#D4AF37] font-mono font-bold text-xs tracking-wider rounded transition-all shadow-xs"
          >
            {isUploading ? "PROCESSING FOOTAGE & EXTRACTING TRACKLETS..." : "INGEST & INDEX FOOTAGE"}
          </button>

          {uploadSuccess && (
            <div className="p-3 bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] rounded text-xs font-mono font-semibold">
              ✓ {uploadSuccess}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
