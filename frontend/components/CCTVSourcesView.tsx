"use client";

import React, { useState } from "react";
import { Camera, CameraStatus } from "../lib/types";
import { ADDIS_ABABA_CAMERAS } from "../lib/mockData";
import {
  Camera as CameraIcon,
  Upload,
  Activity,
  CheckCircle,
  Video,
  Plus,
  X,
  MapPin,
  Layers,
  Search,
  Check,
  Radio,
  Sliders,
  AlertCircle,
  Edit2,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { indexVideo } from "../lib/api";

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

  // Active Ingestion State
  const [ingestMode, setIngestMode] = useState<"EXISTING" | "BRAND_NEW">("EXISTING");
  const [selectedCam, setSelectedCam] = useState<string>(cameras[0]?.id || "CAM-07");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Add Camera Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Camera Modal State
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

  // Delete Confirmation State
  const [deletingCamera, setDeletingCamera] = useState<Camera | null>(null);

  // Camera Form State (used for Add and Ingest New)
  const [newCamId, setNewCamId] = useState("");
  const [newCamName, setNewCamName] = useState("");
  const [newCamLocation, setNewCamLocation] = useState("");
  const [newCamZone, setNewCamZone] = useState("Bole Sector");
  const [newCamLat, setNewCamLat] = useState("9.0050");
  const [newCamLon, setNewCamLon] = useState("38.7750");
  const [newCamResolution, setNewCamResolution] = useState("1080p (1920x1080)");
  const [newCamFps, setNewCamFps] = useState("30");
  const [newCamStatus, setNewCamStatus] = useState<CameraStatus>("ONLINE");

  // Filter & Search
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

  // 1. ADD NEW CAMERA
  const handleRegisterNewCamera = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const formattedId = newCamId.trim().toUpperCase() || `CAM-${Math.floor(10 + Math.random() * 90)}`;
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
      lastPing: "Just now"
    };

    if (onAddCamera) {
      onAddCamera(newCamera);
    } else {
      setLocalCameras((prev) => [...prev, newCamera]);
    }

    setSelectedCam(newCamera.id);
    setIsAddModalOpen(false);

    // Reset Form
    setNewCamId("");
    setNewCamName("");
    setNewCamLocation("");
    setNotification({
      type: "success",
      message: `Successfully registered new CCTV node: ${newCamera.id} (${newCamera.name})`
    });
  };

  // 2. OPEN EDIT MODAL
  const handleOpenEditModal = (camera: Camera) => {
    setEditingCamera({ ...camera });
  };

  // 3. SAVE EDITED CAMERA
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
      message: `Updated CCTV node parameters for ${editingCamera.id} (${editingCamera.name}).`
    });
    setEditingCamera(null);
  };

  // 4. CONFIRM DELETE CAMERA
  const handleConfirmDelete = () => {
    if (!deletingCamera) return;

    const idToDelete = deletingCamera.id;
    if (onDeleteCamera) {
      onDeleteCamera(idToDelete);
    } else {
      setLocalCameras((prev) => prev.filter((c) => c.id !== idToDelete));
    }

    // If currently selected, select another available camera
    if (selectedCam === idToDelete) {
      const remaining = cameras.filter((c) => c.id !== idToDelete);
      if (remaining.length > 0) {
        setSelectedCam(remaining[0].id);
      }
    }

    setNotification({
      type: "success",
      message: `CCTV node ${idToDelete} (${deletingCamera.name}) removed from surveillance grid.`
    });
    setDeletingCamera(null);
  };

  // 5. INGEST VIDEO FOOTAGE
  const handleIndexVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setNotification({
        type: "error",
        message: "Please select a video footage file (MP4, AVI, MKV)."
      });
      return;
    }

    setIsUploading(true);
    setNotification(null);

    let targetCameraId = selectedCam;

    // If ingesting under a brand new camera, register it first
    if (ingestMode === "BRAND_NEW") {
      const formattedId = newCamId.trim().toUpperCase() || `CAM-${Math.floor(10 + Math.random() * 90)}`;
      const brandNewCam: Camera = {
        id: formattedId,
        name: newCamName.trim() || `CCTV Node ${formattedId}`,
        location: newCamLocation.trim() || "Addis Ababa Surveillance Grid",
        zone: newCamZone,
        lat: parseFloat(newCamLat) || 9.0105,
        lon: parseFloat(newCamLon) || 38.7612,
        status: "PROCESSING",
        resolution: newCamResolution,
        fps: parseInt(newCamFps, 10) || 30,
        lastPing: "Active Ingestion"
      };

      if (onAddCamera) {
        onAddCamera(brandNewCam);
      } else {
        setLocalCameras((prev) => [...prev, brandNewCam]);
      }

      targetCameraId = formattedId;
      setSelectedCam(formattedId);
    }

    try {
      const result = await indexVideo(uploadFile, targetCameraId, 0.0);
      setNotification({
        type: "success",
        message: `Successfully indexed footage for camera ${targetCameraId}. (${result.indexed_tracklets || "Multiple"} tracklets saved to Qdrant Re-ID database)`
      });
      setUploadFile(null);
      if (ingestMode === "BRAND_NEW") {
        setNewCamId("");
        setNewCamName("");
        setNewCamLocation("");
        setIngestMode("EXISTING");
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: `Indexing error: ${err.message || "Could not process footage."}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickSelectCamera = (camId: string) => {
    setSelectedCam(camId);
    setIngestMode("EXISTING");
    const formEl = document.getElementById("ingestion-section");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex-1 bg-[#F4F6FA] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
      {/* 1. Header with Title and Add Camera Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-mono font-bold text-[#0F172A] tracking-wider uppercase">
              CCTV SOURCES & SURVEILLANCE GRID
            </h1>
            <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded border border-[#86EFAC]">
              {cameras.length} NODES ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-mono mt-0.5">
            Manage, edit, or register CCTV nodes and ingest surveillance footage into the AI Re-ID Pipeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#071026] hover:bg-[#0F1A3A] text-[#D4AF37] border border-[#D4AF37]/60 rounded text-xs font-mono font-bold tracking-wider flex items-center gap-2 transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>REGISTER NEW CCTV CAMERA</span>
          </button>
        </div>
      </div>

      {/* Global Notifications */}
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

      {/* 2. Search & Zone Filter Bar */}
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

      {/* 3. Grid of CCTV Cameras with Edit and Delete Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCameras.map((cam) => {
          const isSelected = selectedCam === cam.id && ingestMode === "EXISTING";

          return (
            <div
              key={cam.id}
              onClick={() => setSelectedCam(cam.id)}
              className={`bg-white rounded-lg border p-4 shadow-xs flex flex-col justify-between gap-3 transition-all cursor-pointer group relative ${
                isSelected
                  ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 bg-[#FFFDF7]"
                  : "border-[#E2E8F0] hover:border-[#CBD5E1]"
              }`}
            >
              <div>
                {/* Top Row: Camera ID, Status Badge & Action Menu */}
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
                        handleOpenEditModal(cam);
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

                <div className="mt-2">
                  <span className="text-xs font-semibold text-[#1E293B] block">
                    {cam.name}
                  </span>
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    <span className="truncate">{cam.location}</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>{cam.zone}</span>
                  <span>{cam.resolution || "1080p"}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickSelectCamera(cam.id);
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

        {/* Dotted "Add Brand New CCTV Camera" Card */}
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

      {/* 4. Unified Video Ingestion & Re-ID Processing Studio */}
      <div
        id="ingestion-section"
        className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#0F172A] tracking-wider uppercase flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#D4AF37]" />
              INGEST CCTV FOOTAGE INTO AI RE-ID PIPELINE
            </h3>
            <p className="text-xs text-[#64748B] font-mono mt-0.5">
              Run YOLOv8 person detection, ByteTrack tracking, OSNet appearance embeddings, and Qdrant vector indexing.
            </p>
          </div>

          {/* Mode Switch: Existing Camera vs Brand New Camera */}
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded border border-[#E2E8F0] font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setIngestMode("EXISTING")}
              className={`px-3 py-1 rounded transition-all ${
                ingestMode === "EXISTING"
                  ? "bg-[#071026] text-[#D4AF37] font-bold shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              1. ASSIGN TO REGISTERED CAMERA
            </button>
            <button
              type="button"
              onClick={() => setIngestMode("BRAND_NEW")}
              className={`px-3 py-1 rounded transition-all ${
                ingestMode === "BRAND_NEW"
                  ? "bg-[#071026] text-[#D4AF37] font-bold shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              2. REGISTER & INGEST NEW CCTV
            </button>
          </div>
        </div>

        <form onSubmit={handleIndexVideo} className="flex flex-col gap-4">
          {/* Mode 1: Assigned to Existing Camera */}
          {ingestMode === "EXISTING" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono font-bold text-[#475569] block mb-1">
                  ASSIGNED CAMERA NODE
                </label>
                <select
                  value={selectedCam}
                  onChange={(e) => setSelectedCam(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.name} ({c.location})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] font-mono text-[#64748B] mt-1 block">
                  You can also click any camera card above to auto-select.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-[#475569] block mb-1">
                  FOOTAGE FILE (MP4, AVI, MKV)
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/x-msvideo,video/quicktime,video/x-matroska"
                  onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-1.5 text-xs font-mono text-[#0F172A] file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-mono file:bg-[#071026] file:text-[#D4AF37]"
                />
                {uploadFile && (
                  <span className="text-[10px] font-mono text-[#16A34A] mt-1 block">
                    Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Brand New CCTV Camera Registration & Ingestion */}
          {ingestMode === "BRAND_NEW" && (
            <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#CBD5E1] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[11px] font-mono font-bold text-[#0F172A] uppercase flex items-center gap-1.5">
                  <CameraIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  SPECIFY NEW CCTV CAMERA PARAMETERS
                </span>
                <span className="text-[10px] font-mono text-[#D4AF37] font-bold">
                  Will be added to grid & indexed automatically
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    NEW CAMERA ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CAM-30 or CAM-BOLE-05"
                    value={newCamId}
                    onChange={(e) => setNewCamId(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    CAMERA NAME / LABEL *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bole Medhanialem Junction South"
                    value={newCamName}
                    onChange={(e) => setNewCamName(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    LOCATION / STREET *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cameroon St / Edna Mall Area"
                    value={newCamLocation}
                    onChange={(e) => setNewCamLocation(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    SECTOR ZONE
                  </label>
                  <select
                    value={newCamZone}
                    onChange={(e) => setNewCamZone(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    {DEFAULT_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    GPS LATITUDE
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newCamLat}
                    onChange={(e) => setNewCamLat(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                    GPS LONGITUDE
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newCamLon}
                    onChange={(e) => setNewCamLon(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Video File Input for Brand New Camera */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <label className="text-[11px] font-mono font-bold text-[#475569] block mb-1">
                  FOOTAGE FILE TO INGEST FOR THIS NEW CAMERA (MP4, AVI, MKV) *
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/x-msvideo,video/quicktime,video/x-matroska"
                  onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-xs font-mono text-[#0F172A] file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-mono file:bg-[#071026] file:text-[#D4AF37]"
                />
                {uploadFile && (
                  <span className="text-[10px] font-mono text-[#16A34A] mt-1 block">
                    Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!uploadFile || isUploading}
            className="w-full py-3 bg-[#071026] hover:bg-[#0F1A3A] disabled:opacity-50 text-[#D4AF37] border border-[#D4AF37]/50 font-mono font-bold text-xs tracking-wider rounded transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <span>EXTRACTING DETECTIONS & GENERATING OSNET RE-ID EMBEDDINGS...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>
                  {ingestMode === "BRAND_NEW"
                    ? "REGISTER NEW CAMERA & INGEST FOOTAGE"
                    : `INGEST FOOTAGE FOR ${selectedCam}`}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 5. MODAL: REGISTER NEW CCTV CAMERA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-lg bg-white rounded-lg border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            {/* Modal Header */}
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

            {/* Modal Form */}
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

              {/* Modal Footer Actions */}
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

      {/* 6. MODAL: EDIT EXISTING CCTV CAMERA */}
      {editingCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-lg bg-white rounded-lg border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            {/* Modal Header */}
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

            {/* Modal Form */}
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
                        lat: parseFloat(e.target.value) || 0
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
                        lon: parseFloat(e.target.value) || 0
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
                        status: e.target.value as CameraStatus
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

              {/* Modal Footer Actions */}
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

      {/* 7. MODAL: DELETE CAMERA CONFIRMATION */}
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
                Are you sure you want to remove CCTV node <strong className="text-[#0F172A]">{deletingCamera.id}</strong> (
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
