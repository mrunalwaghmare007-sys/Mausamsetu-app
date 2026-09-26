import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  MapPin,
  ChevronDown,
  Info
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const HistoricalDataView: React.FC = () => {
  const { selectedCity, historicalData } = useLocation();
  const [timeRange, setTimeRange] = useState<'5y' | '10y' | '20y' | 'custom'>('5y');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              Climatological Archive
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedCity.name}, {selectedCity.state}</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">HISTORICAL WEATHER ARCHIVE</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Baseline normal: <strong className="text-slate-200">{historicalData.baselinePeriod}</strong>. City-specific precipitation and heat wave trends.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center">
          {(['5y', '10y', '20y', 'custom'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                timeRange === range
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === '5y' ? '5 Years' : range === '10y' ? '10 Years' : range === '20y' ? '20 Years' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Anomalies Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Monsoon Rainfall Anomaly</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${historicalData.rainfallAnomalyPercent >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
              {historicalData.rainfallAnomalyPercent >= 0 ? `+${historicalData.rainfallAnomalyPercent}%` : `${historicalData.rainfallAnomalyPercent}%`}
            </span>
            <span className="text-xs text-slate-400">vs 30-year normal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Significant excess precipitation registered in local catchments.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Mean Thermal Departure</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">+{historicalData.tempAnomalyCelsius}°C</span>
            <span className="text-xs text-slate-400">annual drift</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Steady upward decadal warming observed in {selectedCity.name}.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Extreme Event Frequency</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">11 Events</span>
            <span className="text-xs text-slate-400">recorded past year</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Spike in short-duration localized cloudburst bursts.</p>
        </div>
      </div>

      {/* Annual Rainfall Trend Bar Visualization */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Annual Rainfall Trend (mm)</h3>
            <p className="text-xs text-slate-400">Historical precipitation totals for {selectedCity.name}</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Verified IMD Archives</span>
        </div>

        <div className="space-y-3">
          {historicalData.annualData.map(d => {
            const maxRain = 3000;
            const pct = Math.min(100, Math.round((d.annualRainfall / maxRain) * 100));
            return (
              <div key={d.year} className="flex items-center gap-3 text-xs font-mono">
                <span className="w-12 text-slate-300 font-bold">{d.year}</span>
                <div className="flex-1 bg-slate-950 h-5 rounded-lg overflow-hidden border border-slate-800 relative">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-lg transition-all flex items-center justify-end pr-2 text-[10px] text-slate-950 font-bold"
                    style={{ width: `${pct}%` }}
                  >
                    {d.annualRainfall} mm
                  </div>
                </div>
                <span className="text-slate-400 text-[11px] w-24 text-right">
                  {d.extremeEventsCount} storms
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Extreme Events Archive */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
          Historical Extreme Weather Benchmark Events in {selectedCity.name}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Centennial extreme record references for calibrating today's real-time alerts.
        </p>

        <div className="space-y-2">
          {historicalData.topExtremeEvents.map((evt, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{evt.event}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold">
                    {evt.historicalRank}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">Recorded on: {evt.date}</p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-cyan-300 font-mono">{evt.value}</span>
                <span className="block text-[10px] text-slate-400">Measured Severity</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
