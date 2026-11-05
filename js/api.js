/**
 * Weather Radar — API Service
 * Handles Open-Meteo forecasts, air quality, geocoding search, and smart location detection.
 */

// Helper to make fetch requests with a timeout
async function fetchWithTimeout(url, timeoutMs = 4500, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response.ok ? await response.json() : null;
  } catch (err) {
    clearTimeout(timer);
    return null;
  }
}

const API = {
  WEATHER_URL: "https://api.open-meteo.com/v1/forecast",
  AQI_URL: "https://air-quality-api.open-meteo.com/v1/air-quality",
  GEOCODE_URL: "https://geocoding-api.open-meteo.com/v1/search",

  /**
   * Fetch current weather, 24h hourly forecast, and 7-day daily outlook
   */
  async getWeather(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index",
      hourly: "temperature_2m,precipitation_probability,weather_code,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,precipitation_sum",
      timezone: "auto"
    });

    const data = await fetchWithTimeout(`${this.WEATHER_URL}?${params}`, 7000);
    if (!data) throw new Error("Unable to reach weather service");
    return data;
  },

  /**
   * Fetch Air Quality Index data (US AQI, PM2.5, PM10)
   */
  async getAirQuality(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: "us_aqi,european_aqi,pm10,pm2_5,ozone,nitrogen_dioxide"
    });
    return await fetchWithTimeout(`${this.AQI_URL}?${params}`, 5000);
  },

  /**
   * Search city names for autocomplete
   */
  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];
    const params = new URLSearchParams({ name: query.trim(), count: 6, language: "en", format: "json" });
    const data = await fetchWithTimeout(`${this.GEOCODE_URL}?${params}`, 4000);
    return data?.results || [];
  },

  /**
   * Reverse Geocode coordinates to city & country name
   */
  async reverseGeocode(lat, lon) {
    // 1. Try OpenStreetMap Nominatim
    const osm = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      3500,
      { headers: { "Accept-Language": "en" } }
    );
    if (osm?.address) {
      const a = osm.address;
      const city = a.city || a.town || a.village || a.municipality || a.suburb || a.county || osm.name || "Current Location";
      const state = a.state || a.region || "";
      const country = a.country || "";
      return { name: city, admin1: state, country, displayName: [city, state, country].filter(Boolean).join(", ") };
    }

    // 2. Fallback to BigDataCloud
    const bdc = await fetchWithTimeout(
      `https://api-bdc.io/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      3500
    );
    if (bdc) {
      const city = bdc.city || bdc.locality || bdc.principalSubdivision || "Current Location";
      const state = bdc.principalSubdivision || "";
      const country = bdc.countryName || "";
      return { name: city, admin1: state, country, displayName: [city, state, country].filter(Boolean).join(", ") };
    }

    return { name: "Your Location", admin1: "", country: "", displayName: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}` };
  },

  /**
   * Fast IP Geolocation (Zero setup, no permissions needed)
   */
  async getLocationFromIP() {
    // Try ipwho.is
    const ipwho = await fetchWithTimeout("https://ipwho.is/", 3500);
    if (ipwho?.success && ipwho.latitude && ipwho.longitude) {
      const city = ipwho.city || ipwho.region || "Current Location";
      return {
        latitude: parseFloat(ipwho.latitude),
        longitude: parseFloat(ipwho.longitude),
        name: city,
        admin1: ipwho.region || "",
        country: ipwho.country || "",
        displayName: [city, ipwho.region, ipwho.country].filter(Boolean).join(", "),
        source: "network"
      };
    }

    // Fallback to geojs.io
    const geojs = await fetchWithTimeout("https://get.geojs.io/v1/ip/geo.json", 3500);
    if (geojs?.latitude && geojs.longitude) {
      const city = geojs.city || geojs.region || "Current Location";
      return {
        latitude: parseFloat(geojs.latitude),
        longitude: parseFloat(geojs.longitude),
        name: city,
        admin1: geojs.region || "",
        country: geojs.country || "",
        displayName: [city, geojs.region, geojs.country].filter(Boolean).join(", "),
        source: "network"
      };
    }

    return null;
  },

  /**
   * Dual-layer location detection:
   * 1. Attempts browser GPS (if available and not on file:// protocol)
   * 2. Automatically falls back to IP Geolocation if GPS is blocked, denied, or unavailable
   */
  async getUserLocation() {
    const isFileProtocol = window.location.protocol === "file:";

    if (navigator.geolocation && !isFileProtocol) {
      try {
        return await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              source: "gps"
            }),
            (err) => reject(err),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 120000 }
          );
        });
      } catch (e) {
        console.warn("GPS lookup unavailable, switching to network IP location.");
      }
    }

    const ipLoc = await this.getLocationFromIP();
    if (ipLoc) return ipLoc;

    throw new Error("Location detection failed. Please search for your city above.");
  }
};

window.API = API;
