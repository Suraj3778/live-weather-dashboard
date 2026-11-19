const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CURRENT_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "is_day",
  "precipitation",
  "weather_code",
  "wind_speed_10m"
].join(",");
const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max"
].join(",");

const elements = {
  form: document.querySelector("#search-form"),
  input: document.querySelector("#city-input"),
  button: document.querySelector("#search-button"),
  toggle: document.querySelector("#unit-toggle"),
  status: document.querySelector("#status"),
  content: document.querySelector("#weather-content"),
  city: document.querySelector("#city-name"),
  date: document.querySelector("#local-date"),
  currentIcon: document.querySelector("#current-icon"),
  temperature: document.querySelector("#current-temperature"),
  condition: document.querySelector("#current-condition"),
  feelsLike: document.querySelector("#feels-like"),
  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind"),
  precipitation: document.querySelector("#precipitation"),
  forecast: document.querySelector("#forecast-grid")
};

const weatherDescriptions = {
  0: { label: "Clear sky", day: "☀️", night: "🌙" },
  1: { label: "Mainly clear", day: "🌤️", night: "🌙" },
  2: { label: "Partly cloudy", day: "⛅", night: "☁️" },
  3: { label: "Overcast", day: "☁️", night: "☁️" },
  45: { label: "Fog", day: "🌫️", night: "🌫️" },
  48: { label: "Depositing rime fog", day: "🌫️", night: "🌫️" },
  51: { label: "Light drizzle", day: "🌦️", night: "🌧️" },
  53: { label: "Drizzle", day: "🌦️", night: "🌧️" },
  55: { label: "Dense drizzle", day: "🌧️", night: "🌧️" },
  61: { label: "Light rain", day: "🌦️", night: "🌧️" },
  63: { label: "Rain", day: "🌧️", night: "🌧️" },
  65: { label: "Heavy rain", day: "🌧️", night: "🌧️" },
  71: { label: "Light snow", day: "🌨️", night: "🌨️" },
  73: { label: "Snow", day: "🌨️", night: "🌨️" },
  75: { label: "Heavy snow", day: "❄️", night: "❄️" },
  80: { label: "Rain showers", day: "🌦️", night: "🌧️" },
  81: { label: "Rain showers", day: "🌦️", night: "🌧️" },
  82: { label: "Heavy rain showers", day: "⛈️", night: "⛈️" },
  95: { label: "Thunderstorm", day: "⛈️", night: "⛈️" },
  96: { label: "Thunderstorm with hail", day: "⛈️", night: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", day: "⛈️", night: "⛈️" }
};

let useFahrenheit = false;
let requestId = 0;
let latestWeather = null;

function getWeather(code) {
  const weather = weatherDescriptions[code];
  return weather || { label: "Conditions unavailable", day: "🌡️", night: "🌡️" };
}

function convertedTemperature(celsius) {
  if (!Number.isFinite(celsius)) return null;
  return useFahrenheit ? (celsius * 9) / 5 + 32 : celsius;
}

function formatTemperature(value) {
  const converted = convertedTemperature(value);
  return converted === null ? "—" : `${Math.round(converted)}°`;
}

function setStatus(message, isLoading = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("loading", isLoading);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}. Please try again.`);
  }
  return response.json();
}

async function loadWeather(city) {
  const thisRequest = ++requestId;
  elements.button.disabled = true;
  elements.content.hidden = true;
  setStatus("Finding your forecast…", true);

  try {
    const geocodeUrl = new URL(GEOCODING_URL);
    geocodeUrl.search = new URLSearchParams({
      name: city,
      count: "1",
      language: "en",
      format: "json"
    });
    const places = await fetchJson(geocodeUrl);
    const place = places.results && places.results[0];
    if (!place) {
      throw new Error(`We couldn't find “${city}”. Check the spelling and try again.`);
    }

    const forecastUrl = new URL(FORECAST_URL);
    forecastUrl.search = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: CURRENT_FIELDS,
      daily: DAILY_FIELDS,
      forecast_days: "6",
      timezone: "auto"
    });
    const weatherData = await fetchJson(forecastUrl);
    if (thisRequest !== requestId) return;
    latestWeather = { place, data: weatherData };
    renderWeather(place, weatherData);
    setStatus("");
    elements.content.hidden = false;
  } catch (error) {
    if (thisRequest !== requestId) return;
    setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again.");
  } finally {
    if (thisRequest === requestId) elements.button.disabled = false;
  }
}

function formatLocation(place) {
  return [place.name, place.admin1 && place.admin1 !== place.name ? place.admin1 : null, place.country]
    .filter(Boolean)
    .filter((name, index, list) => list.indexOf(name) === index)
    .join(", ");
}

function renderWeather(place, data) {
  const current = data.current || {};
  const daily = data.daily || {};
  const currentWeather = getWeather(current.weather_code);
  elements.city.textContent = formatLocation(place) || "Unknown location";
  elements.date.textContent = current.time
    ? new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" })
      .format(new Date(`${current.time.slice(0, 10)}T12:00:00`))
    : "Local conditions";
  elements.currentIcon.textContent = currentWeather[current.is_day === 0 ? "night" : "day"];
  elements.temperature.innerHTML = `${formatTemperature(current.temperature_2m).replace("°", "")}<span>°${useFahrenheit ? "F" : "C"}</span>`;
  elements.condition.textContent = currentWeather.label;
  elements.feelsLike.textContent = `${formatTemperature(current.apparent_temperature)}${useFahrenheit ? "F" : "C"}`;
  elements.humidity.textContent = Number.isFinite(current.relative_humidity_2m) ? `${Math.round(current.relative_humidity_2m)}%` : "—";
  elements.wind.textContent = Number.isFinite(current.wind_speed_10m) ? `${Math.round(current.wind_speed_10m)} km/h` : "—";
  elements.precipitation.textContent = Number.isFinite(current.precipitation) ? `${current.precipitation} mm` : "—";
  renderForecast(daily);
}

function renderForecast(daily) {
  elements.forecast.replaceChildren();
  const dates = daily.time || [];
  for (let index = 1; index < Math.min(dates.length, 6); index += 1) {
    const weather = getWeather(daily.weather_code && daily.weather_code[index]);
    const date = new Date(`${dates[index]}T12:00:00`);
    const day = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
    const probability = daily.precipitation_probability_max && daily.precipitation_probability_max[index];
    const card = document.createElement("article");
    card.className = "forecast-card";
    card.style.animationDelay = `${(index - 1) * 55}ms`;
    card.innerHTML = `
      <p class="forecast-day">${day}</p>
      <span class="forecast-icon" aria-hidden="true">${weather.day}</span>
      <p class="forecast-condition">${weather.label}</p>
      <div class="forecast-temps">
        <span class="forecast-high">${formatTemperature(daily.temperature_2m_max && daily.temperature_2m_max[index])}</span>
        <span class="forecast-low">${formatTemperature(daily.temperature_2m_min && daily.temperature_2m_min[index])}</span>
      </div>
      <p class="precip-probability">${Number.isFinite(probability) ? `💧 ${probability}%` : "&nbsp;"}</p>
    `;
    elements.forecast.append(card);
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = elements.input.value.trim();
  if (!city) {
    elements.input.focus();
    return;
  }
  loadWeather(city);
});

elements.toggle.addEventListener("click", () => {
  useFahrenheit = !useFahrenheit;
  elements.toggle.setAttribute("aria-label", `Switch to ${useFahrenheit ? "Celsius" : "Fahrenheit"}`);
  elements.toggle.innerHTML = useFahrenheit
    ? '<span>°C</span> / <span class="selected">°F</span>'
    : '<span class="selected">°C</span> / <span>°F</span>';
  if (!elements.content.hidden && latestWeather) renderWeather(latestWeather.place, latestWeather.data);
});

loadWeather("Prayagraj");
