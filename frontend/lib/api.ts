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

export async function searchPerson(params: SearchQueryParams): Promise<{ candidates: MatchCandidate[]; isLiveBackend: boolean }> {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('ref_lat', params.ref_lat.toString());
  formData.append('ref_lon', params.ref_lon.toString());
  formData.append('ref_timestamp', params.ref_timestamp);

  try {
    const res = await fetch(`${API_BASE_URL}/api/search/`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      const rawCandidates = data.candidates || [];
      
      if (rawCandidates.length > 0) {
        const parsedCandidates: MatchCandidate[] = rawCandidates.map((c: any, index: number) => ({
          tracklet_id: c.tracklet_id || `live-cand-${index}`,
          camera_id: c.camera_id || 'UNKNOWN-CAM',
          camera_name: c.camera_id ? `CCTV Node ${c.camera_id}` : 'Unassigned Camera Node',
          lat: c.lat ?? (9.0105 + (Math.random() - 0.5) * 0.03),
          lon: c.lon ?? (38.7612 + (Math.random() - 0.5) * 0.03),
          timestamp: c.timestamp || new Date().toISOString(),
          confidence_score: typeof c.confidence_score === 'number' ? c.confidence_score : 0.75,
          crop_url: c.crop_url ? getCropImageUrl(c.crop_url) : null,
          feasibility_badge: c.feasibility_badge === 'Unfeasible' ? 'Unfeasible' : 'Feasible',
          kinematics: {
            velocity_kmh: c.kinematics?.velocity_kmh ?? 4.5,
            transit_mode: c.kinematics?.transit_mode || 'walking',
          },
          review_status: 'UNREVIEWED',
          original_track_id: c.original_track_id,
        }));
        return { candidates: parsedCandidates, isLiveBackend: true };
      }
    }
  } catch (error) {
    console.warn('Backend search unreachable or encountered an error. Utilizing forensic mock simulation dataset.', error);
  }

  // Fallback to simulated forensic candidates if backend has no results / is offline
  return {
    candidates: INITIAL_MATCH_CANDIDATES.map(c => ({
      ...c,
      crop_url: c.crop_url ? getCropImageUrl(c.crop_url) : null
    })),
    isLiveBackend: false
  };
}

export async function indexVideo(file: File, cameraId: string, timestampOffset: number = 0.0): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('camera_id', cameraId);
  formData.append('timestamp_offset', timestampOffset.toString());

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
