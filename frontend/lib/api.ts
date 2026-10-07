import { MatchCandidate, SearchQueryParams } from './types';
import { INITIAL_MATCH_CANDIDATES } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getCropImageUrl(cropUrl?: string | null): string {
  if (!cropUrl) {
    return '';
  }
  if (cropUrl.startsWith('http://') || cropUrl.startsWith('https://') || cropUrl.startsWith('data:')) {
    return cropUrl;
  }
  const cleanPath = cropUrl.startsWith('/') ? cropUrl : `/${cropUrl}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export async function checkBackendHealth(): Promise<{ status: string; service: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export interface SearchPersonResult {
  candidates: MatchCandidate[];
  isLiveBackend: boolean;
  totalMatches: number;
}

export async function searchPerson(params: SearchQueryParams): Promise<SearchPersonResult> {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('ref_lat', params.ref_lat.toString());
  formData.append('ref_lon', params.ref_lon.toString());
  formData.append('ref_timestamp', params.ref_timestamp);

  const res = await fetch(`${API_BASE_URL}/api/search/`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Backend search service returned an error' }));
    throw new Error(errorData.detail || `Search query failed with status ${res.status}`);
  }

  const data = await res.json();
  const rawCandidates = data.candidates || [];

  const parsedCandidates: MatchCandidate[] = rawCandidates.map((c: any, index: number) => ({
    tracklet_id: c.tracklet_id || `cand-${index}`,
    camera_id: c.camera_id || 'UNKNOWN-CAM',
    camera_name: c.camera_id ? `CCTV Node ${c.camera_id}` : 'Unassigned Camera Node',
    lat: typeof c.lat === 'number' ? c.lat : 9.0105,
    lon: typeof c.lon === 'number' ? c.lon : 38.7612,
    timestamp: typeof c.timestamp === 'number' ? new Date(c.timestamp * 1000).toISOString() : (c.timestamp || new Date().toISOString()),
    confidence_score: typeof c.confidence_score === 'number' ? c.confidence_score : 0.0,
    crop_url: c.crop_url ? getCropImageUrl(c.crop_url) : null,
    feasibility_badge: c.feasibility_badge === 'Unfeasible' ? 'Unfeasible' : 'Feasible',
    kinematics: {
      velocity_kmh: c.kinematics?.velocity_kmh ?? 0,
      transit_mode: c.kinematics?.transit_mode || 'unknown',
    },
    review_status: 'UNREVIEWED',
    original_track_id: c.original_track_id,
    sharpness_score: c.sharpness_score,
  }));

  return {
    candidates: parsedCandidates,
    isLiveBackend: true,
    totalMatches: parsedCandidates.length,
  };
}

/**
 * Returns mock candidates strictly for explicit development / demo simulation mode.
 */
export function getDemoForensicCandidates(): MatchCandidate[] {
  return INITIAL_MATCH_CANDIDATES.map(c => ({
    ...c,
    crop_url: c.crop_url ? getCropImageUrl(c.crop_url) : null
  }));
}

export interface IndexVideoResult {
  status: string;
  message: string;
  camera_id: string;
  indexed_tracklets: number;
  total_frames: number;
  total_tracks: number;
  duration_seconds: number;
  timestamp_offset: number;
  filename: string;
}

export async function indexVideo(
  file: File,
  cameraId: string,
  timestampOffset: number = 0.0,
  camLat?: number,
  camLon?: number
): Promise<IndexVideoResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('camera_id', cameraId);
  formData.append('timestamp_offset', timestampOffset.toString());
  if (camLat !== undefined) {
    formData.append('cam_lat', camLat.toString());
  }
  if (camLon !== undefined) {
    formData.append('cam_lon', camLon.toString());
  }

  const res = await fetch(`${API_BASE_URL}/api/video/index-video`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to index video' }));
    throw new Error(errorData.detail || 'Video indexing error');
  }

  return await res.json();
}
