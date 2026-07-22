export type WeatherProviderType = 'openweather' | 'weatherapi' | 'accuweather' | 'openmeteo';

export interface WeatherData {
  temp: number;
  condition: 'despejado' | 'nublado' | 'lluvia' | 'tormenta';
  multiplier: number;
  description: string;
  provider: string;
}

export class WeatherProvider {
  static async getLiveWeather(providerType: WeatherProviderType = 'openmeteo'): Promise<WeatherData> {
    let temp = 21.0;
    let condition: 'despejado' | 'nublado' | 'lluvia' | 'tormenta' = 'despejado';
    let multiplier = 1.0;
    let description = "Condiciones espectaculares en Buenos Aires. Tarifas base.";
    let provider = "Open-Meteo (Key-less Live)";

    const openWeatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (providerType === 'openweather' && openWeatherKey) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Buenos%20Aires,AR&units=metric&appid=${openWeatherKey}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          temp = data.main.temp;
          const weatherMain = data.weather[0].main.toLowerCase();
          provider = "OpenWeather API";
          if (weatherMain.includes("thunderstorm")) {
            condition = "tormenta";
          } else if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
            condition = "lluvia";
          } else if (weatherMain.includes("cloud")) {
            condition = "nublado";
          } else {
            condition = "despejado";
          }
        }
      } catch (err) {
        console.warn("[WeatherProvider] OpenWeather API call failed, falling back to OpenMeteo:", err);
      }
    }

    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=-34.603722&longitude=-58.381592&current=temperature_2m,weather_code";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        temp = data.current.temperature_2m;
        const code = data.current.weather_code;
        provider = "Open-Meteo (Live API)";
        if ([95, 96, 99].includes(code)) {
          condition = "tormenta";
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
          condition = "lluvia";
        } else if ([1, 2, 3, 45, 48, 71, 73, 75, 77, 85, 86].includes(code)) {
          condition = "nublado";
        } else {
          condition = "despejado";
        }
      }
    } catch (err) {
      console.warn("[WeatherProvider] Open-Meteo API failed, returning offline prediction:", err);
    }

    if (condition === "nublado") {
      multiplier = 1.05;
      description = "Nublado. Demanda estable de almuerzos B2B.";
    } else if (condition === "lluvia") {
      multiplier = 1.25;
      description = "Lluvia persistente de última hora. Multiplicador de tarifa clima +25% activo para conductores.";
    } else if (condition === "tormenta") {
      multiplier = 1.40;
      description = "Tormenta eléctrica severa. Multiplicador de tarifa subió a 1.40x. Tiempos estimados incrementan +12 min.";
    }

    return {
      temp,
      condition,
      multiplier,
      description,
      provider
    };
  }
}
