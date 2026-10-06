from datetime import datetime
from geopy.distance import geodesic

def validate_trajectory(prev_cam: dict, prev_timestamp: datetime, next_cam: dict, next_timestamp: datetime) -> tuple[bool, float, str]:
    """
    Validates if the transition between two cameras is physically possible based on speed.
    
    Args:
        prev_cam: Dictionary with 'lat' and 'lon' keys.
        prev_timestamp: Timestamp of the previous detection.
        next_cam: Dictionary with 'lat' and 'lon' keys.
        next_timestamp: Timestamp of the next detection.
        
    Returns:
        tuple: (is_feasible, velocity_kmh, transit_mode)
    """
    prev_coords = (prev_cam['lat'], prev_cam['lon'])
    next_coords = (next_cam['lat'], next_cam['lon'])
    
    distance_meters = geodesic(prev_coords, next_coords).meters
    time_diff_seconds = (next_timestamp - prev_timestamp).total_seconds()
    
    # Handle same location or invalid time differences
    if time_diff_seconds <= 0:
        if distance_meters > 0:
            return False, float('inf'), "unknown"
        return True, 0.0, "stationary"
        
    speed_ms = distance_meters / time_diff_seconds
    velocity_kmh = speed_ms * 3.6
    
    # Max allowed speed is 25 m/s (90 km/h)
    is_feasible = speed_ms <= 25.0
    
    if speed_ms < 0.1:
        transit_mode = "stationary"
    elif speed_ms <= 2.0: # ~7.2 km/h
        transit_mode = "walking"
    else:
        transit_mode = "vehicle"
        
    return is_feasible, velocity_kmh, transit_mode
