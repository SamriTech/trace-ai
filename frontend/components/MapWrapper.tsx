import dynamic from "next/dynamic";
import { Sighting, MatchCandidate, Camera } from "../lib/types";

const TacticalMap = dynamic(() => import("./TacticalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-95 bg-[#070D1D] rounded-lg flex items-center justify-center border border-[#1E2E62] animate-pulse">
      <div className="text-[#D4AF37] font-mono text-xs tracking-widest uppercase flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        Initializing Tactical Geospatial Engine...
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  confirmedSightings: Sighting[];
  possibleCandidates?: MatchCandidate[];
  selectedSightingId?: string | null;
  onSelectSighting?: (id: string) => void;
  cameras?: Camera[];
}

export default function MapWrapper({
  confirmedSightings,
  possibleCandidates,
  selectedSightingId,
  onSelectSighting,
  cameras,
}: MapWrapperProps) {
  return (
    <TacticalMap
      confirmedSightings={confirmedSightings || []}
      possibleCandidates={possibleCandidates || []}
      selectedSightingId={selectedSightingId}
      onSelectSighting={onSelectSighting}
      cameras={cameras}
    />
  );
}
