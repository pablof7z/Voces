/**
 * Encodes a latitude and longitude into a geohash string.
 *
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param precision Length of the resulting geohash (default: 5)
 * @returns Geohash string
 */
export function encodeGeohash(lat: number, lon: number, precision = 5): string {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  let latRange = [-90.0, 90.0];
  let lonRange = [-180.0, 180.0];

  while (geohash.length < precision) {
    if (evenBit) {
      const mid = (lonRange[0] + lonRange[1]) / 2;
      if (lon >= mid) {
        idx |= (1 << (4 - bit));
        lonRange[0] = mid;
      } else {
        lonRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        idx |= (1 << (4 - bit));
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    evenBit = !evenBit;
    bit++;

    if (bit === 5) {
      geohash += base32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}
