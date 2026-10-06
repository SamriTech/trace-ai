import { Camera, InvestigationCase, MatchCandidate, Sighting, LiveCameraStream, LiveAlert } from './types';

export const DEFAULT_INVESTIGATION_CASE: InvestigationCase = {
  caseId: 'MP-2048',
  title: 'Disappearance of Subject - Bole / Kazanchis Corridor',
  leadInvestigator: 'Inspector T. Bekele (Forensic Re-ID Unit)',
  dateOpened: '2026-10-04T08:30:00Z',
  status: 'ACTIVE',
  priority: 'CRITICAL',
  targetDescription: 'Male, approx 28-32 yrs, dark navy jacket, light grey trousers, dark footwear. Last seen leaving Bole Medhanialem area.',
  notes: 'Authorized warrant ref #ETH-FP-2026-9812. Search restricted to public CCTV nodes.'
};

export const ADDIS_ABABA_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'Meskel Square Central Intercept',
    location: 'Meskel Square — North Pylon 01',
    zone: 'Kirkos Sub-City',
    lat: 9.0105,
    lon: 38.7612,
    status: 'ONLINE',
    resolution: '1080p @ 30fps',
    fps: 30,
    lastPing: 'Just now'
  },
  {
    id: 'CAM-04',
    name: 'Bole Medhanialem Roundabout',
    location: 'Cameroon St — Bole Medhanialem Junction',
    zone: 'Bole Sub-City',
    lat: 8.9956,
    lon: 38.7891,
    status: 'ONLINE',
    resolution: '1080p @ 30fps',
    fps: 30,
    lastPing: 'Just now'
  },
  {
    id: 'CAM-07',
    name: 'Bole Road — East Entrance (Atlas)',
    location: 'Bole Rd / Namibia St — Atlas Intercept',
    zone: 'Bole Sub-City',
    lat: 9.0021,
    lon: 38.7758,
    status: 'ONLINE',
    resolution: '4K @ 25fps',
    fps: 25,
    lastPing: 'Just now'
  },
  {
    id: 'CAM-12',
    name: 'Mexico Square / AU Boulevard',
    location: 'Mexico Roundabout — West Corridor',
    zone: 'Lideta Sub-City',
    lat: 9.0128,
    lon: 38.7439,
    status: 'ONLINE',
    resolution: '1080p @ 30fps',
    fps: 30,
    lastPing: 'Just now'
  },
  {
    id: 'CAM-15',
    name: 'Piassa / Churchill Avenue',
    location: 'Churchill Ave — Post Office Node',
    zone: 'Arada Sub-City',
    lat: 9.0305,
    lon: 38.7523,
    status: 'PROCESSING',
    resolution: '1080p @ 30fps',
    fps: 30,
    lastPing: '1 min ago'
  },
  {
    id: 'CAM-18',
    name: 'Megenagna Interchange',
    location: 'Megenagna Light Rail Station — East Portal',
    zone: 'Yeka Sub-City',
    lat: 9.0201,
    lon: 38.8021,
    status: 'ONLINE',
    resolution: '1080p @ 30fps',
    fps: 30,
    lastPing: 'Just now'
  },
  {
    id: 'CAM-22',
    name: 'Kazanchis Commercial Corridor',
    location: 'Menelik II Ave — UNECA Gate Intercept',
    zone: 'Kirkos Sub-City',
    lat: 9.0175,
    lon: 38.7680,
    status: 'ONLINE',
    resolution: '1080p @ 30fps',
    fps: 30,
    lastPing: 'Just now'
  },
  {
    id: 'CAM-25',
    name: 'Gotera Interchange',
    location: 'Gotera Overpass — Southbound',
    zone: 'Nifas Silk Sub-City',
    lat: 8.9880,
    lon: 38.7550,
    status: 'OFFLINE',
    resolution: '720p @ 15fps',
    fps: 15,
    lastPing: '15 mins ago'
  }
];

export const INITIAL_MATCH_CANDIDATES: MatchCandidate[] = [
  {
    tracklet_id: 'cand-001',
    camera_id: 'CAM-04',
    camera_name: 'Bole Medhanialem Roundabout',
    location_name: 'Cameroon St — Bole Medhanialem Junction',
    lat: 8.9956,
    lon: 38.7891,
    timestamp: '2026-10-05T14:02:15Z',
    confidence_score: 0.942,
    crop_url: null,
    feasibility_badge: 'Feasible',
    kinematics: {
      velocity_kmh: 4.8,
      transit_mode: 'walking',
      distance_meters: 180,
      time_diff_seconds: 135
    },
    review_status: 'CONFIRMED',
    original_track_id: 14,
    sharpness_score: 184.2,
    notes: 'Subject confirmed matching jacket color, height profile, and walking gait heading northwest.'
  },
  {
    tracklet_id: 'cand-002',
    camera_id: 'CAM-07',
    camera_name: 'Bole Road — East Entrance (Atlas)',
    location_name: 'Bole Rd / Namibia St — Atlas Intercept',
    lat: 9.0021,
    lon: 38.7758,
    timestamp: '2026-10-05T14:18:42Z',
    confidence_score: 0.916,
    crop_url: null,
    feasibility_badge: 'Feasible',
    kinematics: {
      velocity_kmh: 5.6,
      transit_mode: 'walking',
      distance_meters: 1540,
      time_diff_seconds: 987
    },
    review_status: 'CONFIRMED',
    original_track_id: 42,
    sharpness_score: 215.8,
    notes: 'Passes commercial frontage near Atlas hotel. Feasible walking transit time from CAM-04.'
  },
  {
    tracklet_id: 'cand-003',
    camera_id: 'CAM-22',
    camera_name: 'Kazanchis Commercial Corridor',
    location_name: 'Menelik II Ave — UNECA Gate Intercept',
    lat: 9.0175,
    lon: 38.7680,
    timestamp: '2026-10-05T14:35:10Z',
    confidence_score: 0.884,
    crop_url: null,
    feasibility_badge: 'Feasible',
    kinematics: {
      velocity_kmh: 6.2,
      transit_mode: 'walking',
      distance_meters: 1910,
      time_diff_seconds: 988
    },
    review_status: 'UNREVIEWED',
    original_track_id: 89,
    sharpness_score: 172.4,
    notes: 'Possible sighting entering pedestrian walkway. Requires investigator visual confirmation.'
  },
  {
    tracklet_id: 'cand-004',
    camera_id: 'CAM-01',
    camera_name: 'Meskel Square Central Intercept',
    location_name: 'Meskel Square — North Pylon 01',
    lat: 9.0105,
    lon: 38.7612,
    timestamp: '2026-10-05T14:48:30Z',
    confidence_score: 0.825,
    crop_url: null,
    feasibility_badge: 'Feasible',
    kinematics: {
      velocity_kmh: 4.5,
      transit_mode: 'walking',
      distance_meters: 1100,
      time_diff_seconds: 800
    },
    review_status: 'UNREVIEWED',
    original_track_id: 112,
    sharpness_score: 140.1,
    notes: 'Crossing south towards stadium zone. Pedestrian density high.'
  },
  {
    tracklet_id: 'cand-005',
    camera_id: 'CAM-12',
    camera_name: 'Mexico Square / AU Boulevard',
    location_name: 'Mexico Roundabout — West Corridor',
    lat: 9.0128,
    lon: 38.7439,
    timestamp: '2026-10-05T14:51:00Z',
    confidence_score: 0.791,
    crop_url: null,
    feasibility_badge: 'Unfeasible',
    kinematics: {
      velocity_kmh: 88.5,
      transit_mode: 'vehicle',
      distance_meters: 2200,
      time_diff_seconds: 90
    },
    review_status: 'UNREVIEWED',
    original_track_id: 204,
    sharpness_score: 98.6,
    notes: 'Kinematic alert: 2.2km span in 90 seconds (88.5 km/h) exceeds urban transit model unless onboard express emergency transport.'
  }
];

export const INITIAL_CONFIRMED_SIGHTINGS: Sighting[] = [
  {
    id: 'sight-001',
    tracklet_id: 'cand-001',
    camera_id: 'CAM-04',
    camera_name: 'Bole Medhanialem Roundabout',
    location_name: 'Cameroon St — Bole Medhanialem Junction',
    lat: 8.9956,
    lon: 38.7891,
    timestamp: '2026-10-05T14:02:15Z',
    similarity_score: 0.942,
    feasibility_badge: 'Feasible',
    kinematics: {
      velocity_kmh: 4.8,
      transit_mode: 'walking'
    },
    crop_url: null,
    sequenceNumber: 1,
    confirmedAt: '2026-10-05T14:15:00Z'
  },
  {
    id: 'sight-002',
    tracklet_id: 'cand-002',
    camera_id: 'CAM-07',
    camera_name: 'Bole Road — East Entrance (Atlas)',
    location_name: 'Bole Rd / Namibia St — Atlas Intercept',
    lat: 9.0021,
    lon: 38.7758,
    timestamp: '2026-10-05T14:18:42Z',
    similarity_score: 0.916,
    feasibility_badge: 'Feasible',
    kinematics: {
      velocity_kmh: 5.6,
      transit_mode: 'walking'
    },
    crop_url: null,
    sequenceNumber: 2,
    confirmedAt: '2026-10-05T14:25:00Z'
  }
];

export const LIVE_CAMERAS: LiveCameraStream[] = [
  {
    id: 'CAM-01',
    name: 'Meskel Square Central Intercept',
    location: 'Meskel Square North Pylon',
    zone: 'Kirkos Sector',
    lat: 9.0105,
    lon: 38.7612,
    status: 'ONLINE',
    rtspUrl: 'rtsp://cctv.police.et/stream/cam01',
    resolution: '1920x1080',
    fps: 30,
    hasActiveAlert: false
  },
  {
    id: 'CAM-04',
    name: 'Bole Medhanialem Junction',
    location: 'Cameroon St / Bole Rd',
    zone: 'Bole Sector',
    lat: 8.9956,
    lon: 38.7891,
    status: 'ONLINE',
    rtspUrl: 'rtsp://cctv.police.et/stream/cam04',
    resolution: '1920x1080',
    fps: 30,
    hasActiveAlert: false
  },
  {
    id: 'CAM-07',
    name: 'Bole Road — Atlas Intercept',
    location: 'Namibia St Crossing',
    zone: 'Bole Sector',
    lat: 9.0021,
    lon: 38.7758,
    status: 'MATCH_DETECTED',
    rtspUrl: 'rtsp://cctv.police.et/stream/cam07',
    resolution: '3840x2160',
    fps: 25,
    hasActiveAlert: true,
    lastDetectionTime: '2026-10-05T14:18:42Z'
  },
  {
    id: 'CAM-12',
    name: 'Mexico Square / AU Corridor',
    location: 'Mexico Roundabout West',
    zone: 'Lideta Sector',
    lat: 9.0128,
    lon: 38.7439,
    status: 'ONLINE',
    rtspUrl: 'rtsp://cctv.police.et/stream/cam12',
    resolution: '1920x1080',
    fps: 30,
    hasActiveAlert: false
  },
  {
    id: 'CAM-18',
    name: 'Megenagna LRT Station',
    location: 'East Transit Portal',
    zone: 'Yeka Sector',
    lat: 9.0201,
    lon: 38.8021,
    status: 'ONLINE',
    rtspUrl: 'rtsp://cctv.police.et/stream/cam18',
    resolution: '1920x1080',
    fps: 30,
    hasActiveAlert: false
  },
  {
    id: 'CAM-22',
    name: 'Kazanchis — UNECA Intercept',
    location: 'Menelik II Avenue',
    zone: 'Kirkos Sector',
    lat: 9.0175,
    lon: 38.7680,
    status: 'PROCESSING',
    rtspUrl: 'rtsp://cctv.police.et/stream/cam22',
    resolution: '1920x1080',
    fps: 30,
    hasActiveAlert: true,
    lastDetectionTime: '2026-10-05T14:35:10Z'
  }
];

export const LIVE_ALERTS: LiveAlert[] = [
  {
    id: 'alert-01',
    camera_id: 'CAM-07',
    camera_name: 'Bole Road — Atlas Intercept',
    timestamp: '2026-10-05T14:18:42Z',
    similarity_score: 0.916,
    reviewed: false,
    status: 'NEW'
  },
  {
    id: 'alert-02',
    camera_id: 'CAM-22',
    camera_name: 'Kazanchis — UNECA Intercept',
    timestamp: '2026-10-05T14:35:10Z',
    similarity_score: 0.884,
    reviewed: false,
    status: 'NEW'
  }
];
