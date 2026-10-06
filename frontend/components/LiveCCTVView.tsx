"use client";

import React, { useState } from "react";
import {
  Radio,
  Video,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Shield,
  Layers,
  Activity,
  Maximize2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { LiveCameraStream, LiveAlert, MatchCandidate } from "../lib/types";
import { LIVE_CAMERAS, LIVE_ALERTS } from "../lib/mockData";

interface LiveCCTVViewProps {
  onReviewCandidate?: (candidate: MatchCandidate) => void;
}

export default function LiveCCTVView({ onReviewCandidate }: LiveCCTVViewProps) {
  const [cameras, setCameras] = useState<LiveCameraStream[]>(LIVE_CAMERAS);
  const [alerts, setAlerts] = useState<LiveAlert[]>(LIVE_ALERTS);
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [activeStreamId, setActiveStreamId] = useState<string | null>("CAM-07");

  const zones = ["ALL", "Bole Sector", "Kirkos Sector", "Lideta Sector", "Yeka Sector"];

  const filteredCameras = cameras.filter((c) =>
    selectedZone === "ALL" ? true : c.zone === selectedZone
  );

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  return (
    <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
      {/* Main Stream Matrix (Left 9 cols) */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-3 min-h-0 overflow-hidden">
        {/* Stream Matrix Controls Bar */}
        <div className="bg-[#111C44] rounded-lg border border-[#1E2E62] px-4 py-2.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
              <span className="text-xs font-mono font-bold text-[#E5E7EB] tracking-wider uppercase">
                AUTHORIZED RTSP CCTV MATRIX
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#06B6D4] bg-[#070D1D] px-2 py-0.5 rounded border border-[#1E2E62]">
              SECURE ETHIOPIAN POLICE GRID
            </span>
          </div>

          {/* Sector Zone Filter */}
          <div className="flex items-center gap-1.5 bg-[#070D1D] p-1 rounded border border-[#1E2E62]">
            <Filter className="w-3 h-3 text-[#94A3B8] ml-1" />
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                  selectedZone === zone
                    ? "bg-[#111C44] text-[#D4AF37] font-bold"
                    : "text-[#94A3B8] hover:text-[#E5E7EB]"
                }`}
              >
                {zone === "ALL" ? "ALL ZONES" : zone.replace(" Sector", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Grid (2x3 or 2x2 responsive) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar pr-1 pb-2">
          {filteredCameras.map((cam) => {
            const hasAlert = cam.hasActiveAlert;
            const isSelected = cam.id === activeStreamId;

            return (
              <div
                key={cam.id}
                onClick={() => setActiveStreamId(cam.id)}
                className={`relative bg-[#070D1D] rounded-lg border flex flex-col justify-between overflow-hidden cursor-pointer group transition-all min-h-55 shadow-md ${
                  hasAlert
                    ? "border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : isSelected
                    ? "border-[#06B6D4]"
                    : "border-[#1E2E62] hover:border-[#1E2E62]"
                }`}
              >
                {/* Camera Top Bar Overlay */}
                <div className="absolute top-0 inset-x-0 bg-linear-to-b from-black/80 to-transparent p-2.5 flex items-center justify-between z-10 font-mono text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E5E7EB] bg-[#111C44]/80 px-1.5 py-0.5 rounded border border-[#1E2E62]">
                      {cam.id}
                    </span>
                    <span className="text-[#94A3B8] text-[9px]">{cam.zone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cam.status === "MATCH_DETECTED"
                          ? "bg-[#D4AF37] animate-ping"
                          : cam.status === "ONLINE"
                          ? "bg-[#22C55E]"
                          : "bg-[#F59E0B]"
                      }`}
                    />
                    <span
                      className={`font-bold text-[9px] ${
                        cam.status === "MATCH_DETECTED"
                          ? "text-[#D4AF37]"
                          : cam.status === "ONLINE"
                          ? "text-[#22C55E]"
                          : "text-[#F59E0B]"
                      }`}
                    >
                      {cam.status === "MATCH_DETECTED" ? "ALERT DETECTED" : "LIVE RTSP"}
                    </span>
                  </div>
                </div>

                {/* Simulated CCTV Feed Viewport */}
                <div className="relative w-full h-full flex items-center justify-center bg-[#070D1D] overflow-hidden">
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#16244e15_1px,transparent_1px),linear-gradient(to_bottom,#16244e15_1px,transparent_1px)] bg-size-[16px_16px]" />

                  {/* Scanning Radar Line */}
                  <div className="absolute inset-0 w-full h-1/2 bg-linear-to-b from-transparent via-[#06B6D4]/10 to-transparent animate-radar-sweep pointer-events-none" />

                  {/* Center Content */}
                  <div className="flex flex-col items-center gap-1 z-10 text-center">
                    <Video className="w-8 h-8 text-[#1E2E62] group-hover:text-[#06B6D4] transition-colors" />
                    <span className="text-xs font-mono font-bold text-[#E5E7EB]">
                      {cam.name}
                    </span>
                    <span className="text-[9px] font-mono text-[#94A3B8]">
                      {cam.location}
                    </span>
                  </div>

                  {/* Active Target Bounding Box Simulation if alert */}
                  {hasAlert && (
                    <div className="absolute top-1/4 left-1/3 w-16 h-28 border-2 border-[#D4AF37] bg-[#D4AF37]/10 flex flex-col justify-between p-1 animate-pulse">
                      <span className="text-[8px] font-mono text-[#D4AF37] font-bold">
                        MATCH 91.6%
                      </span>
                      <span className="text-[7px] font-mono text-black bg-[#D4AF37] px-0.5 py-0.2 rounded font-bold">
                        YOLO RE-ID
                      </span>
                    </div>
                  )}

                  {/* Reticles */}
                  <div className="reticle-corner-tl opacity-60" />
                  <div className="reticle-corner-tr opacity-60" />
                  <div className="reticle-corner-bl opacity-60" />
                  <div className="reticle-corner-br opacity-60" />
                </div>

                {/* Camera Bottom Overlay Bar */}
                <div className="bg-[#111C44] px-2.5 py-1.5 border-t border-[#1E2E62] flex items-center justify-between font-mono text-[9px] text-[#94A3B8] z-10">
                  <span>{cam.resolution} · {cam.fps} FPS</span>
                  <span className="text-[#06B6D4]">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Live Alert Feed (Right 3 cols) */}
      <div className="col-span-12 lg:col-span-3 bg-[#111C44] rounded-lg border border-[#1E2E62] p-4 flex flex-col justify-between overflow-hidden shadow-lg">
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#1E2E62] pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#D4AF37] tracking-widest uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
                LIVE RE-ID ALERTS
              </h3>
              <span className="text-[10px] font-mono text-[#D4AF37] bg-[#070D1D] px-2 py-0.5 rounded border border-[#1E2E62] font-bold">
                {alerts.length} NEW
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8] font-mono mt-1">
              Real-time candidate matches from authorized CCTV nodes.
            </p>
          </div>

          {/* Alert Cards List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#94A3B8]">
                <Shield className="w-8 h-8 text-[#22C55E] mb-2" />
                <span className="text-xs font-mono font-semibold text-[#E5E7EB]">
                  NO ACTIVE ALERTS
                </span>
                <span className="text-[10px] text-[#64748B] font-mono mt-0.5">
                  Monitoring camera streams continuously.
                </span>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-[#070D1D] rounded-md border border-[#D4AF37]/80 p-3 flex flex-col gap-2 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#D4AF37] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                      POSSIBLE MATCH
                    </span>
                    <span className="text-[9px] font-mono text-[#94A3B8]">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-[#E5E7EB]">
                      {alert.camera_id}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] truncate">
                      {alert.camera_name}
                    </span>
                  </div>

                  <div className="bg-[#111C44] p-2 rounded border border-[#1E2E62] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#94A3B8] text-[10px]">SIMILARITY:</span>
                    <span className="font-bold text-[#D4AF37]">
                      {(alert.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-[9px] text-[#F59E0B] font-mono">
                    Requires immediate investigator review
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#1E2E62]">
                    <button
                      onClick={() => {
                        if (onReviewCandidate) {
                          onReviewCandidate({
                            tracklet_id: alert.id,
                            camera_id: alert.camera_id,
                            camera_name: alert.camera_name,
                            lat: 9.0021,
                            lon: 38.7758,
                            timestamp: alert.timestamp,
                            confidence_score: alert.similarity_score,
                            feasibility_badge: "Feasible",
                            kinematics: { velocity_kmh: 5.2, transit_mode: "walking" },
                            review_status: "UNREVIEWED",
                          });
                        }
                      }}
                      className="flex-1 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-mono font-bold text-[10px] py-1.5 rounded transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3 h-3" />
                      REVIEW NOW
                    </button>
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="bg-[#070D1D] hover:bg-[#1E2E62] text-[#94A3B8] hover:text-[#E5E7EB] border border-[#1E2E62] px-2 py-1.5 rounded text-[10px] font-mono transition-colors"
                    >
                      DISMISS
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
