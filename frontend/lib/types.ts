export type FeasibilityBadge = 'Feasible' | 'Unfeasible' | 'Uncertain';
export type TransitMode = 'stationary' | 'walking' | 'vehicle' | 'unknown';
export type ReviewStatus = 'UNREVIEWED' | 'CONFIRMED' | 'DISMISSED';
export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'PROCESSING' | 'MATCH_DETECTED';
export type InvestigationMode = 'INVESTIGATION' | 'LIVE_CCTV';

export interface Camera {
  id: string;
  name: string;
  location: string;
  zone: string;
  lat: number;
  lon: number;
  status: CameraStatus;
  resolution?: string;
  fps?: number;
  lastPing?: string;
}

export interface InvestigationCase {
  caseId: string;
  title: string;
  leadInvestigator: string;
  dateOpened: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  targetDescription?: string;
  notes?: string;
}

export interface TargetPerson {
  id: string;
  name: string;
  age?: number;
  lastSeenLocation: string;
  lastSeenTime: string;
  clothingDescription?: string;
  photoUrl: string | null;
  file?: File | null;
}

export interface KinematicsData {
  velocity_kmh: number;
  transit_mode: TransitMode;
  distance_meters?: number;
  time_diff_seconds?: number;
}

export interface MatchCandidate {
  tracklet_id: string;
  camera_id: string;
  camera_name?: string;
  location_name?: string;
  lat: number;
  lon: number;
  timestamp: string;
  confidence_score: number; // 0.0 to 1.0 (visual similarity)
  crop_url?: string | null;
  feasibility_badge: FeasibilityBadge;
  kinematics: KinematicsData;
  review_status: ReviewStatus;
  original_track_id?: number;
  sharpness_score?: number;
  notes?: string;
}

export interface Sighting {
  id: string;
  tracklet_id: string;
  camera_id: string;
  camera_name: string;
  location_name: string;
  lat: number;
  lon: number;
  timestamp: string;
  similarity_score: number;
  feasibility_badge: FeasibilityBadge;
  kinematics: KinematicsData;
  crop_url?: string | null;
  sequenceNumber: number;
  confirmedAt?: string;
}

export interface LiveCameraStream {
  id: string;
  name: string;
  location: string;
  zone: string;
  lat: number;
  lon: number;
  status: CameraStatus;
  rtspUrl: string;
  resolution: string;
  fps: number;
  lastDetectionTime?: string;
  hasActiveAlert?: boolean;
}

export interface LiveAlert {
  id: string;
  camera_id: string;
  camera_name: string;
  timestamp: string;
  similarity_score: number;
  crop_url?: string;
  reviewed: boolean;
  status: 'NEW' | 'REVIEWED' | 'DISMISSED';
}

export interface SearchQueryParams {
  file: File;
  ref_lat: number;
  ref_lon: number;
  ref_timestamp: string;
  selected_cameras?: string[];
}
