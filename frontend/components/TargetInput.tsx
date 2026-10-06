"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Calendar,
  Clock,
  MapPin,
  Camera as CameraIcon,
  Search,
  AlertCircle,
  Check,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { Camera, SearchQueryParams } from "../lib/types";
import { ADDIS_ABABA_CAMERAS } from "../lib/mockData";

interface TargetInputProps {
  onSearch: (params: SearchQueryParams) => Promise<void>;
  isLoading: boolean;
  cameras?: Camera[];
}

export default function TargetInput({
  onSearch,
  isLoading,
  cameras = ADDIS_ABABA_CAMERAS,
}: TargetInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Investigation Parameters
  const [searchDate, setSearchDate] = useState("2026-10-05");
  const [startTime, setStartTime] = useState("13:30");
  const [endTime, setEndTime] = useState("16:30");
  const [originLocation, setOriginLocation] = useState("CAM-04");

  // Selected Cameras
  const [selectedCameras, setSelectedCameras] = useState<string[]>(
    cameras.filter((c) => c.status !== "OFFLINE").map((c) => c.id)
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG).");
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleCamera = (camId: string) => {
    setSelectedCameras((prev) =>
      prev.includes(camId) ? prev.filter((id) => id !== camId) : [...prev, camId]
    );
  };

  const handleSelectAllCameras = () => {
    if (selectedCameras.length === cameras.length) {
      setSelectedCameras([]);
    } else {
      setSelectedCameras(cameras.map((c) => c.id));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    // Find origin coordinates from selected origin camera
    const originCam = cameras.find((c) => c.id === originLocation) || cameras[0];
    const refLat = originCam ? originCam.lat : 9.0105;
    const refLon = originCam ? originCam.lon : 38.7612;

    const refTimestamp = new Date(`${searchDate}T${startTime}:00Z`).toISOString();

    await onSearch({
      file,
      ref_lat: refLat,
      ref_lon: refLon,
      ref_timestamp: refTimestamp,
      selected_cameras: selectedCameras,
    });
  };

  return (
    <div className="flex-1 bg-[#111C44] rounded-lg border border-[#1E2E62] p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Panel Header */}
        <div className="border-b border-[#1E2E62] pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-[#D4AF37] tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-none" />
              TARGET PERSON
            </h2>
            <span className="text-[10px] font-mono text-[#94A3B8] bg-[#070D1D] px-2 py-0.5 rounded border border-[#1E2E62]">
              PROBE SOURCE
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Reference image and investigation parameters
          </p>
        </div>

        {/* 1. Reference Image Upload Area */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono font-semibold text-[#E5E7EB] uppercase tracking-wider flex items-center justify-between">
            <span>1. REFERENCE PHOTO</span>
            {file && (
              <span className="text-[10px] text-[#22C55E] font-mono">
                PHOTO LOADED
              </span>
            )}
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative min-h-40 rounded-md border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center bg-[#070D1D] ${
              isDragging
                ? "border-[#D4AF37] bg-[#D4AF37]/5"
                : file
                ? "border-[#1E2E62] hover:border-[#D4AF37]/60"
                : "border-[#1E2E62] hover:border-[#06B6D4]/50"
            }`}
          >
            {/* Tactical Reticle Corners */}
            <div className="reticle-corner-tl" />
            <div className="reticle-corner-tr" />
            <div className="reticle-corner-bl" />
            <div className="reticle-corner-br" />

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {preview ? (
              <div className="relative w-full flex flex-col items-center">
                <div className="relative group max-h-35 rounded overflow-hidden border border-[#1E2E62]">
                  <img
                    src={preview}
                    alt="Target Reference"
                    className="max-h-32.5 w-auto object-contain rounded"
                  />
                  {/* Overlay crosshair */}
                  <div className="absolute inset-0 border border-[#D4AF37]/40 pointer-events-none" />
                </div>
                <div className="w-full flex items-center justify-between mt-2 px-1 text-[11px] font-mono text-[#94A3B8]">
                  <span className="truncate max-w-42.5" title={file?.name}>
                    {file?.name}
                  </span>
                  <button
                    onClick={handleRemoveImage}
                    className="text-[#EF4444] hover:text-white bg-[#EF4444]/10 hover:bg-[#EF4444] px-1.5 py-0.5 rounded text-[10px] transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    REMOVE
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-3 select-none">
                <div className="w-10 h-10 rounded-full bg-[#111C44] border border-[#1E2E62] flex items-center justify-center text-[#06B6D4]">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#E5E7EB]">
                    Upload reference photo
                  </span>
                  <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                    Drag and drop or browse (JPG, PNG)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Investigation Parameters */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[#1E2E62]/70">
          <label className="text-[11px] font-mono font-semibold text-[#E5E7EB] uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
            2. TEMPORAL BOUNDS
          </label>

          <div className="grid grid-cols-1 gap-2">
            {/* Search Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-[#94A3B8] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#94A3B8]" />
                SEARCH DATE
              </span>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="bg-[#070D1D] border border-[#1E2E62] rounded px-2.5 py-1.5 text-xs font-mono text-[#E5E7EB] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Time Window */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#94A3B8]" />
                  START TIME
                </span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-[#070D1D] border border-[#1E2E62] rounded px-2 py-1.5 text-xs font-mono text-[#E5E7EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#94A3B8]" />
                  END TIME
                </span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-[#070D1D] border border-[#1E2E62] rounded px-2 py-1.5 text-xs font-mono text-[#E5E7EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Origin Location */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-[#94A3B8] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#D4AF37]" />
                LAST KNOWN ORIGIN NODE
              </span>
              <select
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                className="bg-[#070D1D] border border-[#1E2E62] rounded px-2 py-1.5 text-xs font-mono text-[#E5E7EB] focus:outline-none focus:border-[#D4AF37]"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Camera Sources Selection */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[#1E2E62]/70">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-semibold text-[#E5E7EB] uppercase tracking-wider flex items-center gap-1.5">
              <CameraIcon className="w-3.5 h-3.5 text-[#06B6D4]" />
              3. CCTV NODES ({selectedCameras.length}/{cameras.length})
            </label>
            <button
              onClick={handleSelectAllCameras}
              className="text-[10px] font-mono text-[#06B6D4] hover:text-white"
            >
              {selectedCameras.length === cameras.length ? "CLEAR" : "ALL"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-35 overflow-y-auto custom-scrollbar pr-1">
            {cameras.map((c) => {
              const isSelected = selectedCameras.includes(c.id);
              const isOffline = c.status === "OFFLINE";
              return (
                <button
                  key={c.id}
                  onClick={() => !isOffline && toggleCamera(c.id)}
                  disabled={isOffline}
                  className={`flex items-center justify-between p-1.5 rounded border text-left text-[11px] font-mono transition-all ${
                    isSelected
                      ? "bg-[#070D1D] border-[#D4AF37]/70 text-[#E5E7EB]"
                      : isOffline
                      ? "bg-[#070D1D]/50 border-[#1E2E62]/40 text-[#64748B] opacity-60 cursor-not-allowed"
                      : "bg-[#070D1D] border-[#1E2E62] text-[#94A3B8] hover:border-[#06B6D4]/50"
                  }`}
                >
                  <span className="font-bold">{c.id}</span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.status === "ONLINE"
                          ? "bg-[#22C55E]"
                          : c.status === "PROCESSING"
                          ? "bg-[#F59E0B]"
                          : "bg-[#EF4444]"
                      }`}
                    />
                    <span className="text-[9px] text-[#94A3B8]">{c.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Action Search Trigger */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[#1E2E62] mt-3">
        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className={`w-full py-3 rounded-md font-mono font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 select-none shadow-md ${
            !file || isLoading
              ? "bg-[#1E2E62] text-[#94A3B8] cursor-not-allowed opacity-60"
              : "bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>ANALYZING CCTV...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>RUN AI RE-ID SEARCH</span>
            </>
          )}
        </button>

        <p className="text-[9px] text-[#94A3B8] text-center font-mono leading-tight">
          AI similarity results require human investigator review before confirmation.
        </p>
      </div>
    </div>
  );
}
