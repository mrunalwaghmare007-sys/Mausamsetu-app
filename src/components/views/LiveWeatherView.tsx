import React from 'react';
import {
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  Eye,
  Activity,
  Compass,
  Gauge,
  Clock,
  Radio,
  MapPin,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const LiveWeatherView: React.FC = () => {
  const { selectedCity, selectedArea, weather, lastCheckedTime } = useLocation();

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    if (aqi <= 100) return 'text-lime-400 bg-lime-950/40 border-lime-800/60';
    if (aqi <= 200) return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
    if (aqi <= 300) return 'text-orange-400 bg-orange-950/40 border-orange-800/60';
    return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Location Identity */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              Hyperlocal Telemetry Station
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedCity.latitude.toFixed(4)}° N, {selectedCity.longitude.toFixed(4)}° E</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-black text-white">{selectedArea.name}</h1>
            <span className="text-xl font-bold text-slate-400">{selectedCity.name}, {selectedCity.state}</span>
          </div>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Elevation: {selectedArea.elevationMeters}m</span>
            <span>•</span>
            <span>Flood Vulnerability: <strong className="text-slate-300">{selectedArea.floodVulnerability}</strong></span>
            <span>•</span>
            <span>Climate: {selectedCity.climateZone}</span>
          </p>
        </div>

        {/* Big Temperature Hero Badge */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-right">
            <span className="text-4xl font-black text-white tracking-tight">{weather.temperature}°C</span>
            <p className="text-xs text-slate-400 mt-0.5">Feels like {weather.feelsLike}°C</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Thermometer className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Grid of Weather Cards (Requirement 22) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Condition */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Condition</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-base font-bold text-white line-clamp-1">{weather.condition}</p>
          <p className="text-[11px] text-slate-400 mt-1">Live sky classification</p>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{weather.humidity}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Dew Point: {weather.dewPoint}°C</p>
        </div>

        {/* Rainfall (24h) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>24h Rainfall</span>
            <CloudRain className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${weather.rainfall >= 50 ? 'text-amber-400' : 'text-white'}`}>
              {weather.rainfall}
            </span>
            <span className="text-xs text-slate-400">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {weather.rainfall >= 50 ? 'Exceeds 50mm safe threshold' : 'Within normal drainage limit'}
          </p>
        </div>

        {/* Rain Probability */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Rain Probability</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{weather.rainProbability}%</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all"
              style={{ width: `${weather.rainProbability}%` }}
            />
          </div>
        </div>

        {/* Wind Speed & Direction */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Wind Velocity</span>
            <Wind className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{weather.windSpeed}</span>
            <span className="text-xs text-slate-400">km/h</span>
            <span className="text-xs font-mono text-cyan-400 font-bold">({weather.windDirection})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Surface anemometer measurement</p>
        </div>

        {/* Solar UV Index */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>UV Radiation Index</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{weather.uvIndex}</span>
            <span className="text-xs text-slate-400">/ 12</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {weather.uvIndex >= 8 ? 'Very High (Sun protection mandatory)' : 'Moderate exposure profile'}
          </p>
        </div>

        {/* Air Quality Index (AQI) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Air Quality (AQI)</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{weather.aqi}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getAqiColor(weather.aqi)}`}>
              {weather.aqiCategory}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">CPCB CAAQMS Grid</p>
        </div>

        {/* Atmospheric Visibility */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Optical Visibility</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{weather.visibility}</span>
            <span className="text-xs text-slate-400">km</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {weather.visibility < 3 ? 'Impaired by moisture/smog' : 'Clear horizontal visibility'}
          </p>
        </div>

        {/* Barometric Pressure */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Barometer</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{weather.barometer}</span>
            <span className="text-xs text-slate-400">hPa</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mean Sea Level corrected</p>
        </div>

        {/* Station Metadata Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md col-span-2 md:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Telemetry Feed Source:</span>
              <strong className="text-slate-200">{weather.source}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Synchronized: <strong className="text-white">{lastCheckedTime}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
