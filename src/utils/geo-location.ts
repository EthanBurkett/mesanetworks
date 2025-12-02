import axios from "axios";

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export async function getLocationFromIP(
  ip: string
): Promise<GeoLocation | undefined> {
  // Skip localhost/private IPs
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.20.") ||
    ip.startsWith("172.21.") ||
    ip.startsWith("172.22.") ||
    ip.startsWith("172.23.") ||
    ip.startsWith("172.24.") ||
    ip.startsWith("172.25.") ||
    ip.startsWith("172.26.") ||
    ip.startsWith("172.27.") ||
    ip.startsWith("172.28.") ||
    ip.startsWith("172.29.") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  ) {
    return undefined;
  }

  try {
    // Using ip-api.com (free tier: 45 requests/minute)
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 3000,
      params: {
        fields: "status,country,regionName,city,lat,lon",
      },
    });

    if (response.data.status === "success") {
      return {
        country: response.data.country,
        region: response.data.regionName,
        city: response.data.city,
        latitude: response.data.lat,
        longitude: response.data.lon,
      };
    }
  } catch (error) {
    // Silently fail - geo location is not critical
    console.error("Failed to get geo location:", error);
  }

  return undefined;
}
