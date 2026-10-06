"use client";

import React, { useState } from "react";
import Sidebar, { NavTab } from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import LiveCCTVView from "../../components/LiveCCTVView";
import EvidenceReviewModal from "../../components/EvidenceReviewModal";
import { MatchCandidate } from "../../lib/types";
import { useRouter } from "next/navigation";

export default function LivePage() {
  const router = useRouter();
  const [reviewingCandidate, setReviewingCandidate] = useState<MatchCandidate | null>(null);

  const handleTabChange = (tab: NavTab) => {
    if (tab === "overview") {
      router.push("/");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F6FA] text-[#0F172A] overflow-hidden font-sans">
      <Sidebar activeTab="live_cctv" onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 flex min-h-0 overflow-hidden">
          <LiveCCTVView onReviewCandidate={(cand) => setReviewingCandidate(cand)} />
        </main>
      </div>

      {reviewingCandidate && (
        <EvidenceReviewModal
          candidate={reviewingCandidate}
          onConfirm={() => {
            setReviewingCandidate(null);
          }}
          onDismiss={() => {
            setReviewingCandidate(null);
          }}
          onClose={() => setReviewingCandidate(null)}
        />
      )}
    </div>
  );
}
