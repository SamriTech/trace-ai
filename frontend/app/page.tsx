"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { NavTab } from "../components/Sidebar";
import Navbar from "../components/Navbar";
import OverviewView from "../components/OverviewView";
import InvestigationMapView from "../components/InvestigationMapView";
import TimelineView from "../components/TimelineView";
import CCTVSourcesView from "../components/CCTVSourcesView";
import LiveCCTVView from "../components/LiveCCTVView";
import EvidenceReviewModal from "../components/EvidenceReviewModal";
import NewInvestigationWizard from "../components/NewInvestigationWizard";
import AnalyzingCCTVView from "../components/AnalyzingCCTVView";
import PossibleSightingsStudioView from "../components/PossibleSightingsStudioView";

import {
  MatchCandidate,
  Sighting,
  TargetPerson,
  Camera,
} from "../lib/types";
import {
  DEFAULT_INVESTIGATION_CASE,
  ADDIS_ABABA_CAMERAS,
  INITIAL_CONFIRMED_SIGHTINGS,
} from "../lib/mockData";
import { checkBackendHealth, searchPerson, getDemoForensicCandidates } from "../lib/api";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [cameras, setCameras] = useState<Camera[]>(ADDIS_ABABA_CAMERAS);

  // Target Person State
  const [targetPerson, setTargetPerson] = useState<TargetPerson | null>({
    id: "MP-2048",
    name: "Unknown Subject",
    lastSeenLocation: "Bole, Addis Ababa",
    lastSeenTime: "10:42",
    photoUrl: null,
  });

  // Current Case ID State
  const [activeCaseId, setActiveCaseId] = useState<string>("MP-2048");

  // Investigation Candidates & Sightings (Real backend Qdrant results)
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [confirmedSightings, setConfirmedSightings] = useState<Sighting[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Selected sighting / modal states
  const [selectedSightingId, setSelectedSightingId] = useState<string | null>(null);
  const [reviewingCandidate, setReviewingCandidate] = useState<MatchCandidate | null>(null);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendOnline(res !== null);
    });
  }, []);

  // Handle Target Photo Upload from Overview
  const handleUpdateTargetPhoto = async (file: File) => {
    const photoUrl = URL.createObjectURL(file);
    setTargetPerson((prev: TargetPerson | null) => ({
      id: prev?.id || activeCaseId,
      name: prev?.name || "Unknown Subject",
      lastSeenLocation: prev?.lastSeenLocation || "Bole, Addis Ababa",
      lastSeenTime: prev?.lastSeenTime || "10:42",
      photoUrl,
      file,
    }));
    setSearchError(null);

    try {
      const { candidates: newCandidates, isLiveBackend } = await searchPerson({
        file,
        ref_lat: 9.0021,
        ref_lon: 38.7758,
        ref_timestamp: new Date().toISOString(),
      });
      setCandidates(newCandidates);
      setBackendOnline(isLiveBackend);
      setSearchError(null);
    } catch (err: any) {
      console.error("Backend search failed:", err);
      setSearchError(err.message || "Failed to search surveillance grid for subject.");
      setCandidates([]);
    }
  };

  // Complete Wizard & Launch Real Analysis
  const handleWizardComplete = async (data: {
    caseName: string;
    caseId: string;
    lastKnownLocation: string;
    lastKnownTime: string;
    notes: string;
    file: File | null;
    videoFiles: File[];
  }) => {
    const photoUrl = data.file ? URL.createObjectURL(data.file) : null;
    const cid = data.caseId || "MP-2048";
    setActiveCaseId(cid);
    setTargetPerson({
      id: cid,
      name: data.caseName || "Subject",
      lastSeenLocation: data.lastKnownLocation || "Bole, Addis Ababa",
      lastSeenTime: data.lastKnownTime || "10:42",
      photoUrl,
      file: data.file,
    });
    setConfirmedSightings([]);
    setSearchError(null);

    if (data.file) {
      try {
        const { candidates: newCandidates, isLiveBackend } = await searchPerson({
          file: data.file,
          ref_lat: 9.0021,
          ref_lon: 38.7758,
          ref_timestamp: new Date().toISOString(),
        });
        setCandidates(newCandidates);
        setBackendOnline(isLiveBackend);
        setSearchError(null);
      } catch (err: any) {
        console.error("Backend search failed:", err);
        setSearchError(err.message || "Failed to search surveillance grid for subject.");
        setCandidates([]);
      }
    } else {
      setCandidates([]);
    }

    setIsAnalyzing(false);
    setActiveTab("possible_sightings");
  };

  // Demo helper to load simulation dataset
  const handleLoadDemoData = () => {
    const demoCandidates = getDemoForensicCandidates();
    setCandidates(demoCandidates);
    setSearchError(null);
  };

  // Confirm Candidate Match
  const handleConfirmMatch = (candidate: MatchCandidate) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.tracklet_id === candidate.tracklet_id ? { ...c, review_status: "CONFIRMED" } : c
      )
    );

    setConfirmedSightings((prev) => {
      const exists = prev.some((s) => s.tracklet_id === candidate.tracklet_id);
      if (exists) return prev;

      const newSighting: Sighting = {
        id: `sight-${candidate.tracklet_id}`,
        tracklet_id: candidate.tracklet_id,
        camera_id: candidate.camera_id,
        camera_name: candidate.camera_name || `Camera ${candidate.camera_id}`,
        location_name: candidate.location_name || "Addis Ababa CCTV Node",
        lat: candidate.lat,
        lon: candidate.lon,
        timestamp: candidate.timestamp,
        similarity_score: candidate.confidence_score,
        feasibility_badge: candidate.feasibility_badge,
        kinematics: candidate.kinematics,
        crop_url: candidate.crop_url,
        sequenceNumber: prev.length + 1,
        confirmedAt: new Date().toISOString(),
      };

      return [...prev, newSighting].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });

    setSelectedSightingId(candidate.tracklet_id);
  };

  // Mark Candidate Uncertain
  const handleMarkUncertain = (trackletId: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.tracklet_id === trackletId
          ? { ...c, feasibility_badge: "Unfeasible" as const, review_status: "UNREVIEWED" as const }
          : c
      )
    );
  };

  // Reject Candidate Match
  const handleDismissMatch = (trackletId: string) => {
    setConfirmedSightings((prev) => prev.filter((s) => s.tracklet_id !== trackletId));
    setCandidates((prev) =>
      prev.map((c) =>
        c.tracklet_id === trackletId ? { ...c, review_status: "DISMISSED" as const } : c
      )
    );
  };

  // Start New Investigation
  const handleStartNewInvestigation = () => {
    setIsAnalyzing(false);
    setActiveTab("investigations");
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F6FA] text-[#0F172A] overflow-hidden font-sans">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsAnalyzing(false);
          setActiveTab(tab);
        }}
        caseId={activeCaseId}
        backendOnline={backendOnline}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Navbar */}
        <Navbar
          caseId={activeCaseId}
          investigatorName="INV. YONAS TESFAYE"
          onNewInvestigation={handleStartNewInvestigation}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 flex min-h-0 overflow-hidden">
          {isAnalyzing ? (
            <AnalyzingCCTVView
              targetPerson={targetPerson}
              caseId={activeCaseId}
              onReviewSightings={() => {
                setIsAnalyzing(false);
                setActiveTab("possible_sightings");
              }}
            />
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewView
                  targetPerson={targetPerson}
                  onUpdateTargetPhoto={handleUpdateTargetPhoto}
                  candidates={candidates}
                  onReviewCandidate={(cand) => {
                    setSelectedSightingId(cand.tracklet_id);
                    setActiveTab("possible_sightings");
                  }}
                  onViewAllSightings={() => setActiveTab("possible_sightings")}
                />
              )}

              {activeTab === "investigations" && (
                <NewInvestigationWizard
                  onComplete={handleWizardComplete}
                  onCancel={() => setActiveTab("overview")}
                  cameras={cameras}
                />
              )}

              {activeTab === "possible_sightings" && (
                <PossibleSightingsStudioView
                  candidates={candidates}
                  caseId={activeCaseId}
                  searchError={searchError}
                  onConfirmSighting={handleConfirmMatch}
                  onMarkUncertain={handleMarkUncertain}
                  onRejectSighting={handleDismissMatch}
                  onLoadDemoData={handleLoadDemoData}
                />
              )}

              {activeTab === "investigation_map" && (
                <InvestigationMapView
                  confirmedSightings={confirmedSightings}
                  possibleCandidates={candidates}
                  selectedSightingId={selectedSightingId}
                  onSelectSighting={(id) => setSelectedSightingId(id)}
                  cameras={cameras}
                />
              )}

              {activeTab === "timeline" && (
                <TimelineView
                  sightings={confirmedSightings}
                  selectedSightingId={selectedSightingId}
                  onSelectSighting={(id) => setSelectedSightingId(id)}
                />
              )}

              {activeTab === "cctv_sources" && (
                <CCTVSourcesView
                  cameras={cameras}
                  onAddCamera={(newCam) => setCameras((prev) => [...prev, newCam])}
                  onUpdateCamera={(updatedCam) =>
                    setCameras((prev) =>
                      prev.map((c) => (c.id === updatedCam.id ? updatedCam : c))
                    )
                  }
                  onDeleteCamera={(camId) =>
                    setCameras((prev) => prev.filter((c) => c.id !== camId))
                  }
                />
              )}

              {activeTab === "live_cctv" && (
                <LiveCCTVView
                  onReviewCandidate={(cand) => setReviewingCandidate(cand)}
                />
              )}

              {activeTab === "settings" && (
                <div className="flex-1 bg-[#F4F6FA] p-8 flex flex-col items-center justify-center text-center font-mono">
                  <span className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                    SETTINGS MODULE
                  </span>
                  <p className="text-xs text-[#64748B] mt-1 max-w-md">
                    System configuration and parameters active under Ethiopian Federal Police Case #{activeCaseId}.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. Forensic Evidence Review Modal */}
      {reviewingCandidate && (
        <EvidenceReviewModal
          candidate={reviewingCandidate}
          targetPerson={targetPerson}
          onConfirm={handleConfirmMatch}
          onDismiss={handleDismissMatch}
          onClose={() => setReviewingCandidate(null)}
        />
      )}
    </div>
  );
}
