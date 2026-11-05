# 📡 Weather Radar — Live Weather Dashboard

A developer-grade, responsive weather web application built using **pure HTML5, CSS3, and modern Vanilla JavaScript (ES6+)**. Features real-time location-based weather detection, 24-hour hourly forecast carousel, 7-day extended outlook, atmospheric metrics, and air quality index.

**Zero API keys or setup required!** Works out-of-the-box using the open and reliable **Open-Meteo** and **OpenStreetMap Nominatim** APIs.

---

## ✨ Features

### 📍 1. Smart Dual-Layer Location Detection
- **Layer 1 (Browser Hardware GPS)**: When run over `http://localhost` or `https://`, Weather Radar requests high-accuracy hardware/Wi-Fi positioning via `navigator.geolocation`.
- **Layer 2 (Instant Network / IP Fallback)**: If hardware GPS is denied, unavailable, times out, or when opened directly as a file (`file:///...` where browser security sandboxes block GPS), Weather Radar **instantly falls back to IP-based Geolocation** (`ipwho.is` and `geojs.io`).
- **Zero Configuration**: Users always see their real city, state, and country weather immediately without having to configure anything!
- **One-Click Locate**: Prominent **"My Location"** button (`L` shortcut) to re-detect your location anytime.

### 🔍 2. Real-time City Search & Autocomplete
- Live, debounced search as you type.
- Autocomplete dropdown displaying matching cities with administrative region and country labels.
- Quick location chips bar to instantly switch between popular global capitals or your recently viewed cities.

### 🌡️ 3. Dynamic Current Weather Overview (Hero Panel)
- Live temperature with instant **°C / °F unit toggle** (persisted in `localStorage`).
- "Feels like" apparent temperature, today's high & low.
- Animated, high-definition inline SVG weather icons matching WMO meteorological codes (sunny, partly cloudy, thunderstorms, rain showers, sleet, snow, fog, etc.).
- Dynamic background gradients that change according to day/night and active weather conditions.

### ⏱️ 4. 24-Hour Hourly Forecast
- Interactive horizontal carousel displaying the next 24 hours of forecast data.
- "Now" indicator highlighting the current hour.
- Hourly temperature, condition icon, and precipitation probability (💧 %).
- Smooth arrow button scrolling and trackpad/touch swipe support.

### 📅 5. 7-Day Extended Outlook
- 7-day daily forecast breakdown with day name, date, and weather condition.
- **Visual Min/Max Temperature Range Bars**: High-contrast gradient bars displaying how each day's temperature range compares across the weekly spectrum.

### 📊 6. Comprehensive Atmospheric Highlights & AQI Grid
- 🌬️ **Wind Status**: Speed (km/h or mph), dynamic 360° rotating compass needle, and Beaufort scale wind description.
- 💧 **Humidity**: Real-time relative humidity percentage, progress gauge, and calculated dew point temperature.
- ☀️ **UV Index**: Live UV index rating (Low, Moderate, High, Very High, Extreme) with sun safety guidelines.
- 🌫️ **Air Quality Index (US AQI)**: Real-time AQI measurement, health assessment, and PM2.5 / PM10 particulate levels.
- 🌅 **Sunrise & Sunset**: Local sunrise and sunset timings, total daylight calculation, and visual solar trajectory progress dot.
- 🌡️ **Atmospheric Pressure**: Barometric surface pressure in hPa with weather trend assessment.
- 🌧️ **Precipitation**: Today's rain accumulation in mm and probability percentage.

### ⚙️ 7. UX & Developer Touches
- **Glassmorphism UI**: High-end backdrop blur (`backdrop-filter: blur(24px)`), semi-transparent borders, and ambient light orbs.
- **Dark / Light Theme Toggle**: Switch between sleek midnight dark mode and crisp high-contrast light mode.
- **Favorites & Bookmarks**: Star any city to save it in your favorites list; manage saved locations via the Saved Locations modal.
- **Keyboard Shortcuts**:
  - <kbd>/</kbd> — Focus search input instantly.
  - <kbd>L</kbd> — Trigger GPS location detection.
  - <kbd>Esc</kbd> — Close dropdowns and modals.
- **Toast Notifications**: Non-intrusive alerts for geolocation, unit switches, and favorite bookmarks.
- **100% Responsive**: Fully responsive layout tailored for smartphones, tablets, laptops, and ultra-wide displays.

---

## 🚀 How to Run the App

Because Weather Radar is built with standard web technologies and uses CORS-enabled APIs, you can run it in multiple easy ways:

### Option 1: Directly Open in Browser
Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

*(Note: For the best experience with browser geolocation permissions, modern browsers recommend serving over `http://localhost` or HTTPS).*

### Option 2: Using Python's Built-in Local Server
Open PowerShell or Terminal in the project directory and run:

```bash
# Python 3
python -m http.server 8000
```
Then open: **[http://localhost:8000](http://localhost:8000)** in your browser.

### Option 3: Using VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 📁 Project Architecture

```
Project/
│
├── index.html              # Semantic HTML5 application shell & components
│
├── css/
│   └── style.css           # Glassmorphism, CSS variables, themes, animations & responsive queries
│
├── js/
│   ├── weather-codes.js    # WMO weather code definitions (0-99), themes, and inline SVG generator
│   ├── api.js              # Open-Meteo & Nominatim API fetchers with error handling & timeouts
│   └── app.js              # State management, geolocation, search autocomplete, DOM rendering & events
│
└── README.md               # Complete project documentation
```

---

## 🌐 APIs Used & Attribution

- **[Open-Meteo](https://open-meteo.com/)**: Weather Forecast API and Air Quality API. Free for open-source and personal use without requiring an API key.
- **[OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)**: Reverse geocoding of GPS coordinates into city and country names.
- **[Google Fonts](https://fonts.google.com/)**: *Plus Jakarta Sans* typeface.
