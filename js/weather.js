/**
 * Module météo pour ST8
 * Fournit les informations météorologiques en temps réel
 */

class WeatherModule {
  constructor() {
    // Using free OpenWeather API (no key required for basic features)
    // For production, you should use your own API key
    this.apiKey = 'demo'; // Replace with actual API key if needed
    this.city = 'Paris'; // Default city
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Get current weather data
   */
  async getCurrentWeather() {
    // Check cache first
    if (this.cache && this.cacheTime && (Date.now() - this.cacheTime) < this.cacheDuration) {
      return this.cache;
    }

    try {
      // Using wttr.in as a free alternative (no API key required)
      const response = await fetch(`https://wttr.in/${this.city}?format=j1`);
      if (!response.ok) {
        throw new Error('Weather API error');
      }
      
      const data = await response.json();
      const current = data.current_condition[0];
      const today = data.weather[0];
      
      // Transform to our format
      const weatherData = {
        temp: Math.round(parseFloat(current.temp_C)),
        feelsLike: Math.round(parseFloat(current.FeelsLikeC)),
        description: current.weatherDesc[0].value,
        icon: this.getWeatherIcon(current.weatherCode),
        humidity: current.humidity,
        windSpeed: Math.round(parseFloat(current.windspeedKmph)),
        windDir: current.winddir16Point,
        pressure: current.pressure,
        visibility: Math.round(parseFloat(current.visibility)),
        cloudCover: current.cloudcover,
        uvIndex: current.uvIndex,
        maxTemp: Math.round(parseFloat(today.maxtempC)),
        minTemp: Math.round(parseFloat(today.mintempC)),
        sunrise: today.astronomy[0].sunrise,
        sunset: today.astronomy[0].sunset,
        city: this.city,
        lastUpdate: new Date().toLocaleString('fr-FR')
      };

      // Cache the result
      this.cache = weatherData;
      this.cacheTime = Date.now();

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Return mock data as fallback
      return this.getMockWeather();
    }
  }

  /**
   * Get weather forecast for the next days
   */
  async getForecast(days = 5) {
    try {
      const response = await fetch(`https://wttr.in/${this.city}?format=j1`);
      if (!response.ok) {
        throw new Error('Weather API error');
      }
      
      const data = await response.json();
      const forecast = data.weather.slice(0, days).map(day => ({
        date: day.date,
        maxTemp: Math.round(parseFloat(day.maxtempC)),
        minTemp: Math.round(parseFloat(day.mintempC)),
        avgTemp: Math.round(parseFloat(day.avgtempC)),
        description: day.hourly[4].weatherDesc[0].value, // Midday weather
        icon: this.getWeatherIcon(day.hourly[4].weatherCode),
        chanceOfRain: day.hourly[4].chanceofrain,
        chanceOfSnow: day.hourly[4].chanceofsnow,
        humidity: day.hourly[4].humidity,
        windSpeed: Math.round(parseFloat(day.hourly[4].windspeedKmph))
      }));

      return forecast;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return this.getMockForecast(days);
    }
  }

  /**
   * Map weather code to icon
   */
  getWeatherIcon(code) {
    const weatherCode = parseInt(code);
    
    // Weather codes from wttr.in
    if (weatherCode === 113) return '☀️'; // Sunny
    if (weatherCode === 116) return '⛅'; // Partly cloudy
    if (weatherCode === 119) return '☁️'; // Cloudy
    if (weatherCode === 122) return '☁️'; // Overcast
    if (weatherCode === 143 || weatherCode === 248 || weatherCode === 260) return '🌫️'; // Fog
    if (weatherCode >= 176 && weatherCode <= 182) return '🌦️'; // Patchy rain
    if (weatherCode >= 185 && weatherCode <= 199) return '🌧️'; // Rain
    if (weatherCode >= 200 && weatherCode <= 232) return '⛈️'; // Thunder
    if (weatherCode >= 227 && weatherCode <= 284) return '🌨️'; // Snow
    if (weatherCode >= 293 && weatherCode <= 299) return '🌧️'; // Light rain
    if (weatherCode >= 302 && weatherCode <= 359) return '🌧️'; // Heavy rain
    if (weatherCode >= 362 && weatherCode <= 395) return '🌨️'; // Snow/sleet
    
    return '🌤️'; // Default
  }

  /**
   * Get mock weather data (fallback)
   */
  getMockWeather() {
    return {
      temp: 15,
      feelsLike: 13,
      description: 'Partiellement nuageux',
      icon: '⛅',
      humidity: 65,
      windSpeed: 12,
      windDir: 'NO',
      pressure: 1013,
      visibility: 10,
      cloudCover: 40,
      uvIndex: 3,
      maxTemp: 18,
      minTemp: 11,
      sunrise: '07:30',
      sunset: '18:45',
      city: this.city,
      lastUpdate: new Date().toLocaleString('fr-FR')
    };
  }

  /**
   * Get mock forecast data (fallback)
   */
  getMockForecast(days = 5) {
    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        maxTemp: 15 + Math.floor(Math.random() * 8),
        minTemp: 8 + Math.floor(Math.random() * 5),
        avgTemp: 12 + Math.floor(Math.random() * 6),
        description: i % 2 === 0 ? 'Partiellement nuageux' : 'Ensoleillé',
        icon: i % 2 === 0 ? '⛅' : '☀️',
        chanceOfRain: Math.floor(Math.random() * 40),
        chanceOfSnow: 0,
        humidity: 60 + Math.floor(Math.random() * 20),
        windSpeed: 10 + Math.floor(Math.random() * 10)
      });
    }
    
    return forecast;
  }

  /**
   * Render weather widget HTML
   */
  async renderWidget(compact = false) {
    const weather = await this.getCurrentWeather();
    
    if (compact) {
      return `
        <div class="weather-widget compact">
          <div class="weather-icon">${weather.icon}</div>
          <div class="weather-temp">${weather.temp}°C</div>
          <div class="weather-desc">${weather.description}</div>
        </div>
      `;
    }
    
    return `
      <div class="weather-widget">
        <div class="weather-header">
          <h3>🌤️ Météo ${weather.city}</h3>
          <span class="weather-update">${weather.lastUpdate}</span>
        </div>
        <div class="weather-main">
          <div class="weather-icon-large">${weather.icon}</div>
          <div class="weather-temp-large">${weather.temp}°C</div>
          <div class="weather-feels-like">Ressenti ${weather.feelsLike}°C</div>
          <div class="weather-description">${weather.description}</div>
        </div>
        <div class="weather-details">
          <div class="weather-detail">
            <span class="detail-icon">💧</span>
            <span class="detail-label">Humidité</span>
            <span class="detail-value">${weather.humidity}%</span>
          </div>
          <div class="weather-detail">
            <span class="detail-icon">💨</span>
            <span class="detail-label">Vent</span>
            <span class="detail-value">${weather.windSpeed} km/h ${weather.windDir}</span>
          </div>
          <div class="weather-detail">
            <span class="detail-icon">🌡️</span>
            <span class="detail-label">Min/Max</span>
            <span class="detail-value">${weather.minTemp}° / ${weather.maxTemp}°</span>
          </div>
          <div class="weather-detail">
            <span class="detail-icon">🌅</span>
            <span class="detail-label">Lever/Coucher</span>
            <span class="detail-value">${weather.sunrise} / ${weather.sunset}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render forecast widget HTML
   */
  async renderForecast(days = 5) {
    const forecast = await this.getForecast(days);
    
    const forecastItems = forecast.map(day => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dayDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      
      return `
        <div class="forecast-day">
          <div class="forecast-date">
            <div class="forecast-day-name">${dayName}</div>
            <div class="forecast-day-date">${dayDate}</div>
          </div>
          <div class="forecast-icon">${day.icon}</div>
          <div class="forecast-temps">
            <span class="forecast-max">${day.maxTemp}°</span>
            <span class="forecast-min">${day.minTemp}°</span>
          </div>
          <div class="forecast-rain">💧 ${day.chanceOfRain}%</div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="weather-forecast">
        <h3>📅 Prévisions ${days} jours</h3>
        <div class="forecast-grid">
          ${forecastItems}
        </div>
      </div>
    `;
  }

  /**
   * Initialize weather widget on page
   */
  async init(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Weather container #${containerId} not found`);
      return;
    }

    const showForecast = options.forecast !== false;
    const compact = options.compact === true;
    const forecastDays = options.forecastDays || 5;

    let html = await this.renderWidget(compact);
    
    if (showForecast && !compact) {
      html += await this.renderForecast(forecastDays);
    }

    container.innerHTML = html;
  }
}

// Create global instance
window.WeatherModule = WeatherModule;
window.weather = new WeatherModule();
