"use client";

import React from "react";
import MapWrapper from "./MapWrapper";
import { Sighting, MatchCandidate, Camera } from "../lib/types";
import { ADDIS_ABABA_CAMERAS } from "../lib/mockData";
import { Shield, Layers, Navigation } from "lucide-react";

interface InvestigationMapViewProps {
  confirmedSightings: Sighting[];
  possibleCandidates: MatchCandidate[];
  selectedSightingId: string | null;
  onSelectSighting: (id: string) => void;
  cameras?: Camera[];
}

export default function InvestigationMapView({
  confirmedSightings,
  possibleCandidates,
  selectedSightingId,
  onSelectSighting,
  cameras = ADDIS_ABABA_CAMERAS,
}: InvestigationMapViewProps) {
  return (
    <div className="flex-1 bg-[#F4F6FA] p-6 flex flex-col gap-4 overflow-hidden h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-mono font-bold text-[#0F172A] tracking-wider uppercase">
            GEOSPATIAL INVESTIGATION MAP
          </h2>
          <p className="text-xs text-[#64748B] font-mono">
            Spatio-Temporal Trajectory Reconstruction · Addis Ababa Grid
          </p>
        </div>
      </div>

      <div className="flex-1 w-full rounded-lg overflow-hidden border border-[#E2E8F0] shadow-sm bg-white relative min-h-0">
        <MapWrapper
          confirmedSightings={confirmedSightings}
          possibleCandidates={possibleCandidates}
          selectedSightingId={selectedSightingId}
          onSelectSighting={onSelectSighting}
          cameras={cameras}
        />
      </div>
    </div>
  );
}
