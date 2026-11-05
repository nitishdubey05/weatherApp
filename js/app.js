/**
 * Weather Radar — Application Controller
 * Clean, modular ES6+ architecture handling state, UI rendering, and location detection.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    unit: localStorage.getItem('weatherradar_unit') || localStorage.getItem('skycast_unit') || 'C',
    theme: localStorage.getItem('weatherradar_theme') || localStorage.getItem('skycast_theme') || 'dark',
    currentLocation: { name: 'Kolkata', admin1: 'West Bengal', country: 'India', lat: 22.57, lon: 88.36 },
    isCurrentLocationGps: false,
    weatherData: null,
    aqiData: null,
    favorites: JSON.parse(localStorage.getItem('weatherradar_favorites') || localStorage.getItem('skycast_favorites') || '[]'),
    popularDefaults: [
      { name: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.65 },
      { name: 'London', country: 'United Kingdom', lat: 51.51, lon: -0.13 },
      { name: 'New York', country: 'United States', lat: 40.71, lon: -74.01 },
      { name: 'Paris', country: 'France', lat: 48.86, lon: 2.35 },
      { name: 'Sydney', country: 'Australia', lat: -33.87, lon: 151.21 }
    ]
  };

  // DOM Elements Cache
  const DOM = {
    body: document.body,
    searchInput: document.getElementById('search-input'),
    searchForm: document.getElementById('search-form'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    searchSuggestions: document.getElementById('search-suggestions'),
    btnLocate: document.getElementById('btn-locate'),
    btnUnitC: document.getElementById('btn-unit-c'),
    btnUnitF: document.getElementById('btn-unit-f'),
    btnFavorites: document.getElementById('btn-favorites'),
    favCountBadge: document.getElementById('fav-count-badge'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    themeSunIcon: document.getElementById('theme-sun-icon'),
    themeMoonIcon: document.getElementById('theme-moon-icon'),
    quickChipsContainer: document.getElementById('quick-chips-container'),
    toastContainer: document.getElementById('toast-container'),
    errorBanner: document.getElementById('error-banner'),
    errorMessage: document.getElementById('error-message'),
    btnErrorRetry: document.getElementById('btn-error-retry'),

    // Hero Panel
    cityName: document.getElementById('current-city-name'),
    locationDetail: document.getElementById('current-location-detail'),
    currentDateTime: document.getElementById('current-date-time'),
    dataUpdatedTime: document.getElementById('data-updated-time'),
    btnToggleFavorite: document.getElementById('btn-toggle-favorite'),
    conditionBadge: document.getElementById('condition-badge'),
    conditionLabel: document.getElementById('condition-label'),
    currentTemp: document.getElementById('current-temp'),
    displayUnitSymbol: document.getElementById('display-unit-symbol'),
    currentFeelsLike: document.getElementById('current-feels-like'),
    todayHigh: document.getElementById('today-high'),
    todayLow: document.getElementById('today-low'),
    heroWeatherIcon: document.getElementById('hero-weather-icon'),
    weatherSummaryText: document.getElementById('weather-summary-text'),

    // Forecasts
    hourlyList: document.getElementById('hourly-forecast-list'),
    hourlyScrollLeft: document.getElementById('hourly-scroll-left'),
    hourlyScrollRight: document.getElementById('hourly-scroll-right'),
    dailyList: document.getElementById('daily-forecast-list'),

    // Highlights & Metrics
    valWindSpeed: document.getElementById('val-wind-speed'),
    unitWindSpeed: document.getElementById('unit-wind-speed'),
    compassNeedle: document.getElementById('compass-needle'),
    valWindDirection: document.getElementById('val-wind-direction'),
    windAssessment: document.getElementById('wind-assessment'),
    valHumidity: document.getElementById('val-humidity'),
    barHumidity: document.getElementById('bar-humidity'),
    valDewPoint: document.getElementById('val-dew-point'),
    valUvIndex: document.getElementById('val-uv-index'),
    badgeUvRisk: document.getElementById('badge-uv-risk'),
    barUv: document.getElementById('bar-uv'),
    uvAdvice: document.getElementById('uv-advice'),
    valAqi: document.getElementById('val-aqi'),
    badgeAqi: document.getElementById('badge-aqi'),
    valPm25: document.getElementById('val-pm25'),
    valPm10: document.getElementById('val-pm10'),
    aqiDesc: document.getElementById('aqi-desc'),
    valSunrise: document.getElementById('val-sunrise'),
    valSunset: document.getElementById('val-sunset'),
    sunCurveIndicator: document.getElementById('sun-curve-indicator'),
    daylightDuration: document.getElementById('daylight-duration'),
    valPressure: document.getElementById('val-pressure'),
    barPressure: document.getElementById('bar-pressure'),
    pressureDesc: document.getElementById('pressure-desc'),
    valPrecipitation: document.getElementById('val-precipitation'),
    valPrecipChance: document.getElementById('val-precip-chance'),
    precipForecastDesc: document.getElementById('precip-forecast-desc'),
    valConditionShort: document.getElementById('val-condition-short'),
    valCoordsDisplay: document.getElementById('val-coords-display'),
    valDayNightIndicator: document.getElementById('val-day-night-indicator'),

    // Modal
    favoritesModal: document.getElementById('favorites-modal'),
    btnCloseFavModal: document.getElementById('btn-close-fav-modal'),
    favoritesListContainer: document.getElementById('favorites-list-container')
  };

  // Utilities
  const debounce = (fn, wait = 280) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  const toFahrenheit = (c) => Math.round((c * 9) / 5 + 32);
  const formatTemp = (c) => (c == null || isNaN(c)) ? '--' : (state.unit === 'F' ? toFahrenheit(c) : Math.round(c));
  const formatSpeed = (kmh) => (kmh == null || isNaN(kmh)) ? '--' : (state.unit === 'F' ? (kmh * 0.621371).toFixed(1) : Math.round(kmh));
  const getSpeedUnit = () => state.unit === 'F' ? 'mph' : 'km/h';

  function formatTime(isoStr, tz) {
    if (!isoStr) return '--:--';
    try {
      return new Date(isoStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
    } catch { return isoStr.split('T')[1] || isoStr; }
  }

  function getDayName(isoDate, index, tz) {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    try {
      return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', timeZone: tz });
    } catch { return 'Day ' + (index + 1); }
  }

  function getWindDirection(deg = 0) {
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return `${cardinals[Math.round((deg % 360) / 45) % 8]} (${Math.round(deg)}°)`;
  }

  function showToast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${msg}</span>`;
    DOM.toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // Weather Assessment Helpers
  function getUvInfo(uv = 0) {
    if (uv <= 2) return { text: 'Low', cls: 'badge-green', advice: 'Minimal protection needed' };
    if (uv <= 5) return { text: 'Moderate', cls: 'badge-yellow', advice: 'Wear sunglasses & SPF 30+' };
    if (uv <= 7) return { text: 'High', cls: 'badge-orange', advice: 'Seek shade during midday' };
    if (uv <= 10) return { text: 'Very High', cls: 'badge-red', advice: 'Extra protection required' };
    return { text: 'Extreme', cls: 'badge-purple', advice: 'Avoid midday sun exposure' };
  }

  function getAqiInfo(aqi = 0) {
    if (aqi <= 50) return { text: 'Good', cls: 'badge-green', desc: 'Air quality is satisfactory' };
    if (aqi <= 100) return { text: 'Moderate', cls: 'badge-yellow', desc: 'Acceptable for most individuals' };
    if (aqi <= 150) return { text: 'Sensitive', cls: 'badge-orange', desc: 'Sensitive groups should reduce exertion' };
    if (aqi <= 200) return { text: 'Unhealthy', cls: 'badge-red', desc: 'General public may experience irritation' };
    return { text: 'Hazardous', cls: 'badge-purple', desc: 'Health alert: avoid outdoor activities' };
  }

  // Core Data Fetcher
  async function loadWeatherData(lat, lon, locationInfo = null) {
    DOM.cityName.textContent = 'Loading...';
    DOM.locationDetail.textContent = 'Updating meteorological readings...';
    DOM.errorBanner.classList.add('hidden');

    try {
      const loc = locationInfo || await API.reverseGeocode(lat, lon);
      state.currentLocation = {
        name: loc.name || 'Current Location',
        admin1: loc.admin1 || '',
        country: loc.country || '',
        lat, lon
      };

      const [weather, aqi] = await Promise.all([
        API.getWeather(lat, lon),
        API.getAirQuality(lat, lon)
      ]);

      state.weatherData = weather;
      state.aqiData = aqi;

      renderDashboard();
      renderQuickChips();
      updateFavoriteButtonState();
    } catch (err) {
      console.error('[WeatherRadar]', err);
      DOM.errorMessage.textContent = err.message || 'Failed to load weather data.';
      DOM.errorBanner.classList.remove('hidden');
    }
  }

  // Location Detection Action
  async function handleGetCurrentLocation() {
    DOM.btnLocate.classList.add('loading');
    showToast('Detecting location...', 'info');

    try {
      const locData = await API.getUserLocation();
      state.isCurrentLocationGps = true;
      showToast(`📍 Location detected: ${locData.name || 'Local'}`, 'success');
      await loadWeatherData(locData.latitude, locData.longitude, locData.name ? locData : null);
    } catch (err) {
      showToast(err.message, 'error');
      if (!state.weatherData) {
        await loadWeatherData(state.popularDefaults[0].lat, state.popularDefaults[0].lon, state.popularDefaults[0]);
      }
    } finally {
      DOM.btnLocate.classList.remove('loading');
    }
  }

  // Render Dashboard
  function renderDashboard() {
    const { current, daily, hourly, timezone } = state.weatherData || {};
    if (!current) return;

    const weatherInfo = WeatherCodes.getWeatherInfo(current.weather_code, current.is_day);

    // Dynamic Theme
    const isLight = DOM.body.classList.contains('light-theme');
    DOM.body.className = `${weatherInfo.theme} ${isLight ? 'light-theme' : ''}`;

    // 1. Hero Card
    DOM.cityName.textContent = state.currentLocation.name;
    const region = [state.currentLocation.admin1, state.currentLocation.country].filter(Boolean).join(', ');
    DOM.locationDetail.textContent = region || `Lat: ${state.currentLocation.lat.toFixed(2)}, Lon: ${state.currentLocation.lon.toFixed(2)}`;

    const now = new Date();
    DOM.currentDateTime.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone });
    DOM.dataUpdatedTime.textContent = 'Live Data';

    DOM.conditionLabel.textContent = weatherInfo.label;
    DOM.currentTemp.textContent = formatTemp(current.temperature_2m);
    DOM.displayUnitSymbol.textContent = `°${state.unit}`;
    DOM.currentFeelsLike.textContent = `${formatTemp(current.apparent_temperature)}°`;

    if (daily?.temperature_2m_max?.length) {
      DOM.todayHigh.textContent = `${formatTemp(daily.temperature_2m_max[0])}°`;
      DOM.todayLow.textContent = `${formatTemp(daily.temperature_2m_min[0])}°`;
    }

    DOM.heroWeatherIcon.innerHTML = WeatherCodes.getWeatherIconSvg(weatherInfo.icon, 100);

    const rainChance = daily?.precipitation_probability_max?.[0] ?? 0;
    DOM.weatherSummaryText.textContent = `${weatherInfo.description}. ${rainChance > 40 ? `High chance of rain (${rainChance}%).` : 'Expect mild atmospheric conditions today.'}`;

    // 2. Hourly Forecast Carousel
    renderHourly(hourly, timezone);

    // 3. 7-Day Forecast
    renderDaily(daily, timezone);

    // 4. Metric Highlights
    renderMetrics(current, daily, timezone);
  }

  function renderHourly(hourly, timezone) {
    if (!hourly?.time?.length) return;
    const nowHour = new Date().toISOString().slice(0, 13);
    let startIdx = hourly.time.findIndex(t => t.startsWith(nowHour));
    if (startIdx < 0) startIdx = 0;

    const items = hourly.time.slice(startIdx, startIdx + 24).map((timeStr, i) => {
      const idx = startIdx + i;
      const isNow = i === 0;
      const info = WeatherCodes.getWeatherInfo(hourly.weather_code[idx], hourly.is_day[idx]);
      const rain = hourly.precipitation_probability?.[idx] || 0;

      return `
        <div class="hourly-card ${isNow ? 'is-now' : ''}">
          <span class="hourly-time">${isNow ? 'Now' : formatTime(timeStr, timezone)}</span>
          <div class="hourly-icon">${WeatherCodes.getWeatherIconSvg(info.icon, 36)}</div>
          <span class="hourly-temp">${formatTemp(hourly.temperature_2m[idx])}°</span>
          <div class="hourly-precip" style="opacity: ${rain > 5 ? 1 : 0};">💧 ${rain}%</div>
        </div>
      `;
    });

    DOM.hourlyList.innerHTML = items.join('');
  }

  function renderDaily(daily, timezone) {
    if (!daily?.time?.length) return;
    const minAll = Math.min(...daily.temperature_2m_min);
    const maxAll = Math.max(...daily.temperature_2m_max);
    const span = Math.max(1, maxAll - minAll);

    DOM.dailyList.innerHTML = daily.time.map((dateStr, idx) => {
      const min = daily.temperature_2m_min[idx];
      const max = daily.temperature_2m_max[idx];
      const info = WeatherCodes.getWeatherInfo(daily.weather_code[idx], 1);
      const left = Math.max(0, Math.min(100, ((min - minAll) / span) * 100));
      const width = Math.max(12, Math.min(100 - left, ((max - min) / span) * 100));

      return `
        <div class="daily-row">
          <div class="daily-day-group">
            <span class="daily-day-name">${getDayName(dateStr, idx, timezone)}</span>
            <span class="daily-date-sub">${dateStr.slice(5)}</span>
          </div>
          <div class="daily-icon">${WeatherCodes.getWeatherIconSvg(info.icon, 32)}</div>
          <span class="daily-condition-label">${info.label}</span>
          <div class="daily-temp-bar-wrapper">
            <span class="temp-min-text">${formatTemp(min)}°</span>
            <div class="temp-range-bar">
              <div class="temp-range-fill" style="margin-left: ${left}%; width: ${width}%;"></div>
            </div>
            <span class="temp-max-text">${formatTemp(max)}°</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMetrics(current, daily, timezone) {
    // Wind
    const speed = current.wind_speed_10m || 0;
    DOM.valWindSpeed.textContent = formatSpeed(speed);
    DOM.unitWindSpeed.textContent = getSpeedUnit();
    DOM.compassNeedle.style.transform = `rotate(${current.wind_direction_10m || 0}deg)`;
    DOM.valWindDirection.textContent = getWindDirection(current.wind_direction_10m);
    DOM.windAssessment.textContent = speed < 12 ? 'Light air' : speed < 30 ? 'Moderate breeze' : 'Strong wind';

    // Humidity
    const hum = current.relative_humidity_2m || 0;
    DOM.valHumidity.textContent = Math.round(hum);
    DOM.barHumidity.style.width = `${hum}%`;
    const dew = (current.temperature_2m || 0) - (100 - hum) / 5;
    DOM.valDewPoint.textContent = `Dew point: ${formatTemp(dew)}°${state.unit}`;

    // UV Index
    const uv = Math.max(0, current.uv_index ?? daily?.uv_index_max?.[0] ?? 0);
    DOM.valUvIndex.textContent = uv.toFixed(1);
    const uvInfo = getUvInfo(uv);
    DOM.badgeUvRisk.textContent = uvInfo.text;
    DOM.badgeUvRisk.className = `val-badge ${uvInfo.cls}`;
    DOM.barUv.style.width = `${Math.min(100, (uv / 12) * 100)}%`;
    DOM.uvAdvice.textContent = uvInfo.advice;

    // Air Quality
    const aqi = state.aqiData?.current?.us_aqi ?? 25;
    DOM.valAqi.textContent = Math.round(aqi);
    const aqiInfo = getAqiInfo(aqi);
    DOM.badgeAqi.textContent = aqiInfo.text;
    DOM.badgeAqi.className = `val-badge ${aqiInfo.cls}`;
    DOM.valPm25.textContent = state.aqiData?.current?.pm2_5?.toFixed(1) || '--';
    DOM.valPm10.textContent = state.aqiData?.current?.pm10?.toFixed(1) || '--';
    DOM.aqiDesc.textContent = aqiInfo.desc;

    // Sun Path
    if (daily?.sunrise?.[0] && daily?.sunset?.[0]) {
      DOM.valSunrise.textContent = formatTime(daily.sunrise[0], timezone);
      DOM.valSunset.textContent = formatTime(daily.sunset[0], timezone);
      const sr = new Date(daily.sunrise[0]).getTime();
      const ss = new Date(daily.sunset[0]).getTime();
      const now = Date.now();
      const pct = Math.max(0, Math.min(100, ((now - sr) / (ss - sr)) * 100));
      DOM.sunCurveIndicator.style.left = `${pct}%`;
      const diffH = Math.floor((ss - sr) / 3600000);
      const diffM = Math.round(((ss - sr) % 3600000) / 60000);
      DOM.daylightDuration.textContent = `Total daylight: ${diffH}h ${diffM}m`;
    }

    // Pressure & Rain
    const p = current.surface_pressure || 1013;
    DOM.valPressure.textContent = Math.round(p);
    DOM.barPressure.style.width = `${Math.min(100, Math.max(0, ((p - 950) / 100) * 100))}%`;
    DOM.pressureDesc.textContent = p > 1020 ? 'High pressure (Fair)' : p < 1005 ? 'Low pressure (Stormy)' : 'Normal pressure';

    const rainMm = daily?.precipitation_sum?.[0] ?? current.precipitation ?? 0;
    const rainPct = daily?.precipitation_probability_max?.[0] ?? 0;
    DOM.valPrecipitation.textContent = Number(rainMm).toFixed(1);
    DOM.valPrecipChance.textContent = `${rainPct}%`;
    DOM.precipForecastDesc.textContent = rainPct > 50 ? 'Precipitation expected' : 'Clear conditions today';

    DOM.valConditionShort.textContent = WeatherCodes.getWeatherInfo(current.weather_code, current.is_day).label;
    DOM.valCoordsDisplay.textContent = `Lat: ${state.currentLocation.lat.toFixed(2)}° • Lon: ${state.currentLocation.lon.toFixed(2)}°`;
    DOM.valDayNightIndicator.textContent = current.is_day ? '☀️ Daytime' : '🌙 Nighttime';
  }

  // Quick Chips
  function renderQuickChips() {
    DOM.quickChipsContainer.innerHTML = '';

    const gpsChip = document.createElement('button');
    gpsChip.className = `quick-chip ${state.isCurrentLocationGps ? 'active' : ''}`;
    gpsChip.innerHTML = `<span>📍 My Location</span>`;
    gpsChip.onclick = () => handleGetCurrentLocation();
    DOM.quickChipsContainer.appendChild(gpsChip);

    const list = [...state.favorites];
    state.popularDefaults.forEach(def => {
      if (!list.some(item => item.name.toLowerCase() === def.name.toLowerCase())) list.push(def);
    });

    list.slice(0, 6).forEach(loc => {
      const chip = document.createElement('button');
      chip.className = `quick-chip ${!state.isCurrentLocationGps && state.currentLocation.name === loc.name ? 'active' : ''}`;
      chip.textContent = loc.name;
      chip.onclick = () => {
        state.isCurrentLocationGps = false;
        loadWeatherData(loc.lat, loc.lon, loc);
      };
      DOM.quickChipsContainer.appendChild(chip);
    });
  }

  // Favorites
  function updateFavoriteButtonState() {
    const isFav = state.favorites.some(f => f.name.toLowerCase() === state.currentLocation.name.toLowerCase());
    DOM.btnToggleFavorite.classList.toggle('active', isFav);
    DOM.favCountBadge.textContent = state.favorites.length;
    DOM.favCountBadge.classList.toggle('hidden', state.favorites.length === 0);
  }

  function toggleFavorite() {
    const loc = state.currentLocation;
    const idx = state.favorites.findIndex(f => f.name.toLowerCase() === loc.name.toLowerCase());
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      showToast(`Removed "${loc.name}" from favorites`);
    } else {
      state.favorites.push({ name: loc.name, admin1: loc.admin1, country: loc.country, lat: loc.lat, lon: loc.lon });
      showToast(`Added "${loc.name}" to favorites ⭐`, 'success');
    }
    localStorage.setItem('weatherradar_favorites', JSON.stringify(state.favorites));
    updateFavoriteButtonState();
    renderQuickChips();
    renderFavoritesModal();
  }

  function renderFavoritesModal() {
    if (!state.favorites.length) {
      DOM.favoritesListContainer.innerHTML = '<div class="empty-state">No saved locations yet. Click the star icon to save any city!</div>';
      return;
    }
    DOM.favoritesListContainer.innerHTML = state.favorites.map((fav, i) => `
      <div class="fav-item" data-idx="${i}">
        <div class="fav-item-info">
          <span class="fav-item-name">${fav.name}</span>
          <span class="fav-item-sub">${[fav.admin1, fav.country].filter(Boolean).join(', ')}</span>
        </div>
        <button class="btn-delete-fav" data-del="${i}" title="Remove">&times;</button>
      </div>
    `).join('');

    DOM.favoritesListContainer.querySelectorAll('.fav-item').forEach(el => {
      el.onclick = (e) => {
        if (e.target.dataset.del !== undefined) return;
        const fav = state.favorites[el.dataset.idx];
        DOM.favoritesModal.classList.add('hidden');
        state.isCurrentLocationGps = false;
        loadWeatherData(fav.lat, fav.lon, fav);
      };
    });

    DOM.favoritesListContainer.querySelectorAll('.btn-delete-fav').forEach(btn => {
      btn.onclick = () => {
        state.favorites.splice(btn.dataset.del, 1);
        localStorage.setItem('weatherradar_favorites', JSON.stringify(state.favorites));
        updateFavoriteButtonState();
        renderQuickChips();
        renderFavoritesModal();
      };
    });
  }

  // Preferences
  function setUnit(unit) {
    if (state.unit === unit) return;
    state.unit = unit;
    localStorage.setItem('weatherradar_unit', unit);
    DOM.btnUnitC.classList.toggle('active', unit === 'C');
    DOM.btnUnitF.classList.toggle('active', unit === 'F');
    renderDashboard();
  }

  function setTheme(theme) {
    state.theme = theme;
    localStorage.setItem('weatherradar_theme', theme);
    DOM.body.classList.toggle('light-theme', theme === 'light');
    DOM.themeSunIcon.classList.toggle('hidden', theme === 'light');
    DOM.themeMoonIcon.classList.toggle('hidden', theme !== 'light');
  }

  // Search
  const handleSearch = debounce(async (query) => {
    if (!query || query.length < 2) {
      DOM.searchSuggestions.classList.add('hidden');
      return;
    }
    const results = await API.searchCities(query);
    if (!results.length) {
      DOM.searchSuggestions.innerHTML = '<div class="suggestion-item"><span class="suggestion-sub">No locations found</span></div>';
      DOM.searchSuggestions.classList.remove('hidden');
      return;
    }

    DOM.searchSuggestions.innerHTML = results.map((city, idx) => `
      <div class="suggestion-item" data-idx="${idx}">
        <div class="suggestion-content">
          <span class="suggestion-name">${city.name}</span>
          <span class="suggestion-sub">${[city.admin1, city.country].filter(Boolean).join(', ')}</span>
        </div>
      </div>
    `).join('');

    DOM.searchSuggestions.classList.remove('hidden');
    DOM.searchSuggestions.querySelectorAll('.suggestion-item').forEach(el => {
      el.onclick = () => {
        const item = results[el.dataset.idx];
        DOM.searchInput.value = '';
        DOM.clearSearchBtn.classList.add('hidden');
        DOM.searchSuggestions.classList.add('hidden');
        state.isCurrentLocationGps = false;
        loadWeatherData(item.latitude, item.longitude, { name: item.name, admin1: item.admin1, country: item.country, lat: item.latitude, lon: item.longitude });
      };
    });
  });

  // Event Listeners
  function initEvents() {
    DOM.searchInput.oninput = (e) => {
      DOM.clearSearchBtn.classList.toggle('hidden', !e.target.value);
      handleSearch(e.target.value);
    };

    DOM.clearSearchBtn.onclick = () => {
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.classList.add('hidden');
      DOM.searchSuggestions.classList.add('hidden');
      DOM.searchInput.focus();
    };

    document.onclick = (e) => {
      if (!e.target.closest('.search-wrapper')) DOM.searchSuggestions.classList.add('hidden');
    };

    DOM.btnLocate.onclick = handleGetCurrentLocation;
    DOM.btnUnitC.onclick = () => setUnit('C');
    DOM.btnUnitF.onclick = () => setUnit('F');
    DOM.btnThemeToggle.onclick = () => setTheme(state.theme === 'dark' ? 'light' : 'dark');
    DOM.btnToggleFavorite.onclick = toggleFavorite;

    DOM.btnFavorites.onclick = () => {
      renderFavoritesModal();
      DOM.favoritesModal.classList.remove('hidden');
    };
    DOM.btnCloseFavModal.onclick = () => DOM.favoritesModal.classList.add('hidden');
    DOM.favoritesModal.onclick = (e) => { if (e.target === DOM.favoritesModal) DOM.favoritesModal.classList.add('hidden'); };

    DOM.hourlyScrollLeft.onclick = () => DOM.hourlyList.scrollBy({ left: -260, behavior: 'smooth' });
    DOM.hourlyScrollRight.onclick = () => DOM.hourlyList.scrollBy({ left: 260, behavior: 'smooth' });
    DOM.btnErrorRetry.onclick = () => loadWeatherData(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation);

    // Keyboard Shortcuts
    document.onkeydown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (e.key === 'Escape') { DOM.searchSuggestions.classList.add('hidden'); DOM.searchInput.blur(); }
        return;
      }
      if (e.key === '/') { e.preventDefault(); DOM.searchInput.focus(); }
      else if (e.key.toLowerCase() === 'l') handleGetCurrentLocation();
      else if (e.key === 'Escape') DOM.favoritesModal.classList.add('hidden');
    };
  }

  // Initialization
  async function init() {
    setTheme(state.theme);
    setUnit(state.unit);
    initEvents();
    updateFavoriteButtonState();
    renderQuickChips();

    // Auto-detect location on load
    DOM.btnLocate.classList.add('loading');
    try {
      const loc = await API.getUserLocation();
      DOM.btnLocate.classList.remove('loading');
      state.isCurrentLocationGps = true;
      showToast(`📍 Location detected: ${loc.name || 'Local'}`, 'success');
      await loadWeatherData(loc.latitude, loc.longitude, loc.name ? loc : null);
    } catch {
      DOM.btnLocate.classList.remove('loading');
      await loadWeatherData(state.popularDefaults[0].lat, state.popularDefaults[0].lon, state.popularDefaults[0]);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
