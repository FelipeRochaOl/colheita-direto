import type { GeoPoint } from '@colheita/contracts';

const EARTH_RADIUS_KM = 6371;

/** Distância em linha reta (fórmula de Haversine), em km. */
export function calculateDistanceKm(origin: GeoPoint, destination: GeoPoint): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(origin.latitude)) *
      Math.cos(toRadians(destination.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

/** GeoJSON usa [longitude, latitude]. */
export function toGeoJsonPoint(point: GeoPoint) {
  return { type: 'Point' as const, coordinates: [point.longitude, point.latitude] };
}

export function fromGeoJsonPoint(geoJson: { coordinates: number[] }): GeoPoint {
  return { longitude: geoJson.coordinates[0], latitude: geoJson.coordinates[1] };
}
