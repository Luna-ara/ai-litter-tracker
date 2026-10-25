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
}
