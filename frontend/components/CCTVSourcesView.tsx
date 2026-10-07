"use client";

import React, { useState } from "react";
import { Camera, CameraStatus } from "../lib/types";
import { ADDIS_ABABA_CAMERAS } from "../lib/mockData";
import {
  Camera as CameraIcon,
  Upload,
  Plus,
  X,
  MapPin,
  Search,
  Check,
  AlertCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Database,
  Film,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { indexVideo, IndexVideoResult } from "../lib/api";

interface CCTVSourcesViewProps {
  cameras?: Camera[];
  onAddCamera?: (newCamera: Camera) => void;
  onUpdateCamera?: (updatedCamera: Camera) => void;
  onDeleteCamera?: (cameraId: string) => void;
}

const DEFAULT_ZONES = [
  "Bole Sector",
  "Kirkos Sector",
  "Lideta Sector",
  "Yeka Sector",
  "Arada Sector",
  "Gullele Sector",
  "Nifas Silk-Lafto",
  "Akaki-Kality"
];

const RESOLUTION_OPTIONS = [
  "1080p (1920x1080)",
  "4K (3840x2160)",
  "720p (1280x720)",
  "1440p (2560x1440)"
];

export default function CCTVSourcesView({
  cameras: initialCameras,
  onAddCamera,
  onUpdateCamera,
  onDeleteCamera,
}: CCTVSourcesViewProps) {
  const [localCameras, setLocalCameras] = useState<Camera[]>(
    initialCameras || ADDIS_ABABA_CAMERAS
  );

  const cameras = initialCameras || localCameras;

  // Selected Camera for Ingestion
  const [selectedCamId, setSelectedCamId] = useState<string>(
    cameras[0]?.id || "CAM-07"
  );

  // Real Ingestion File & Backend Execution State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [timestampOffset, setTimestampOffset] = useState<string>("0.0");
  const [ingestionStatus, setIngestionStatus] = useState<
    "idle" | "uploading" | "processing" | "completed" | "failed"
  >("idle");
  const [ingestionResult, setIngestionResult] = useState<IndexVideoResult | null>(null);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [deletingCamera, setDeletingCamera] = useState<Camera | null>(null);

  // New Camera Form State (used ONLY in Register New CCTV Node Modal)
  const [newCamId, setNewCamId] = useState("");
  const [newCamName, setNewCamName] = useState("");
  const [newCamLocation, setNewCamLocation] = useState("");
  const [newCamZone, setNewCamZone] = useState("Bole Sector");
  const [newCamLat, setNewCamLat] = useState("9.0050");
  const [newCamLon, setNewCamLon] = useState("38.7750");
  const [newCamResolution, setNewCamResolution] = useState("1080p (1920x1080)");
  const [newCamFps, setNewCamFps] = useState("30");
  const [newCamStatus, setNewCamStatus] = useState<CameraStatus>("ONLINE");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("ALL");

  const filteredCameras = cameras.filter((cam) => {
    const matchesSearch =
      cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone =
      selectedZoneFilter === "ALL" || cam.zone === selectedZoneFilter;
    return matchesSearch && matchesZone;
  });

  // Selected camera object
  const activeSelectedCamera =
    cameras.find((c) => c.id === selectedCamId) || cameras[0];

  // 1. REGISTER NEW CCTV CAMERA NODE (ONE Dedicated Flow)
  const handleRegisterNewCamera = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedId =
      newCamId.trim().toUpperCase() ||
      `CAM-${Math.floor(10 + Math.random() * 90)}`;

    const newCamera: Camera = {
      id: formattedId,
      name: newCamName.trim() || `CCTV Node ${formattedId}`,
      location: newCamLocation.trim() || "Addis Ababa Surveillance Grid",
      zone: newCamZone,
      lat: parseFloat(newCamLat) || 9.0105,
      lon: parseFloat(newCamLon) || 38.7612,
      status: newCamStatus,
      resolution: newCamResolution,
      fps: parseInt(newCamFps, 10) || 30,
      lastPing: "Just now",
    };

    if (onAddCamera) {
      onAddCamera(newCamera);
    } else {
      setLocalCameras((prev) => [...prev, newCamera]);
    }

    setSelectedCamId(newCamera.id);
    setIsAddModalOpen(false);

    // Reset Form Fields
    setNewCamId("");
    setNewCamName("");
    setNewCamLocation("");
    setNewCamZone("Bole Sector");
    setNewCamLat("9.0050");
    setNewCamLon("38.7750");

    setNotification({
      type: "success",
      message: `Successfully registered new CCTV node ${newCamera.id} (${newCamera.name}) into surveillance grid.`,
    });
  };

  // 2. SAVE EDITED CAMERA
  const handleSaveEditCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCamera) return;

    if (onUpdateCamera) {
      onUpdateCamera(editingCamera);
    } else {
      setLocalCameras((prev) =>
        prev.map((c) => (c.id === editingCamera.id ? editingCamera : c))
      );
    }

    setNotification({
      type: "success",
      message: `Updated CCTV node parameters for ${editingCamera.id} (${editingCamera.name}).`,
    });
    setEditingCamera(null);
  };

  // 3. CONFIRM DELETE CAMERA
  const handleConfirmDelete = () => {
    if (!deletingCamera) return;

    const idToDelete = deletingCamera.id;
    if (onDeleteCamera) {
      onDeleteCamera(idToDelete);
    } else {
      setLocalCameras((prev) => prev.filter((c) => c.id !== idToDelete));
    }

    // If currently selected, select another available camera
    if (selectedCamId === idToDelete) {
      const remaining = cameras.filter((c) => c.id !== idToDelete);
      if (remaining.length > 0) {
        setSelectedCamId(remaining[0].id);
      }
    }

    setNotification({
      type: "success",
      message: `CCTV node ${idToDelete} (${deletingCamera.name}) removed from surveillance grid.`,
    });
    setDeletingCamera(null);
  };

  // 4. INGEST FOOTAGE TO SELECTED REGISTERED CAMERA (REAL BACKEND PIPELINE)
  const handleIndexVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setNotification({
        type: "error",
        message: "Please select a video footage file (MP4, AVI, MKV).",
      });
      return;
    }

    if (!selectedCamId) {
      setNotification({
        type: "error",
        message: "Please select an assigned camera node from the directory.",
      });
      return;
    }

    const targetCam = cameras.find((c) => c.id === selectedCamId);

    setIngestionStatus("processing");
    setIngestionError(null);
    setIngestionResult(null);
    setNotification(null);

    const offsetNum = parseFloat(timestampOffset) || 0.0;

    try {
      const result = await indexVideo(
        uploadFile,
        selectedCamId,
        offsetNum,
        targetCam?.lat,
        targetCam?.lon
      );
      setIngestionResult(result);
      setIngestionStatus("completed");
      setNotification({
        type: "success",
        message: `Indexed footage for node ${result.camera_id}: ${result.indexed_tracklets} tracklets indexed in ${result.duration_seconds}s.`,
      });
      setUploadFile(null);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to process surveillance footage.";
      setIngestionError(errorMsg);
      setIngestionStatus("failed");
      setNotification({
        type: "error",
        message: `Indexing error: ${errorMsg}`,
      });
    }
  };

  const handleSelectCameraForIngest = (camId: string) => {
    setSelectedCamId(camId);
    const formEl = document.getElementById("footage-ingestion-section");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex-1 bg-[#F4F6FA] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
      {/* ========================================================================= */}
      {/* 1. HEADER BAR                                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-mono font-bold text-[#0F172A] tracking-wider uppercase">
              CCTV SOURCES & SURVEILLANCE GRID
            </h1>
            <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded border border-[#86EFAC]">
              {cameras.length} NODES REGISTERED
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-mono mt-0.5">
            Addis Ababa Police Surveillance Network · Camera Directory & AI Re-ID Video Ingestion
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/60 rounded text-xs font-mono font-bold tracking-wider flex items-center gap-2 transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>REGISTER NEW CCTV NODE</span>
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-mono font-semibold flex items-center justify-between gap-2 shadow-xs ${
            notification.type === "success"
              ? "bg-[#DCFCE7] border-[#86EFAC] text-[#16A34A]"
              : "bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[#64748B] hover:text-[#0F172A] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CCTV NODE DIRECTORY & MANAGEMENT GRID                                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-4">
        {/* Search & Zone Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by Camera ID, Name, or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded pl-9 pr-3 py-1.5 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
            />
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-2" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar font-mono text-[10px]">
            <button
              onClick={() => setSelectedZoneFilter("ALL")}
              className={`px-3 py-1 rounded border transition-all shrink-0 ${
                selectedZoneFilter === "ALL"
                  ? "bg-[#071026] border-[#071026] text-[#D4AF37] font-bold"
                  : "bg-white border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              ALL SECTORS ({cameras.length})
            </button>
            {DEFAULT_ZONES.map((zone) => {
              const count = cameras.filter((c) => c.zone === zone).length;
              if (count === 0) return null;
              return (
                <button
                  key={zone}
                  onClick={() => setSelectedZoneFilter(zone)}
                  className={`px-2.5 py-1 rounded border transition-all shrink-0 ${
                    selectedZoneFilter === zone
                      ? "bg-[#071026] border-[#071026] text-[#D4AF37] font-bold"
                      : "bg-white border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {zone.replace(" Sector", "")} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Camera Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCameras.map((cam) => {
            const isSelected = selectedCamId === cam.id;

            return (
              <div
                key={cam.id}
                onClick={() => setSelectedCamId(cam.id)}
                className={`bg-white rounded-lg border p-4 shadow-xs flex flex-col justify-between gap-3 transition-all cursor-pointer group ${
                  isSelected
                    ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 bg-[#FFFDF7]"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <div>
                  {/* Top Line: ID, Status Badge, Edit & Delete Buttons */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded bg-[#071026] flex items-center justify-center text-[#D4AF37] text-[10px] font-bold">
                        <CameraIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono font-bold text-sm text-[#0F172A]">
                        {cam.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          cam.status === "ONLINE"
                            ? "bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]"
                            : cam.status === "PROCESSING"
                            ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                            : "bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]"
                        }`}
                      >
                        ● {cam.status}
                      </span>

                      {/* Edit Button */}
                      <button
                        type="button"
                        title="Edit Camera Details"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCamera({ ...cam });
                        }}
                        className="p-1 rounded bg-[#F1F5F9] hover:bg-[#071026] text-[#64748B] hover:text-[#D4AF37] transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        title="Delete Camera"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCamera(cam);
                        }}
                        className="p-1 rounded bg-[#F1F5F9] hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#DC2626] transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Camera Name & Location */}
                  <div className="mt-2.5">
                    <span className="text-xs font-semibold text-[#1E293B] block">
                      {cam.name}
                    </span>
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                      <span className="truncate">{cam.location}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Line: Zone, Resolution & Ingest Shortcut */}
                <div className="pt-2 border-t border-[#F1F5F9] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                    <span>{cam.zone}</span>
                    <span>{cam.resolution || "1080p"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCameraForIngest(cam.id);
                    }}
                    className={`w-full py-1.5 rounded text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#D4AF37] text-black shadow-xs"
                        : "bg-[#F8FAFC] hover:bg-[#071026] text-[#475569] hover:text-[#D4AF37] border border-[#E2E8F0]"
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isSelected ? "CAMERA SELECTED" : "INGEST FOOTAGE"}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Dotted "Register New CCTV Node" Card */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white/60 hover:bg-white rounded-lg border-2 border-dashed border-[#CBD5E1] hover:border-[#D4AF37] p-5 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-45 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] group-hover:bg-[#071026] group-hover:text-[#D4AF37] text-[#64748B] flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-bold text-[#0F172A] group-hover:text-[#D4AF37] mt-2 block">
              + REGISTER NEW CCTV NODE
            </span>
            <span className="text-[10px] font-mono text-[#64748B] mt-0.5">
              Add a new surveillance camera to the Addis Ababa grid
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEDICATED FOOTAGE INGESTION SECTION                                   */}
      {/* ========================================================================= */}
      <div
        id="footage-ingestion-section"
        className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-5"
      >
        <div className="border-b border-[#F1F5F9] pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#0F172A] tracking-wider uppercase flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#D4AF37]" />
              INGEST FOOTAGE TO REGISTERED CAMERA
            </h3>
            <p className="text-xs text-[#64748B] font-mono mt-0.5">
              Select an authorized camera node and upload MP4/AVI footage to run YOLOv8 detection, ByteTrack tracking, and OSNet Re-ID embedding indexing into Qdrant.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#06B6D4] bg-[#F0FDFA] border border-[#CCFBF1] px-2.5 py-1 rounded">
              TARGET NODE: <strong className="text-[#0F172A]">{selectedCamId}</strong>
            </span>
            {ingestionStatus === "processing" && (
              <span className="text-[10px] font-mono text-[#D4AF37] bg-[#FFFBEB] border border-[#FEF3C7] px-2.5 py-1 rounded flex items-center gap-1.5 font-bold animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                PIPELINE RUNNING
              </span>
            )}
            {ingestionStatus === "completed" && (
              <span className="text-[10px] font-mono text-[#16A34A] bg-[#DCFCE7] border border-[#86EFAC] px-2.5 py-1 rounded flex items-center gap-1 font-bold">
                <Check className="w-3 h-3" />
                INDEXED
              </span>
            )}
          </div>
        </div>

        {/* Real Backend Processing Status Banner */}
        {ingestionStatus === "processing" && (
          <div className="bg-[#071026] text-white p-5 rounded-lg border border-[#D4AF37]/40 shadow-md flex flex-col gap-3.5 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#D4AF37] tracking-wider uppercase">
                    AI VIDEO INGESTION PIPELINE IN PROGRESS (SYNCHRONOUS EXECUTION)
                  </h4>
                  <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                    Analyzing frames with YOLOv8 & ByteTrack, generating 512-d OSNet vectors, and indexing to Qdrant...
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-[#1E293B] text-[#94A3B8] px-2.5 py-1 rounded border border-[#334155]">
                NODE: {selectedCamId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1E293B] text-[10px] font-mono">
              <div className="bg-[#0F172A] p-2.5 rounded border border-[#1E293B]">
                <span className="text-[#64748B] block">STAGE 1</span>
                <span className="text-[#E2E8F0] font-semibold">Video Upload & Server Buffer</span>
              </div>
              <div className="bg-[#0F172A] p-2.5 rounded border border-[#1E293B]">
                <span className="text-[#64748B] block">STAGE 2</span>
                <span className="text-[#E2E8F0] font-semibold">YOLOv8 + ByteTrack (5-frame stride)</span>
              </div>
              <div className="bg-[#0F172A] p-2.5 rounded border border-[#1E293B]">
                <span className="text-[#64748B] block">STAGE 3</span>
                <span className="text-[#E2E8F0] font-semibold">OSNet 512-d Appearance Vector</span>
              </div>
              <div className="bg-[#0F172A] p-2.5 rounded border border-[#1E293B]">
                <span className="text-[#64748B] block">STAGE 4</span>
                <span className="text-[#E2E8F0] font-semibold">Qdrant Vector DB Upsert</span>
              </div>
            </div>
          </div>
        )}

        {/* Real Backend Ingestion Result Card */}
        {ingestionResult && (
          <div className="bg-[#071026] text-white p-5 rounded-lg border border-[#16A34A]/50 shadow-md flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#E2E8F0] tracking-wider uppercase">
                    SURVEILLANCE FOOTAGE INDEXED & READY FOR PROBE SEARCH
                  </h4>
                  <p className="text-[11px] font-mono text-[#94A3B8]">
                    File: <strong className="text-white">{ingestionResult.filename}</strong> · Camera Node: <strong className="text-[#D4AF37]">{ingestionResult.camera_id}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIngestionResult(null);
                  setIngestionStatus("idle");
                }}
                className="text-[#94A3B8] hover:text-white text-[10px] font-mono px-2.5 py-1 rounded border border-[#334155] hover:border-[#64748B] transition-colors"
              >
                DISMISS SUMMARY
              </button>
            </div>

            {/* Real Pipeline Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#0F172A] p-3 rounded border border-[#1E293B]">
                <span className="text-[10px] text-[#64748B] uppercase block">FRAMES PROCESSED</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {ingestionResult.total_frames}
                </span>
                <span className="text-[9px] text-[#94A3B8]">Sampled at step 5</span>
              </div>

              <div className="bg-[#0F172A] p-3 rounded border border-[#1E293B]">
                <span className="text-[10px] text-[#64748B] uppercase block">TRACKS IDENTIFIED</span>
                <span className="text-lg font-bold text-[#06B6D4] mt-0.5 block">
                  {ingestionResult.total_tracks}
                </span>
                <span className="text-[9px] text-[#94A3B8]">ByteTrack unique tracks</span>
              </div>

              <div className="bg-[#0F172A] p-3 rounded border border-[#1E293B]">
                <span className="text-[10px] text-[#64748B] uppercase block">TRACKLETS INDEXED</span>
                <span className="text-lg font-bold text-[#16A34A] mt-0.5 block">
                  {ingestionResult.indexed_tracklets}
                </span>
                <span className="text-[9px] text-[#94A3B8]">Vectors in Qdrant DB</span>
              </div>

              <div className="bg-[#0F172A] p-3 rounded border border-[#1E293B]">
                <span className="text-[10px] text-[#64748B] uppercase block">PIPELINE DURATION</span>
                <span className="text-lg font-bold text-[#D4AF37] mt-0.5 block">
                  {ingestionResult.duration_seconds}s
                </span>
                <span className="text-[9px] text-[#94A3B8]">Offset: {ingestionResult.timestamp_offset}s</span>
              </div>
            </div>

            <div className="bg-[#0F172A] p-3 rounded border border-[#1E293B] text-[11px] font-mono text-[#94A3B8] flex items-center justify-between flex-wrap gap-2">
              <span>
                Tracklet vectors and best-sharpness person crops are now persistently stored in Qdrant and available for New Investigation probe queries.
              </span>
              <span className="text-[#16A34A] font-bold text-[10px] bg-[#16A34A]/10 border border-[#16A34A]/30 px-2.5 py-1 rounded">
                STATUS: 200 OK
              </span>
            </div>
          </div>
        )}

        {/* Real Ingestion Failure Card */}
        {ingestionStatus === "failed" && ingestionError && (
          <div className="bg-[#1A0C0C] text-white p-4 rounded-lg border border-[#EF4444]/50 flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold text-[#FCA5A5] uppercase">
                  FOOTAGE INGESTION PIPELINE FAILED
                </h4>
                <p className="text-[11px] font-mono text-[#FCA5A5]/80 mt-1">
                  {ingestionError}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIngestionStatus("idle");
                setIngestionError(null);
              }}
              className="text-[#94A3B8] hover:text-white text-[10px] font-mono px-2 py-1 rounded border border-[#EF4444]/40"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleIndexVideo} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Camera Selector Dropdown */}
            <div>
              <label className="text-[11px] font-mono font-bold text-[#475569] block mb-1 uppercase">
                TARGET CAMERA NODE
              </label>
              <select
                value={selectedCamId}
                onChange={(e) => setSelectedCamId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.name} ({c.zone})
                  </option>
                ))}
              </select>
              <span className="text-[10px] font-mono text-[#64748B] mt-1 block truncate">
                {activeSelectedCamera?.location || "Addis Ababa CCTV Node"}
              </span>
            </div>

            {/* 2. Video Footage File Picker */}
            <div>
              <label className="text-[11px] font-mono font-bold text-[#475569] block mb-1 uppercase">
                SURVEILLANCE FOOTAGE FILE (MP4, AVI, MKV)
              </label>
              <input
                type="file"
                accept="video/mp4,video/x-msvideo,video/quicktime,video/x-matroska"
                onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-1.5 text-xs font-mono text-[#0F172A] file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-mono file:bg-[#071026] file:text-[#D4AF37]"
              />
              {uploadFile ? (
                <span className="text-[10px] font-mono text-[#16A34A] mt-1 block truncate">
                  Ready: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
              ) : (
                <span className="text-[10px] font-mono text-[#94A3B8] mt-1 block">
                  Select video recording to run AI detection
                </span>
              )}
            </div>

            {/* 3. Timestamp Offset (Optional) */}
            <div>
              <label className="text-[11px] font-mono font-bold text-[#475569] uppercase flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-[#94A3B8]" />
                TIMESTAMP START OFFSET (SECONDS)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={timestampOffset}
                onChange={(e) => setTimestampOffset(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
              />
              <span className="text-[10px] font-mono text-[#94A3B8] mt-1 block">
                Video start time offset (defaults to 0.0s)
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!uploadFile || ingestionStatus === "processing"}
            className="w-full py-3 bg-[#071026] hover:bg-[#0F1A3A] disabled:opacity-50 text-[#D4AF37] border border-[#D4AF37]/50 font-mono font-bold text-xs tracking-wider rounded transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
          >
            {ingestionStatus === "processing" ? (
              <>
                <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <span>PIPELINE EXECUTING (YOLOv8 + TorchReID + Qdrant)...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>INGEST & INDEX FOOTAGE FOR {selectedCamId}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: REGISTER NEW CCTV NODE (ONE Dedicated Flow)                     */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-lg bg-white rounded-lg border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="bg-[#071026] px-5 py-4 flex items-center justify-between border-b border-[#152347]">
              <div className="flex items-center gap-2.5">
                <CameraIcon className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-mono font-bold text-[#E5E7EB] tracking-wider uppercase">
                  REGISTER NEW CCTV NODE
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#E5E7EB] p-1 rounded hover:bg-[#152347] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterNewCamera} className="p-5 flex flex-col gap-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    CAMERA ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CAM-30"
                    value={newCamId}
                    onChange={(e) => setNewCamId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    SECTOR ZONE
                  </label>
                  <select
                    value={newCamZone}
                    onChange={(e) => setNewCamZone(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    {DEFAULT_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                  CAMERA NAME / LABEL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bole Medhanialem Junction South"
                  value={newCamName}
                  onChange={(e) => setNewCamName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                  PHYSICAL LOCATION / STREET ADDRESS *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cameroon St, Opposite Edna Mall"
                  value={newCamLocation}
                  onChange={(e) => setNewCamLocation(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    LATITUDE (GPS)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newCamLat}
                    onChange={(e) => setNewCamLat(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    LONGITUDE (GPS)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newCamLon}
                    onChange={(e) => setNewCamLon(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    RESOLUTION
                  </label>
                  <select
                    value={newCamResolution}
                    onChange={(e) => setNewCamResolution(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    {RESOLUTION_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    INITIAL STATUS
                  </label>
                  <select
                    value={newCamStatus}
                    onChange={(e) => setNewCamStatus(e.target.value as CameraStatus)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] hover:bg-[#F1F5F9] rounded text-xs font-mono font-semibold text-[#64748B]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/50 rounded text-xs font-mono font-bold tracking-wider transition-all shadow-xs"
                >
                  ADD TO SURVEILLANCE GRID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: EDIT EXISTING CCTV CAMERA                                       */}
      {/* ========================================================================= */}
      {editingCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-lg bg-white rounded-lg border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="bg-[#071026] px-5 py-4 flex items-center justify-between border-b border-[#152347]">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-mono font-bold text-[#E5E7EB] tracking-wider uppercase">
                  EDIT CCTV NODE: {editingCamera.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingCamera(null)}
                className="text-[#94A3B8] hover:text-[#E5E7EB] p-1 rounded hover:bg-[#152347] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditCamera} className="p-5 flex flex-col gap-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    CAMERA ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingCamera.id}
                    className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#64748B] font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    SECTOR ZONE
                  </label>
                  <select
                    value={editingCamera.zone}
                    onChange={(e) =>
                      setEditingCamera({ ...editingCamera, zone: e.target.value })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    {DEFAULT_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                  CAMERA NAME / LABEL *
                </label>
                <input
                  type="text"
                  required
                  value={editingCamera.name}
                  onChange={(e) =>
                    setEditingCamera({ ...editingCamera, name: e.target.value })
                  }
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                  PHYSICAL LOCATION / STREET ADDRESS *
                </label>
                <input
                  type="text"
                  required
                  value={editingCamera.location}
                  onChange={(e) =>
                    setEditingCamera({ ...editingCamera, location: e.target.value })
                  }
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    LATITUDE (GPS)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingCamera.lat}
                    onChange={(e) =>
                      setEditingCamera({
                        ...editingCamera,
                        lat: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    LONGITUDE (GPS)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingCamera.lon}
                    onChange={(e) =>
                      setEditingCamera({
                        ...editingCamera,
                        lon: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    RESOLUTION
                  </label>
                  <select
                    value={editingCamera.resolution || "1080p (1920x1080)"}
                    onChange={(e) =>
                      setEditingCamera({ ...editingCamera, resolution: e.target.value })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    {RESOLUTION_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    STATUS
                  </label>
                  <select
                    value={editingCamera.status}
                    onChange={(e) =>
                      setEditingCamera({
                        ...editingCamera,
                        status: e.target.value as CameraStatus,
                      })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingCamera(null)}
                  className="px-4 py-2 border border-[#CBD5E1] hover:bg-[#F1F5F9] rounded text-xs font-mono font-semibold text-[#64748B]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/50 rounded text-xs font-mono font-bold tracking-wider transition-all shadow-xs"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: DELETE CAMERA CONFIRMATION                                      */}
      {/* ========================================================================= */}
      {deletingCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-md bg-white rounded-lg border border-[#FCA5A5] shadow-2xl overflow-hidden flex flex-col animate-fadeIn font-mono">
            <div className="bg-[#FEF2F2] px-5 py-4 flex items-center gap-3 border-b border-[#FEE2E2]">
              <div className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#991B1B] uppercase">
                  DELETE CCTV NODE
                </h3>
                <span className="text-[10px] text-[#B91C1C]">
                  Action requires investigator authorization
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-3 text-xs">
              <p className="text-[#334155]">
                Are you sure you want to remove CCTV node{" "}
                <strong className="text-[#0F172A]">{deletingCamera.id}</strong> (
                {deletingCamera.name}) from the Addis Ababa surveillance grid?
              </p>
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[11px] text-[#64748B]">
                <div>Location: {deletingCamera.location}</div>
                <div>Sector: {deletingCamera.zone}</div>
              </div>
              <p className="text-[10px] text-[#DC2626]">
                ⚠ This will disconnect the node and exclude it from future automated trajectory queries.
              </p>
            </div>

            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingCamera(null)}
                className="px-4 py-2 border border-[#CBD5E1] hover:bg-white rounded text-xs font-semibold text-[#64748B]"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded text-xs font-bold tracking-wider transition-all shadow-xs"
              >
                CONFIRM DELETION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
