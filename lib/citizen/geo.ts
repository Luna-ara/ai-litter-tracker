type Coordinates = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_000;
const radians = (degrees: number) => (degrees * Math.PI) / 180;
const degrees = (radians: number) => (radians * 180) / Math.PI;

export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const latA = radians(a.lat);
  const latB = radians(b.lat);
  const deltaLat = latB - latA;
  const deltaLng = radians(b.lng - a.lng);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLng / 2) ** 2;
  // Clamp floating-point roundoff at identical or antipodal points.
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(Math.min(1, Math.max(0, haversine))));
}

/** Simulated check-in only: does not request the device's GPS location. */
export function getDemoLocation(h: Coordinates): Coordinates & { accuracy: number } {
  const angularDistance = (5 + Math.random() * 10) / EARTH_RADIUS_M;
  const bearing = Math.random() * 2 * Math.PI;
  const lat = radians(h.lat);
  const lng = radians(h.lng);
  const targetLat = Math.asin(
    Math.sin(lat) * Math.cos(angularDistance) +
      Math.cos(lat) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const targetLng = lng + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat),
    Math.cos(angularDistance) - Math.sin(lat) * Math.sin(targetLat),
  );
  return {
    lat: degrees(targetLat),
    lng: ((degrees(targetLng) + 540) % 360) - 180,
    accuracy: 8,
  };
}
