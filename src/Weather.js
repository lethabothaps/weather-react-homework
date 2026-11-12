import React, { useEffect, useState } from "react";

const weatherDescription = (code) => {
  if (code === 0) return "clear sky";
  if ([1, 2].includes(code)) return "partly cloudy";
  if (code === 3) return "overcast";
  if ([45, 48].includes(code)) return "foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain showers";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "thunderstorms";
  return "cloudy";
};

const weatherIcon = (code) => {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3, 45, 48].includes(code)) return "☁️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌦️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "☁️";
};

function Weather() {
  const [city, setCity] = useState("Johannesburg");
  const [searchText, setSearchText] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchCity = async (cityName) => {
    const trimmedCity = cityName.trim();
    if (!trimmedCity) {
      setError("Please enter a city.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=1&language=en&format=json`
      );
      if (!geoResponse.ok) throw new Error("Could not search for that city.");
      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) throw new Error("City not found. Please try another city.");

      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
      );
      if (!forecastResponse.ok) throw new Error("Weather information is unavailable right now.");
      const forecastData = await forecastResponse.json();

      setCity(place.name);
      setWeather({
        temperature: Math.round(forecastData.current.temperature_2m),
        humidity: forecastData.current.relative_humidity_2m,
        wind: forecastData.current.wind_speed_10m,
        code: forecastData.current.weather_code,
        time: forecastData.current.time,
      });

      const days = forecastData.daily.time.map((date, index) => ({
        date,
        code: forecastData.daily.weather_code[index],
        max: Math.round(forecastData.daily.temperature_2m_max[index]),
        min: Math.round(forecastData.daily.temperature_2m_min[index]),
      }));
      setForecast(days);
      setSearchText("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchCity("Johannesburg");
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    searchCity(searchText);
  };

  const formattedTime = weather?.time
    ? new Date(weather.time).toLocaleString("en-US", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  return (
    <section className="weather-card">

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Enter a city..."
          aria-label="Enter a city"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {weather && (
        <>
          <div className="current-weather">
            <div className="weather-details">
              <h1>{city}</h1>
              <p className="description">
                {formattedTime}, {weatherDescription(weather.code)}
              </p>
              <p className="weather-stats">
                Humidity: <span>{weather.humidity}%</span>, Wind: <span>{weather.wind} km/h</span>
              </p>
            </div>
            <div className="temperature">
              <span className="current-icon" aria-label={weatherDescription(weather.code)}>
                {weatherIcon(weather.code)}
              </span>
              <span className="degrees">{weather.temperature}</span>
              <span className="unit">°C</span>
            </div>
          </div>

          <div className="forecast">
            {forecast.map((day) => (
              <div className="forecast-day" key={day.date}>
                <p className="day-name">
                  {new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <span className="forecast-icon" aria-label={weatherDescription(day.code)}>
                  {weatherIcon(day.code)}
                </span>
                <p className="forecast-temperatures">
                  <strong>{day.max}°</strong> <span>{day.min}°</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <footer>
        This project was coded by <a href="https://www.linkedin.com/in/lethabo-thapedi-411910178/" target="_blank" rel="noreferrer" className="linkedin-link">Lethabo Thapedi</a> and is open-sourced on <a href="https://github.com/lethabothaps/weather-react-homework" target="_blank" rel="noreferrer">GitHub</a> and hosted on <a href="https://extraordinary-faloodeh-d0fc0d.netlify.app" target="_blank" rel="noreferrer">Netlify</a>.
      </footer>
    </section>
  );
}

export default Weather;

