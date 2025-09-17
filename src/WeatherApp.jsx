import { useState } from "react";
import "./index.css";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
  const fetchCoordinates = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`);
      const data = await response.json();

      if (!data[0]) {
        throw new Error(data.error?.message || "City not found!");
      }

      return {
        latitude: data[0].lat,
        longitude: data[0].lon,
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error(error.message || "Failed to fetch coordinates");
    }
  };

 
  const getWeatherIcon = (temperature, weatherCode) => {
    if (weatherCode !== undefined) {
      if (weatherCode >= 0 && weatherCode <= 3) {
        return "snow"; // Sun 
      } else if (weatherCode >= 45 && weatherCode <= 48) {
        return "cloud"; // Clouds
      } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || (weatherCode >= 95 && weatherCode <= 99)) {
        return "rain"; // Light rain or rain
      } else if ((weatherCode >= 71 && weatherCode <= 77) ||  (weatherCode >= 85 && weatherCode <= 86)) {
        return "snow"; // Snow
      }
   
    }
    
    
    return temperature > 20 ? "sun" : "cloud";
  };


  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const coords = await fetchCoordinates();
      if (!coords) return;

      const { latitude, longitude } = coords;

      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.current_weather) {
        throw new Error("Weather data not available!");
      }

      const currentIndex = 0; 

      setWeather({
        temp: Math.round(data.current_weather.temperature),
        wind: Math.round(data.current_weather.windspeed),
        humidity: Math.round(data.hourly.relativehumidity_2m[currentIndex]),
        feelsLike: Math.round(data.hourly.apparent_temperature[currentIndex]),
        description: "Current Weather",
        icon: getWeatherIcon(
          data.current_weather.temperature, 
          data.current_weather.weathercode
        ),
      });
    } catch (error) {
      console.error("Weather fetch error:", error);
      setError(error.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case "cloud":
        return (
          <svg className="weather-icon" viewBox="0 0 64 64">
            <path d="M48 24a12 12 0 00-24-2 10 10 0 10-6 18h30a10 10 0 00.1-16z" />
          </svg>
        );
      case "sun":
        return (
          <svg className="weather-icon" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="14" />
            <g stroke="currentColor" strokeWidth="2">
              <line x1="32" y1="10" x2="32" y2="2" />
              <line x1="32" y1="54" x2="32" y2="62" />
              <line x1="10" y1="32" x2="2" y2="32" />
              <line x1="54" y1="32" x2="62" y2="32" />
              <line x1="15" y1="15" x2="9" y2="9" />
              <line x1="49" y1="49" x2="55" y2="55" />
              <line x1="15" y1="49" x2="9" y2="55" />
              <line x1="49" y1="15" x2="55" y2="9" />
            </g>
          </svg>
        );
        case "snow":
        return (
         <svg className="weather-icon" viewBox="0 0 64 64">
            <g stroke="#58a7f5ff" strokeWidth="2">
                <line x1="32" y1="8" x2="32" y2="56" />
                <line x1="8" y1="32" x2="56" y2="32" />
                <line x1="16" y1="16" x2="48" y2="48" />
                <line x1="48" y1="16" x2="16" y2="48" />
                <circle cx="32" cy="32" r="4" fill="rgba(241,241,241,1)" />
            </g>

            <g stroke="#1e90ff" strokeWidth="1" transform="translate(-14,-6) scale(0.5)">
                <line x1="32" y1="8" x2="32" y2="56" />
                <line x1="8" y1="32" x2="56" y2="32" />
                <line x1="16" y1="16" x2="48" y2="48" />
                <line x1="48" y1="16" x2="16" y2="48" />
                <circle cx="32" cy="32" r="4" fill="rgba(241,241,241,1)" />
            </g>

            <g stroke="#1e90ff" strokeWidth="0.5" transform="translate(-20,40) scale(0.45)">
                <line x1="32" y1="8" x2="32" y2="56" />
                <line x1="8" y1="32" x2="56" y2="32" />
                <line x1="16" y1="16" x2="48" y2="48" />
                <line x1="48" y1="16" x2="16" y2="48" />
                <circle cx="32" cy="32" r="4" fill="rgba(241,241,241,1)" />
            </g>
            </svg>

        );
        
      case "rain":
        return (
          <svg className="weather-icon" viewBox="0 0 64 64">
            <path d="M20 30h24a10 10 0 10-6-18 12 12 0 00-18 12H20z" />
            <line x1="24" y1="42" x2="24" y2="50" stroke="#1e90ff" strokeWidth="2" />
            <line x1="32" y1="42" x2="32" y2="50" stroke="#1e90ff" strokeWidth="2" />
            <line x1="40" y1="42" x2="40" y2="50" stroke="#1e90ff" strokeWidth="2" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchWeather();
    }
  };

  return (
    <div className="weather-app">
      <h1>Weather App</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Loading weather data...</div>}

      {weather && !loading && (
        <div className="weather-card">
          {renderIcon(weather.icon)}
          <h2>{weather.temp}°C</h2>
          <p>{weather.description}</p>
          <div className="weather-details">
            <div>
              <strong>{weather.humidity}%</strong>
              <p>Humidity</p>
            </div>
            <div>
              <strong>{weather.wind} km/h</strong>
              <p>Wind</p>
            </div>
            <div>
              <strong>{weather.feelsLike}°C</strong>
              <p>Feels Like</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}