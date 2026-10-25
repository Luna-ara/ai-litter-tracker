<<<<<<< HEAD
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
=======
// Safe to import from client components: no database access here.

type Point = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in meters (haversine). */
export function distanceMeters(a: Point, b: Point): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Simulated GPS fix (agreed for the demo): a point 5–15 m from the hotspot centre in a random
 * direction, with 8 m accuracy, so it always lands inside the geofence.
 */
export function getDemoLocation(h: Point): Point & { accuracy: number } {
  const distance = 5 + Math.random() * 10;
  const bearing = Math.random() * 2 * Math.PI;
  const dLat = (distance * Math.cos(bearing)) / 111_320;
  const dLng = (distance * Math.sin(bearing)) / (111_320 * Math.cos(toRad(h.lat)));
  return { lat: h.lat + dLat, lng: h.lng + dLng, accuracy: 8 };
>>>>>>> origin/main
}
