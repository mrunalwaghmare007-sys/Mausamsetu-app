import React from 'react';
import {
  MapPin,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  Mail,
  Zap,
  Flame,
  Sun,
  Radio
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { LocationAlert } from '../../types';

interface DashboardViewProps {
  onNavigate: (viewId: string) => void;
  onOpenEmailModalForAlert: (alert: LocationAlert) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenEmailModalForAlert
}) => {
  const { selectedCity, selectedArea, weather, activeAlerts, riskAnalysis, forecast, lastCheckedTime } = useLocation();
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Location Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60">
              CENTRAL LOCATION STATE
            </span>
            <span className="text-xs text-slate-400">
              Synchronized Grid: <strong className="text-white">{selectedArea.name}</strong>, {selectedCity.name} ({selectedCity.state})
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {selectedArea.name}
            <span className="text-slate-400 font-semibold text-2xl ml-2">/ {selectedCity.name}</span>
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Local weather intelligence, calibrated hazard thresholds, and verified public alerts. All metrics below are strictly isolated to <strong className="text-cyan-300">{selectedArea.name}, {selectedCity.name}</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400 font-mono">
            <span>Elevation: {selectedArea.elevationMeters}m</span>
            <span>•</span>
            <span>Flood Geo-Risk: <strong className="text-slate-200">{selectedArea.floodVulnerability}</strong></span>
            <span>•</span>
            <span>Telemetry Last Synced: <strong className="text-slate-200">{lastCheckedTime}</strong></span>
          </div>
        </div>

        {/* Big Live Temp & Condition Widget */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shrink-0 shadow-lg">
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-4xl sm:text-5xl font-black text-white">{weather.temperature}</span>
              <span className="text-xl font-bold text-cyan-400">°C</span>
            </div>
            <p className="text-xs text-slate-400">Feels like {weather.feelsLike}°C</p>
            <p className="text-xs font-semibold text-cyan-300 mt-1 max-w-[140px] truncate">{weather.condition}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Thermometer className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Primary KPI Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rainfall */}
        <div
          onClick={() => onNavigate('live-weather')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>24h Rainfall</span>
            <CloudRain className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${weather.rainfall >= 50 ? 'text-amber-400' : 'text-white'}`}>
              {weather.rainfall}
            </span>
            <span className="text-xs text-slate-400 font-mono">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {weather.rainfall >= 50 ? 'Threshold: 50mm (High)' : 'Threshold: 50mm (Normal)'}
          </p>
        </div>

        {/* Wind */}
        <div
          onClick={() => onNavigate('live-weather')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Wind Velocity</span>
            <Wind className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{weather.windSpeed}</span>
            <span className="text-xs text-slate-400 font-mono">km/h</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Direction: {weather.windDirection}</p>
        </div>

        {/* AQI */}
        <div
          onClick={() => onNavigate('live-weather')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Air Quality</span>
            <Activity className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{weather.aqi}</span>
            <span className="text-xs text-slate-400 font-mono">AQI</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{weather.aqiCategory}</p>
        </div>

        {/* Risk Level */}
        <div
          onClick={() => onNavigate('risk-analysis')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Composite Hazard</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{riskAnalysis.overallLevel}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Score: {riskAnalysis.overallScore}/100</p>
        </div>
      </div>

      {/* Main Two-Column Row: Active Alerts Snapshot + Key Feature Verification CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts for this Location (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Active Alerts</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {selectedArea.name}, {selectedCity.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Location-specific alerts matching live data thresholds</p>
            </div>

            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeAlerts.length === 0 ? (
            /* Requirement 11: Crisp NO ACTIVE ALERTS state */
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">NO ACTIVE ALERTS</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Currently, no active weather alerts are available for <strong className="text-cyan-300">{selectedArea.name}, {selectedCity.name}</strong>.
              </p>
              <div className="text-[11px] text-slate-400 pt-2 font-mono">
                <span>Last checked: {lastCheckedTime}</span> • <span>Source: {weather.source}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map(alert => (
                <div
                  key={alert.alertId}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{alert.title}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded font-extrabold uppercase bg-rose-950 text-rose-300 border border-rose-800">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {alert.weatherParameter}: <strong className="text-white">{alert.value}</strong> (Threshold: {alert.threshold})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{alert.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onOpenEmailModalForAlert(alert)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      title="Send alert email"
                    >
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Email Alert</span>
                    </button>
                    <button
                      onClick={() => onNavigate('alerts')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Verify Report Card (KEY FEATURE Callout) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-2 py-0.5 rounded shadow-sm">
                KEY FEATURE
              </span>
              <span className="text-xs text-slate-400 font-mono">Anti-Misinformation</span>
            </div>

            <h3 className="text-lg font-bold text-white">Verify Weather Report or Viral Post</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Received a alarming WhatsApp forward about cloudbursts or deluge in {selectedCity.name}? Check claims against real ground sensors and Doppler radar.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Text claims & WhatsApp forwards</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Screenshot upload with instant OCR</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Grounded against {weather.source}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('verify-report')}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>OPEN VERIFICATION WORKBENCH</span>
          </button>
        </div>
      </div>

      {/* Hourly Forecast Strip Teaser */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Upcoming Hours ({selectedArea.name})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('forecast')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>7-Day Synoptic Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          {forecast.hourly.slice(0, 6).map((h, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 block">{h.time}</span>
              <span className="text-lg font-black text-white block my-1">{h.temperature}°</span>
              <span className="text-[10px] text-cyan-300 block truncate">{h.condition}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">{h.rainProbability}% rain</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Weather Monitoring Dashboard Section (Requirements 65, 68, 69) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Social Weather Signals (Requirement 65) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
                COMMUNITY RADAR
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">
                DEMO DATA
              </span>
            </div>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              SOCIAL WEATHER SIGNALS
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Emerging weather-related public posts detected across X, Instagram, Facebook & YouTube.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Total Detected:</span>
                <strong className="text-cyan-400">5 active signals</strong>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-900">
                <span>{selectedCity.name}:</span>
                <span className="text-white font-bold">3 reports</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>{selectedArea.name}:</span>
                <span className="text-amber-400 font-bold">2 reports</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Other metros:</span>
                <span className="text-slate-300 font-bold">2 reports</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('social-feed')}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <span>VIEW SOCIAL FEED</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Social Weather Activity Breakdown (Requirement 68) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              SOCIAL WEATHER ACTIVITY
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-950 text-slate-400 border border-slate-800">
              Today
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">X / Twitter</span>
              <strong className="text-white text-base">12 reports</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Facebook</span>
              <strong className="text-white text-base">6 reports</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Instagram</span>
              <strong className="text-white text-base">8 reports</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">YouTube</span>
              <strong className="text-white text-base">4 reports</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Total: <strong>30 reports</strong></span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">12 Verified</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold">7 Partial</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-bold">8 Unverified</span>
            </div>
          </div>
        </div>

        {/* Card 3: Social Media Timeline (Requirement 69) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                SOCIAL MEDIA TIMELINE
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Chronological</span>
            </div>

            <div className="space-y-2 mt-3 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold text-[10px]">10:32 AM • X/Twitter</span>
                  <p className="text-slate-200 text-[11px] font-sans">Kothrud Heavy Rain</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-bold">
                  NOT VERIFIED
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold text-[10px]">10:05 AM • Instagram</span>
                  <p className="text-slate-200 text-[11px] font-sans">Pune Rain Alert</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 uppercase font-bold">
                  PARTIAL
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold text-[10px]">09:45 AM • YouTube</span>
                  <p className="text-slate-200 text-[11px] font-sans">Pune Heavy Rain Forecast</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 uppercase font-bold">
                  SUPPORTED
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('social-signals')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1 pt-1"
          >
            <span>Inspect All Social Signals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
