"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useDataCache } from '@/lib/DataCacheContext';
import { 
  fetchWeatherData, 
  getCurrentLocation, 
  getWeatherDescription, 
  getAgricultureInsights,
  type WeatherData,
  type LocationData
} from '@/lib/weatherApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, type Locale } from 'date-fns';
import { enUS, hi, te, ta } from 'date-fns/locale';
import pa from '@/lib/locales/pa';
import mr from '@/lib/locales/mr';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const dateLocales: { [key: string]: Locale } = {
  en: enUS,
  hi: hi,
  pa: pa,
  mr: mr,
  te: te,
  ta: ta,
};

export default function WeatherForecast() {
  const { t, language } = useLanguage();
  const {
    weatherData: cachedWeatherData,
    locationData: cachedLocationData,
    setWeatherData,
    setLocationData,
    isWeatherDataCached
  } = useDataCache();

  const [weatherData, setWeatherDataLocal] = useState<WeatherData | null>(null);
  const [location, setLocationLocal] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if we have cached location data
      let userLocation: LocationData;
      if (cachedLocationData) {
        userLocation = cachedLocationData;
        setLocationLocal(userLocation);
      } else {
        userLocation = await getCurrentLocation();
        setLocationData(userLocation);
        setLocationLocal(userLocation);
      }

      setLocationPermission(true);

      // Create cache key based on location
      const cacheKey = `${userLocation.latitude.toFixed(4)}-${userLocation.longitude.toFixed(4)}`;

      // Check if weather data is cached
      if (isWeatherDataCached(cacheKey)) {
        const cachedData = cachedWeatherData[cacheKey];
        setWeatherDataLocal(cachedData);
        setLoading(false);
        return;
      }

      // Fetch new weather data
      const data = await fetchWeatherData(userLocation.latitude, userLocation.longitude);
      setWeatherDataLocal(data);
      setWeatherData(cacheKey, data);
    } catch (err) {
      console.error('Weather data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
      setLocationPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, isDay: boolean = true) => {
    if (code >= 0 && code <= 3) return isDay ? '☀️' : '🌙';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 99) return '⛈️';
    return '🌤️';
  };
  
  const currentLocale = dateLocales[language] || enUS;

  const temperatureChartData = weatherData ? {
    labels: weatherData.hourly.time.slice(0, 24).map(time => 
      format(new Date(time), 'HH:mm')
    ),
    datasets: [
      {
        label: `${t('temperature')} (${t('temperatureUnit')})`,
        data: weatherData.hourly.temperature_2m.slice(0, 24),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1
      },
      {
        label: `${t('feelsLike')} (${t('temperatureUnit')})`,
        data: weatherData.hourly.apparent_temperature.slice(0, 24),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.1
      }
    ]
  } : null;

  const precipitationChartData = weatherData ? {
    labels: weatherData.daily.time.map(time => 
      format(new Date(time), 'MMM dd', { locale: currentLocale })
    ),
    datasets: [
      {
        label: `${t('precipitation')} (${t('precipitationUnit')})`,
        data: weatherData.daily.precipitation_sum,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  } : null;

  const agricultureInsights = weatherData ? getAgricultureInsights(weatherData, t) : null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-lg">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadWeatherData}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center">
          <div className="text-gray-600 mb-4">{t('noDataAvailable')}</div>
          <button
            onClick={loadWeatherData}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {t('getLocation')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">{t('currentWeather')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-4xl mb-2">
              {getWeatherIcon(weatherData.current.weather_code, weatherData.current.is_day === 1)}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(weatherData.current.temperature_2m)}°C
            </div>
            <div className="text-sm text-gray-600">
              {getWeatherDescription(weatherData.current.weather_code, t)}
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(weatherData.current.relative_humidity_2m)}%
            </div>
            <div className="text-sm text-gray-600">{t('humidity')}</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(weatherData.current.wind_speed_10m)} km/h
            </div>
            <div className="text-sm text-gray-600">{t('windSpeed')}</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(weatherData.current.precipitation)} mm
            </div>
            <div className="text-sm text-gray-600">{t('precipitation')}</div>
          </div>
        </div>

        {/* Additional Current Weather Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">{t('feelsLike')}</div>
            <div className="font-semibold">{Math.round(weatherData.current.apparent_temperature)}°C</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">{t('pressure')}</div>
            <div className="font-semibold">{Math.round(weatherData.current.pressure_msl)} hPa</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">{t('uvIndex')}</div>
            <div className="font-semibold">{Math.round(weatherData.current.uv_index)}</div>
          </div>
        </div>

        {/* Agriculture-specific data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-3 bg-orange-50 rounded">
            <div className="text-sm text-gray-600">{t('soilTemperature')}</div>
            <div className="font-semibold text-orange-600">
              {Math.round(weatherData.current.soil_temperature_0cm)}°C
            </div>
          </div>
          <div className="p-3 bg-brown-50 rounded">
            <div className="text-sm text-gray-600">{t('soilMoisture')}</div>
            <div className="font-semibold text-brown-600">
              {Math.round(weatherData.current.soil_moisture_0_1cm * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Agriculture Insights */}
      {agricultureInsights && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">{t('agricultureInsights')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-800 mb-2">{t('irrigation')}</div>
                <div className="text-sm text-blue-700">{agricultureInsights.irrigation}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-800 mb-2">{t('cropHealth')}</div>
                <div className="text-sm text-green-700">{agricultureInsights.cropHealth}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="font-semibold text-yellow-800 mb-2">{t('pestRisk')}</div>
                <div className="text-sm text-yellow-700">{agricultureInsights.pestRisk}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-800 mb-2">{t('harvestTiming')}</div>
                <div className="text-sm text-purple-700">{agricultureInsights.harvestTiming}</div>
              </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">{t('temperatureForecast')}</h3>
          {temperatureChartData && (
            <Line 
              data={temperatureChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  title: {
                    display: true,
                    text: t('temperatureForecast')
                  }
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: t('temperatureUnit')
                    }
                  }
                }
              }}
            />
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">{t('precipitationForecast')}</h3>
          {precipitationChartData && (
            <Bar 
              data={precipitationChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  title: {
                    display: true,
                    text: t('precipitationForecast')
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: t('precipitationUnit')
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">{t('sevenDayForecast')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weatherData.daily.time.map((date, index) => (
            <div key={date} className="text-center p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-600">
                {format(new Date(date), 'EEE', { locale: currentLocale })} 
              </div>
              <div className="text-2xl my-2">
                {getWeatherIcon(weatherData.daily.weather_code[index])}
              </div>
              <div className="text-sm font-semibold">
                {Math.round(weatherData.daily.temperature_2m_max[index])}°
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(weatherData.daily.temperature_2m_min[index])}°
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {Math.round(weatherData.daily.precipitation_sum[index])}mm
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

