"use client";

import React, { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Sighting, MatchCandidate, Camera } from "../lib/types";
import { ADDIS_ABABA_CAMERAS } from "../lib/mockData";
import { Shield, Eye, Layers, Compass } from "lucide-react";

interface TacticalMapProps {
  confirmedSightings: Sighting[];
  possibleCandidates?: MatchCandidate[];
  selectedSightingId?: string | null;
  onSelectSighting?: (id: string) => void;
  cameras?: Camera[];
}

export default function TacticalMap({
  confirmedSightings = [],
  possibleCandidates = [],
  selectedSightingId = null,
  onSelectSighting,
  cameras = ADDIS_ABABA_CAMERAS,
}: TacticalMapProps) {
  const [L, setL] = useState<any>(null);
  const [RL, setRL] = useState<any>(null);
  const [showAllCameras, setShowAllCameras] = useState(true);

  useEffect(() => {
    Promise.all([
      import("leaflet"),
      import("react-leaflet"),
    ]).then(([leaflet, reactLeaflet]) => {
      setL(leaflet.default || leaflet);
      setRL(reactLeaflet);
    });
  }, []);

  if (!L || !RL) {
    return (
      <div className="w-full h-full min-h-95 bg-[#070D1D] rounded-lg flex flex-col items-center justify-center border border-[#1E2E62] text-[#94A3B8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-widest text-[#D4AF37]">
            INITIALIZING TACTICAL RECON MAP...
          </span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } = RL;

  // Center coordinate: Addis Ababa
  const defaultCenter: [number, number] = [9.0105, 38.7612];

  // Map center logic: active selected sighting, first confirmed sighting, or default
  const activeSighting = confirmedSightings.find((s) => s.id === selectedSightingId);
  const mapCenter: [number, number] = activeSighting
    ? [activeSighting.lat, activeSighting.lon]
    : confirmedSightings.length > 0
    ? [confirmedSightings[0].lat, confirmedSightings[0].lon]
    : defaultCenter;

  // Polyline coordinates for chronological trajectory
  const trajectoryPositions = confirmedSightings
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((s) => [s.lat, s.lon] as [number, number]);

  // Create custom forensic marker icons
  const createNumberedMarkerIcon = (
    number: number,
    status: "CONFIRMED" | "POSSIBLE" | "INFEASIBLE",
    isSelected: boolean
  ) => {
    let bgColor = "#D4AF37"; // gold default for possible
    let textColor = "#000000";
    let borderColor = "#FFFFFF";
    let pulseClass = isSelected ? "shadow-[0_0_18px_rgba(212,175,55,1)] scale-110" : "shadow-[0_0_8px_rgba(0,0,0,0.8)]";

    if (status === "CONFIRMED") {
      bgColor = "#22C55E";
      textColor = "#000000";
      borderColor = isSelected ? "#D4AF37" : "#FFFFFF";
      pulseClass = isSelected ? "shadow-[0_0_20px_#22C55E] scale-110" : "shadow-[0_0_8px_rgba(0,0,0,0.8)]";
    } else if (status === "INFEASIBLE") {
      bgColor = "#EF4444";
      textColor = "#FFFFFF";
      borderColor = "#FFFFFF";
      pulseClass = isSelected ? "shadow-[0_0_20px_#EF4444] scale-110" : "shadow-[0_0_8px_rgba(0,0,0,0.8)]";
    }

    return L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div style="
          background-color: ${bgColor};
          color: ${textColor};
          width: ${isSelected ? "32px" : "26px"};
          height: ${isSelected ? "32px" : "26px"};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-family: monospace;
          font-size: ${isSelected ? "13px" : "11px"};
          border: 2px solid ${borderColor};
          transition: all 0.2s ease;
        " class="${pulseClass}">
          ${number}
        </div>
      `,
      iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
      iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
      popupAnchor: [0, isSelected ? -16 : -13],
    });
  };

  const createCameraNodeIcon = () => {
    return L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div style="
          background-color: #070D1D;
          color: #06B6D4;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #06B6D4;
          box-shadow: 0 0 6px rgba(6,182,212,0.4);
          opacity: 0.85;
        ">
          <div style="width: 6px; height: 6px; background-color: #06B6D4; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -9],
    });
  };

  return (
    <div className="relative w-full h-full min-h-95 rounded-lg overflow-hidden border border-[#1E2E62] bg-[#070D1D] select-none shadow-md">
      {/* Top Header Badge — Positioned safely in top-left without overlapping zoom */}
      <div className="absolute top-3 left-3 z-400 flex items-center gap-2 pointer-events-none">
        <div className="bg-[#070D1D]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#1E2E62] text-[11px] font-mono flex items-center gap-2 text-[#E5E7EB] shadow-lg">
          <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-bold tracking-wider">MAP: ADDIS ABABA GRID</span>
          <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded border border-[#22C55E]/30">
            NODE MONITOR ACTIVE
          </span>
        </div>
      </div>

      {/* Top Right Controls & Toggle */}
      <div className="absolute top-3 right-3 z-400 flex items-center gap-2">
        <button
          onClick={() => setShowAllCameras(!showAllCameras)}
          className={`px-2.5 py-1.5 rounded text-[10px] font-mono flex items-center gap-1.5 border transition-all backdrop-blur-md shadow-md ${
            showAllCameras
              ? "bg-[#111C44]/90 border-[#06B6D4] text-[#06B6D4]"
              : "bg-[#070D1D]/90 border-[#1E2E62] text-[#94A3B8]"
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>{showAllCameras ? "CCTV NODES: VISIBLE" : "CCTV NODES: HIDDEN"}</span>
        </button>
      </div>

      {/* Map Component */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full bg-[#070D1D]"
      >
        {/* Safe Zoom Control position in bottom-right */}
        <ZoomControl position="bottomright" />

        {/* Dark Tactical Cartographic Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="tactical-map-tiles"
        />

        {/* Static CCTV Camera Nodes */}
        {showAllCameras &&
          cameras.map((cam) => (
            <Marker
              key={`cam-node-${cam.id}`}
              position={[cam.lat, cam.lon]}
              icon={createCameraNodeIcon()}
            >
              <Popup>
                <div className="p-1 font-mono text-xs flex flex-col gap-1 min-w-45">
                  <div className="flex items-center justify-between border-b border-[#1E2E62] pb-1">
                    <span className="font-bold text-[#06B6D4]">{cam.id}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded ${
                        cam.status === "ONLINE"
                          ? "text-[#22C55E] bg-[#22C55E]/10"
                          : "text-[#EF4444] bg-[#EF4444]/10"
                      }`}
                    >
                      {cam.status}
                    </span>
                  </div>
                  <span className="font-semibold text-[#E5E7EB] mt-0.5">{cam.name}</span>
                  <span className="text-[10px] text-[#94A3B8]">{cam.location}</span>
                  <div className="text-[9px] text-[#64748B] mt-1 pt-1 border-t border-[#1E2E62]/50 flex justify-between">
                    <span>{cam.zone}</span>
                    <span>{cam.resolution}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Confirmed Sighting Markers */}
        {confirmedSightings.map((sighting, idx) => {
          const isSelected = sighting.id === selectedSightingId;
          const status =
            sighting.feasibility_badge === "Unfeasible" ? "INFEASIBLE" : "CONFIRMED";
          return (
            <Marker
              key={`sight-${sighting.id || idx}`}
              position={[sighting.lat, sighting.lon]}
              icon={createNumberedMarkerIcon(sighting.sequenceNumber || idx + 1, status, isSelected)}
              eventHandlers={{
                click: () => onSelectSighting && onSelectSighting(sighting.id),
              }}
            >
              <Popup>
                <div className="p-1 font-mono text-xs flex flex-col gap-1.5 min-w-50">
                  <div className="flex items-center justify-between border-b border-[#1E2E62] pb-1">
                    <span className="font-bold text-[#22C55E] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      Sighting #{sighting.sequenceNumber || idx + 1}
                    </span>
                    <span className="text-[10px] text-[#D4AF37] font-bold">
                      {(sighting.similarity_score * 100).toFixed(1)}% SIM
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#E5E7EB]">{sighting.camera_id}</span>
                    <span className="text-[10px] text-[#94A3B8]">{sighting.location_name}</span>
                    <span className="text-[10px] text-[#06B6D4] mt-0.5">
                      {new Date(sighting.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#111C44] p-1.5 rounded border border-[#1E2E62] text-[10px] flex items-center justify-between">
                    <span className="text-[#94A3B8]">Est. Velocity:</span>
                    <span className="font-bold text-[#E5E7EB]">
                      {sighting.kinematics?.velocity_kmh
                        ? `${sighting.kinematics.velocity_kmh.toFixed(1)} km/h (${sighting.kinematics.transit_mode})`
                        : "Stationary"}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectSighting && onSelectSighting(sighting.id)}
                    className="w-full bg-[#D4AF37] text-black font-bold py-1 rounded text-[10px] uppercase hover:bg-[#E5C158] transition-colors"
                  >
                    SELECT IN TIMELINE
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Possible Candidate Sighting Markers (Unreviewed) */}
        {possibleCandidates
          .filter((c) => c.review_status === "UNREVIEWED")
          .map((cand, idx) => {
            const isSelected = cand.tracklet_id === selectedSightingId;
            const status = cand.feasibility_badge === "Unfeasible" ? "INFEASIBLE" : "POSSIBLE";
            return (
              <Marker
                key={`cand-map-${cand.tracklet_id || idx}`}
                position={[cand.lat, cand.lon]}
                icon={createNumberedMarkerIcon(
                  confirmedSightings.length + idx + 1,
                  status,
                  isSelected
                )}
                eventHandlers={{
                  click: () => onSelectSighting && onSelectSighting(cand.tracklet_id),
                }}
              >
                <Popup>
                  <div className="p-1 font-mono text-xs flex flex-col gap-1.5 min-w-50">
                    <div className="flex items-center justify-between border-b border-[#1E2E62] pb-1">
                      <span className="font-bold text-[#D4AF37] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        POSSIBLE MATCH
                      </span>
                      <span className="text-[10px] text-[#D4AF37] font-bold">
                        {(cand.confidence_score * 100).toFixed(1)}% SIM
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#E5E7EB]">{cand.camera_id}</span>
                      <span className="text-[10px] text-[#94A3B8]">{cand.location_name}</span>
                      <span className="text-[10px] text-[#06B6D4] mt-0.5">
                        {new Date(cand.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 p-1.5 rounded border border-[#F59E0B]/30">
                      ⚠ Requires human review before verification.
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Directional Trajectory Polyline */}
        {trajectoryPositions.length > 1 && (
          <Polyline
            positions={trajectoryPositions}
            color="#EF4444"
            weight={3}
            dashArray="6, 6"
            opacity={0.85}
          />
        )}
      </MapContainer>

      {/* Map Bottom Legend — Positioned safely in bottom-left */}
      <div className="absolute bottom-3 left-3 z-400 bg-[#070D1D]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#1E2E62] text-[10px] font-mono flex items-center gap-4 text-[#94A3B8] shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
          <span className="text-[#E5E7EB]">POSSIBLE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          <span className="text-[#E5E7EB]">REVIEWED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span className="text-[#E5E7EB]">INFEASIBLE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded border border-[#06B6D4] bg-[#070D1D]" />
          <span className="text-[#06B6D4]">CCTV NODE</span>
        </div>
      </div>
    </div>
  );
}
