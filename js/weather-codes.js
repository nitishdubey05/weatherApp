/**
 * Weather Radar — Weather Codes & SVG Icon Provider
 * Maps WMO weather codes to condition descriptions, themes, and clean vector SVG icons.
 */

// Category definitions for WMO codes
const WEATHER_CATEGORIES = [
  { codes: [0], desc: "Clear sky", theme: "clear", day: "Sunny", night: "Clear Night", iconDay: "sun", iconNight: "moon" },
  { codes: [1], desc: "Mainly clear", theme: "clear", day: "Mainly Sunny", night: "Mainly Clear", iconDay: "sun-cloud", iconNight: "moon-cloud" },
  { codes: [2], desc: "Partly cloudy", theme: "cloudy", day: "Partly Cloudy", night: "Partly Cloudy", iconDay: "cloud-sun", iconNight: "cloud-moon" },
  { codes: [3], desc: "Overcast", theme: "overcast", day: "Overcast", night: "Overcast", iconDay: "clouds", iconNight: "clouds" },
  { codes: [45, 48], desc: "Fog", theme: "fog", day: "Foggy", night: "Foggy", iconDay: "fog", iconNight: "fog" },
  { codes: [51, 53, 55], desc: "Drizzle", theme: "rainy", day: "Drizzle", night: "Drizzle", iconDay: "drizzle", iconNight: "drizzle" },
  { codes: [56, 57, 66, 67], desc: "Freezing rain", theme: "snowy", day: "Freezing Rain", night: "Freezing Rain", iconDay: "sleet", iconNight: "sleet" },
  { codes: [61, 63, 65], desc: "Rain", theme: "rainy", day: "Rain", night: "Rain", iconDay: "rain", iconNight: "rain" },
  { codes: [71, 73, 75, 77], desc: "Snow fall", theme: "snowy", day: "Snow", night: "Snow", iconDay: "snow", iconNight: "snow" },
  { codes: [80, 81, 82], desc: "Rain showers", theme: "rainy", day: "Showers", night: "Showers", iconDay: "rain-sun", iconNight: "rain-moon" },
  { codes: [85, 86], desc: "Snow showers", theme: "snowy", day: "Snow Showers", night: "Snow Showers", iconDay: "snow", iconNight: "snow" },
  { codes: [95, 96, 99], desc: "Thunderstorm", theme: "stormy", day: "Thunderstorm", night: "Thunderstorm", iconDay: "thunder", iconNight: "thunder" }
];

/**
 * Returns weather metadata for a WMO code.
 */
function getWeatherInfo(code, isDay = 1) {
  const match = WEATHER_CATEGORIES.find(c => c.codes.includes(code)) || {
    desc: "Cloudy",
    theme: "cloudy",
    day: "Cloudy",
    night: "Cloudy",
    iconDay: "clouds",
    iconNight: "clouds"
  };

  return {
    code,
    description: match.desc,
    label: isDay ? match.day : match.night,
    icon: isDay ? match.iconDay : match.iconNight,
    theme: `${match.theme}-${isDay ? "day" : "night"}`
  };
}

/**
 * Clean, lightweight, self-contained SVG icon templates.
 */
function getWeatherIconSvg(iconName, size = 48) {
  const svgOpen = `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" class="weather-icon-svg">`;
  const svgClose = `</svg>`;

  const ICONS = {
    sun: `
      <circle cx="24" cy="24" r="10" fill="#FBBF24"/>
      <g stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round">
        <line x1="24" y1="4" x2="24" y2="8"/><line x1="24" y1="40" x2="24" y2="44"/>
        <line x1="4" y1="24" x2="8" y2="24"/><line x1="40" y1="24" x2="44" y2="24"/>
        <line x1="9.8" y1="9.8" x2="12.7" y2="12.7"/><line x1="35.3" y1="35.3" x2="38.2" y2="38.2"/>
        <line x1="9.8" y1="38.2" x2="12.7" y2="35.3"/><line x1="35.3" y1="12.7" x2="38.2" y2="9.8"/>
      </g>`,
    moon: `
      <path d="M33 26.5C32.8 33.2 27.2 38.5 20.4 38.5C16.2 38.5 12.5 36.4 10.2 33.2C9.5 32.2 10.1 30.8 11.3 30.6C18.6 29.3 23.5 22.8 21.6 15.6C21.3 14.4 22.3 13.3 23.5 13.6C29.2 15.3 33.2 20.4 33 26.5Z" fill="#E2E8F0" stroke="#93C5FD" stroke-width="1.5"/>
      <circle cx="36" cy="14" r="1.5" fill="#E2E8F0"/><circle cx="39" cy="22" r="1" fill="#E2E8F0"/>`,
    "sun-cloud": `
      <circle cx="20" cy="18" r="8" fill="#FBBF24"/>
      <path d="M36 34H18c-3.3 0-6-2.7-6-6 0-2.9 2.1-5.3 4.9-5.9C17.6 17.5 21.5 14 26.2 14c5.3 0 9.6 4.1 9.9 9.4 2.8.6 4.9 3.1 4.9 6.1 0 2.5-2.2 4.5-5 4.5z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5"/>`,
    "cloud-sun": `
      <circle cx="18" cy="16" r="8" fill="#FBBF24"/>
      <path d="M37 36H16c-3.3 0-6-2.7-6-6 0-2.9 2.1-5.3 4.9-5.9C15.6 19.5 19.5 16 24.2 16c5.3 0 9.6 4.1 9.9 9.4 2.8.6 4.9 3.1 4.9 6.1 0 2.5-2 4.5-2 4.5z" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5"/>`,
    "cloud-moon": `
      <path d="M26 12c-1 3.5.5 7 3.5 8.5-.5 1-1.3 1.8-2.3 2.5-.7-3-3.7-5-7.2-5-.8 0-1.5.2-2.2.6C19 14.8 22.5 12 26 12z" fill="#F1F5F9"/>
      <path d="M37 36H16c-3.3 0-6-2.7-6-6 0-2.9 2.1-5.3 4.9-5.9C15.6 19.5 19.5 16 24.2 16c5.3 0 9.6 4.1 9.9 9.4 2.8.6 4.9 3.1 4.9 6.1 0 2.5-2 4.5-2 4.5z" fill="#64748B" stroke="#475569" stroke-width="1.5"/>`,
    clouds: `
      <path d="M30 22c0-3-2.5-5.5-5.5-5.5-2.5 0-4.7 1.8-5.3 4.2-.6-.4-1.3-.7-2.1-.7-2.5 0-4.5 2-4.5 4.5 0 .3 0 .7.1 1-1.6.6-2.7 2.1-2.7 3.9 0 2.3 1.8 4.1 4.1 4.1H29c2.5 0 4.5-2 4.5-4.5 0-2.3-1.6-4.1-3.8-4.5.2-.5.3-1 .3-1.5z" fill="#94A3B8" opacity="0.6"/>
      <path d="M38 36H17c-2.8 0-5-2.2-5-5 0-2.4 1.7-4.5 4.1-4.9.6-3.9 3.9-7.1 7.9-7.1 4.4 0 8 3.4 8.3 7.8 2.4.5 4.2 2.7 4.2 5.2 0 .4-.1.7-.2 1.1 1 .7 1.7 1.7 1.7 2.9z" fill="#CBD5E1" stroke="#64748B" stroke-width="1.5"/>`,
    fog: `
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <line x1="10" y1="16" x2="38" y2="16"/><line x1="6" y1="22" x2="42" y2="22"/>
        <line x1="10" y1="28" x2="38" y2="28"/><line x1="14" y1="34" x2="34" y2="34"/>
      </g>`,
    drizzle: `
      <path d="M38 27H16c-3.3 0-6-2.7-6-6 0-2.9 2.1-5.3 4.9-5.9C15.6 10.5 19.5 7 24.2 7c5.3 0 9.6 4.1 9.9 9.4 2.8.6 4.9 3.1 4.9 6.1 0 2.5-2 4.5-1 4.5z" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.2"/>
      <g stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="32" x2="16" y2="37"/><line x1="26" y1="32" x2="24" y2="37"/><line x1="34" y1="32" x2="32" y2="37"/></g>`,
    rain: `
      <path d="M38 25H16c-3.3 0-6-2.7-6-6 0-2.9 2.1-5.3 4.9-5.9C15.6 8.5 19.5 5 24.2 5c5.3 0 9.6 4.1 9.9 9.4 2.8.6 4.9 3.1 4.9 6.1 0 2.5-2 4.5-1 4.5z" fill="#94A3B8" stroke="#64748B" stroke-width="1.5"/>
      <g stroke="#0EA5E9" stroke-width="3" stroke-linecap="round"><line x1="17" y1="31" x2="13" y2="41"/><line x1="25" y1="31" x2="21" y2="41"/><line x1="33" y1="31" x2="29" y2="41"/></g>`,
    "rain-sun": `
      <circle cx="17" cy="14" r="7" fill="#FBBF24"/>
      <path d="M38 28H18c-3 0-5.5-2.5-5.5-5.5 0-2.7 1.9-4.9 4.5-5.4.7-4.3 4.2-7.6 8.5-7.6 4.9 0 8.8 3.8 9.1 8.7 2.5.5 4.4 2.8 4.4 5.6 0 2.4-1.8 4.2-1 4.2z" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.2"/>
      <g stroke="#38BDF8" stroke-width="2.6" stroke-linecap="round"><line x1="20" y1="33" x2="17" y2="41"/><line x1="28" y1="33" x2="25" y2="41"/><line x1="36" y1="33" x2="33" y2="41"/></g>`,
    "rain-moon": `
      <path d="M22 10c-.8 3 .5 6 3 7.5-.5 1-1.2 1.7-2 2.3-.7-2.6-3.2-4.3-6-4.3-.8 0-1.5.1-2.2.5 1-3.4 3.9-6 7.2-6z" fill="#CBD5E1"/>
      <path d="M38 28H18c-3 0-5.5-2.5-5.5-5.5 0-2.7 1.9-4.9 4.5-5.4.7-4.3 4.2-7.6 8.5-7.6 4.9 0 8.8 3.8 9.1 8.7 2.5.5 4.4 2.8 4.4 5.6 0 2.4-1.8 4.2-1 4.2z" fill="#64748B" stroke="#475569" stroke-width="1.2"/>
      <g stroke="#38BDF8" stroke-width="2.6" stroke-linecap="round"><line x1="20" y1="33" x2="17" y2="41"/><line x1="28" y1="33" x2="25" y2="41"/><line x1="36" y1="33" x2="33" y2="41"/></g>`,
    snow: `
      <path d="M38 25H16c-3.3 0-6-2.7-6-6 0-2.9 2.1-5.3 4.9-5.9C15.6 8.5 19.5 5 24.2 5c5.3 0 9.6 4.1 9.9 9.4 2.8.6 4.9 3.1 4.9 6.1 0 2.5-2 4.5-1 4.5z" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.2"/>
      <g fill="#93C5FD"><circle cx="18" cy="33" r="2.2"/><circle cx="26" cy="33" r="2.2"/><circle cx="34" cy="33" r="2.2"/><circle cx="22" cy="40" r="2"/><circle cx="30" cy="40" r="2"/></g>`,
    sleet: `
      <path d="M38 25H16c-3.3 0-6-2.7-6-6 0-2.9 2.1-5.3 4.9-5.9C15.6 8.5 19.5 5 24.2 5c5.3 0 9.6 4.1 9.9 9.4 2.8.6 4.9 3.1 4.9 6.1 0 2.5-2 4.5-1 4.5z" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.2"/>
      <line x1="17" y1="31" x2="14" y2="39" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="24" cy="35" r="2.5" fill="#E0F2FE"/><circle cx="34" cy="35" r="2.5" fill="#E0F2FE"/>`,
    thunder: `
      <path d="M38 23H16c-3.3 0-6-2.7-6-6 0-2.9 2.1-5.3 4.9-5.9C15.6 6.5 19.5 3 24.2 3c5.3 0 9.6 4.1 9.9 9.4 2.8.6 4.9 3.1 4.9 6.1 0 2.5-2 4.5-1 4.5z" fill="#334155" stroke="#1E293B" stroke-width="1.5"/>
      <polygon points="26,23 20,32 25,32 21,43 31,30 25,30 29,23" fill="#FACC15"/>`
  };

  const innerSvg = ICONS[iconName] || ICONS.clouds;
  return `${svgOpen}${innerSvg}${svgClose}`;
}

window.WeatherCodes = {
  getWeatherInfo,
  getWeatherIconSvg
};
