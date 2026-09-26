import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Compass,
  RotateCcw,
  AlertTriangle,
  CloudRain,
  Wind,
  Flame,
  Activity,
  Zap,
  Waves,
  SunMedium,
  CheckCircle2,
  Clock,
  Info,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Sliders,
  Radio
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { LocationAlert, HazardType, SeverityLevel } from '../../types';

interface HazardMapViewProps {
  onOpenEmailModalForAlert?: (alert: LocationAlert) => void;
}

export const HazardMapView: React.FC<HazardMapViewProps> = ({ onOpenEmailModalForAlert }) => {
  const {
    cities,
    selectedCity,
    selectedArea,
    setCity,
    setArea,
    weather,
    activeAlerts,
    riskAnalysis,
    lastCheckedTime
  } = useLocation();

  // Map DOM container ref & Leaflet map instance ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Map View States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [basemapTheme, setBasemapTheme] = useState<'dark' | 'standard'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeStep, setTimeStep] = useState<'NOW' | '-1h' | '-3h' | '-6h' | '-12h' | '-24h'>('NOW');
  const [heatmapMode, setHeatmapMode] = useState<'none' | 'rainfall' | 'temperature' | 'aqi' | 'risk'>('none');

  // Weather Overlay Selection
  const [activeWeatherOverlay, setActiveWeatherOverlay] = useState<'none' | 'rainfall' | 'wind' | 'temp'>('rainfall');

  // Hazard Layers Checkboxes
  const [hazardLayers, setHazardLayers] = useState<Record<string, boolean>>({
    all: true,
    'Heavy Rain': true,
    'Flood Risk': true,
    Thunderstorm: true,
    'Strong Wind': true,
    'Heat Risk': true,
    'Poor Air Quality': true,
    'High UV': true,
    Lightning: true
  });

  // Selected Marker Modal
  const [inspectedArea, setInspectedArea] = useState<any | null>(null);
  const [inspectedAlert, setInspectedAlert] = useState<LocationAlert | null>(null);

  const toggleHazardLayer = (key: string) => {
    if (key === 'all') {
      const nextVal = !hazardLayers.all;
      const updated: Record<string, boolean> = { all: nextVal };
      Object.keys(hazardLayers).forEach(k => {
        updated[k] = nextVal;
      });
      setHazardLayers(updated);
    } else {
      setHazardLayers(prev => {
        const updated = { ...prev, [key]: !prev[key] };
        updated.all = Object.entries(updated)
          .filter(([k]) => k !== 'all')
          .every(([_, v]) => v);
        return updated;
      });
    }
  };

  // Filtered areas for map search
  const searchedAreas = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{ cityId: string; cityName: string; area: any }> = [];
    cities.forEach(c => {
      c.areas.forEach(a => {
        if (a.name.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) {
          results.push({ cityId: c.id, cityName: c.name, area: a });
        }
      });
    });
    return results.slice(0, 6);
  }, [cities, searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Map
      const map = L.map(mapContainerRef.current, {
        center: [selectedArea.latitude, selectedArea.longitude],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // Standard OpenStreetMap Tiles (100% free, reliable, no proprietary API key or watermark)
      const tileUrl = (import.meta as any).env?.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abc',
        className: 'dark-weather-basemap',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Layer group for dynamic items
      const group = L.layerGroup().addTo(map);
      layerGroupRef.current = group;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Sync Basemap Theme (Dark Ops vs Standard Street)
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const container = tileLayerRef.current.getContainer();
    if (container) {
      if (basemapTheme === 'dark') {
        container.classList.add('dark-weather-basemap');
        container.classList.remove('standard-osm-basemap');
      } else {
        container.classList.remove('dark-weather-basemap');
        container.classList.add('standard-osm-basemap');
      }
    }
  }, [basemapTheme]);

  // Update Map Center and Markers whenever location, layers, or overlays change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    // Pan smoothly to selected area
    map.flyTo([selectedArea.latitude, selectedArea.longitude], 12.5, {
      duration: 1.0,
      easeLinearity: 0.25
    });

    // Clear existing markers and overlays
    group.clearLayers();

    // 1. Draw City Boundary approximation circle
    const cityCircle = L.circle([selectedCity.latitude, selectedCity.longitude], {
      radius: 14000,
      color: '#06b6d4',
      weight: 1,
      dashArray: '4, 8',
      fillColor: '#0891b2',
      fillOpacity: 0.03
    });
    group.addLayer(cityCircle);

    // 2. Draw Weather Overlays (Rainfall Radar, Heatmap, Wind Vectors)
    if (activeWeatherOverlay === 'rainfall' || heatmapMode === 'rainfall') {
      // Draw smooth rainfall radar intensity concentric zones
      const baseRadius = weather.rainfall > 50 ? 5500 : 3500;
      const radarColor = weather.rainfall > 60 ? '#ef4444' : weather.rainfall > 30 ? '#f59e0b' : '#3b82f6';
      
      const radarZone = L.circle([selectedArea.latitude, selectedArea.longitude], {
        radius: baseRadius,
        color: radarColor,
        weight: 1.5,
        fillColor: radarColor,
        fillOpacity: 0.25
      });
      radarZone.bindTooltip(`Radar Echo: ${weather.rainfall}mm precipitation core`, { className: 'leaflet-dark-tooltip' });
      group.addLayer(radarZone);
    }

    if (activeWeatherOverlay === 'wind') {
      // Add subtle directional vectors
      selectedCity.areas.forEach(a => {
        const windMarker = L.circleMarker([a.latitude, a.longitude], {
          radius: 12,
          color: '#14b8a6',
          weight: 1,
          fillColor: '#0d9488',
          fillOpacity: 0.15
        });
        group.addLayer(windMarker);
      });
    }

    // 3. Draw Hazard Risk Zones based on active checkboxes
    selectedCity.areas.forEach(a => {
      const isSelected = a.id === selectedArea.id;
      const areaAlert = activeAlerts.find(alt => alt.areaId === a.id);

      // Check if this hazard type is enabled in hazardLayers
      if (areaAlert && (hazardLayers.all || hazardLayers[areaAlert.hazardType])) {
        const zoneColor =
          areaAlert.severity === 'Severe'
            ? '#f43f5e'
            : areaAlert.severity === 'High'
            ? '#ef4444'
            : '#f59e0b';

        const hazardZone = L.circle([a.latitude, a.longitude], {
          radius: 2200,
          color: zoneColor,
          weight: 1.5,
          fillColor: zoneColor,
          fillOpacity: 0.22
        });

        hazardZone.on('click', () => {
          setInspectedAlert(areaAlert);
        });

        group.addLayer(hazardZone);
      }

      // 4. Create Marker for this Area
      const hasActiveAlert = !!areaAlert;
      let markerColor = '#64748b'; // slate normal
      if (areaAlert?.severity === 'Severe') markerColor = '#f43f5e';
      else if (areaAlert?.severity === 'High') markerColor = '#ef4444';
      else if (areaAlert?.severity === 'Moderate') markerColor = '#f59e0b';
      else if (isSelected) markerColor = '#06b6d4';

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '26px'};
            height: ${isSelected ? '36px' : '26px'};
            border-radius: 9999px;
            background: ${isSelected ? '#0891b2' : '#0f172a'};
            border: 2px solid ${isSelected ? '#22d3ee' : markerColor};
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
            color: #fff;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${isSelected ? '<div style="position: absolute; inset: -4px; border-radius: 9999px; border: 2px solid #22d3ee; opacity: 0.6; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            ${hasActiveAlert ? '⚠' : isSelected ? '★' : '•'}
          </div>
        `,
        iconSize: isSelected ? [36, 36] : [26, 26],
        iconAnchor: isSelected ? [18, 18] : [13, 13]
      });

      const marker = L.marker([a.latitude, a.longitude], { icon: customIcon });

      // Click on marker
      marker.on('click', () => {
        setArea(a.id);
        setInspectedArea(a);
        if (areaAlert) {
          setInspectedAlert(areaAlert);
        }
      });

      // Bind clean hover tooltip
      marker.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; line-height: 1.3;">
          <strong style="color: #22d3ee; display: block;">${a.name}</strong>
          <span style="color: #94a3b8;">${selectedCity.name} (Elev: ${a.elevationMeters}m)</span>
          ${areaAlert ? `<span style="color: #f87171; display: block; font-weight: bold; margin-top: 2px;">⚠ ${areaAlert.hazardType} (${areaAlert.severity})</span>` : ''}
        </div>`,
        { direction: 'top', offset: [0, -14], className: 'leaflet-custom-tooltip' }
      );

      group.addLayer(marker);
    });
  }, [
    selectedCity,
    selectedArea,
    activeAlerts,
    hazardLayers,
    activeWeatherOverlay,
    heatmapMode,
    weather.rainfall,
    timeStep
  ]);

  // Center / Reset View Handler
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedArea.latitude, selectedArea.longitude], 12.5);
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          mapInstanceRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 13);
        },
        () => {
          handleResetView();
        }
      );
    } else {
      handleResetView();
    }
  };

  return (
    <div className={`space-y-4 animate-in fade-in duration-200 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 flex flex-col' : ''}`}>
      {/* 1. MAP HEADER (Requirement 31) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60">
              HAZARD INTELLIGENCE MAP
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <strong className="text-white">{selectedCity.name}</strong>
              <span className="text-slate-500">→</span>
              <strong className="text-cyan-300">{selectedArea.name}</strong>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60">
              DEMO DATA (CALIBRATED)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>
              Coordinates: <strong className="text-slate-200">{selectedArea.latitude.toFixed(4)}° N, {selectedArea.longitude.toFixed(4)}° E</strong>
            </span>
            <span>•</span>
            <span>
              Current Risk: <strong className="text-amber-400 uppercase">{riskAnalysis.overallLevel} ({riskAnalysis.overallScore}/100)</strong>
            </span>
            <span>•</span>
            <span>
              Active Alerts: <strong className={activeAlerts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}>{activeAlerts.length}</strong>
            </span>
            <span>•</span>
            <span>Last Updated: {lastCheckedTime}</span>
          </div>
        </div>

        {/* Map Search Bar (Requirement 20) */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search locality (e.g. Kharadi)..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
          />

          {searchedAreas.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50">
              {searchedAreas.map(({ cityId, cityName, area }) => (
                <button
                  key={`${cityId}-${area.id}`}
                  onClick={() => {
                    setCity(cityId);
                    setArea(area.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between"
                >
                  <span className="font-semibold text-cyan-300">{area.name}</span>
                  <span className="text-[10px] text-slate-400">{cityName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN MAP CONTAINER */}
      <div className={`relative rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col ${isFullscreen ? 'flex-1' : 'min-h-[580px] h-[640px]'}`}>
        {/* Leaflet Map Target Element */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-950" />

        {/* Floating Top Left: Professional Map Controls (Requirement 19) */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          <div className="p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex flex-col gap-1 text-slate-300">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center font-bold text-base hover:text-white"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center font-bold text-base hover:text-white"
              title="Zoom Out"
            >
              −
            </button>
            <div className="h-px bg-slate-800 my-0.5" />
            <button
              onClick={handleLocateMe}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center hover:text-cyan-400"
              title="Locate Me"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center hover:text-cyan-400"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center hover:text-cyan-400"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Floating Top Right: Hazard Layers & Overlay Selector */}
        <div className="absolute top-4 right-4 z-10 flex items-start gap-2">
          {/* Weather Overlay Toggle Bar */}
          <div className="p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveWeatherOverlay(activeWeatherOverlay === 'rainfall' ? 'none' : 'rainfall')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeWeatherOverlay === 'rainfall'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Rainfall Radar</span>
            </button>
            <button
              onClick={() => setActiveWeatherOverlay(activeWeatherOverlay === 'wind' ? 'none' : 'wind')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeWeatherOverlay === 'wind'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Wind Flow</span>
            </button>
            <button
              onClick={() => setHeatmapMode(heatmapMode === 'rainfall' ? 'none' : 'rainfall')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                heatmapMode !== 'none'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Heatmap</span>
            </button>

            <button
              onClick={() => setBasemapTheme(basemapTheme === 'dark' ? 'standard' : 'dark')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                basemapTheme === 'dark'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              }`}
              title="Toggle Dark Weather Basemap / Standard OpenStreetMap"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{basemapTheme === 'dark' ? 'Dark Ops' : 'Street Map'}</span>
            </button>
          </div>

          {/* Toggle Collapsible Side Panel */}
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-slate-300 hover:text-white"
            title="Toggle Location Summary"
          >
            {isSidePanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Floating Left: Hazard Layers Control Checklist (Requirement 10) */}
        <div className="absolute bottom-16 left-4 z-10 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl max-w-xs text-xs space-y-2 hidden md:block">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Hazard Layers
            </span>
            <button
              onClick={() => toggleHazardLayer('all')}
              className="text-[10px] text-cyan-400 hover:underline font-semibold"
            >
              {hazardLayers.all ? 'Uncheck All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            {Object.keys(hazardLayers)
              .filter(k => k !== 'all')
              .map(layer => (
                <label key={layer} className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={hazardLayers[layer]}
                    onChange={() => toggleHazardLayer(layer)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 w-3 h-3 cursor-pointer"
                  />
                  <span className="truncate">{layer}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Floating Right: Collapsible Side Panel - Location Summary (Requirement 32) */}
        {isSidePanelOpen && (
          <div className="absolute top-16 right-4 z-10 w-72 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs space-y-3 animate-in fade-in slide-in-from-right-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  LOCATION SUMMARY
                </span>
                <h4 className="text-sm font-black text-white">{selectedArea.name}</h4>
                <p className="text-[10px] text-cyan-400">{selectedCity.name}, {selectedCity.state}</p>
              </div>
              <button
                onClick={() => setIsSidePanelOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Temperature</span>
                <strong className="text-white text-sm">{weather.temperature}°C</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">24h Rainfall</span>
                <strong className="text-cyan-300 text-sm">{weather.rainfall} mm</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Rain Probability</span>
                <strong className="text-white text-sm">{weather.rainProbability}%</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Wind Velocity</span>
                <strong className="text-teal-300 text-sm">{weather.windSpeed} km/h</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Air Quality:</span>
              <strong className="text-purple-300 font-mono">{weather.aqi} AQI ({weather.aqiCategory})</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Risk Assessment:</span>
              <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-amber-950 border border-amber-800 text-amber-300 font-mono">
                {riskAnalysis.overallLevel} ({riskAnalysis.overallScore}/100)
              </span>
            </div>

            {/* Active Alerts in Selected Area */}
            {activeAlerts.length > 0 ? (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{activeAlerts.length} Active Alert ({activeAlerts[0].hazardType})</span>
                </div>
                <p className="text-[10px] text-slate-300 line-clamp-2">{activeAlerts[0].description}</p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-2 text-emerald-300 text-[11px]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>No active alerts in {selectedArea.name}.</span>
              </div>
            )}
          </div>
        )}

        {/* Floating Bottom Center: Map Timeline (Requirement 24) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-1 text-[11px] font-mono">
          <span className="px-2 text-slate-400 font-sans font-bold text-[10px] uppercase">Timeline:</span>
          {(['NOW', '-1h', '-3h', '-6h', '-12h', '-24h'] as const).map(step => (
            <button
              key={step}
              onClick={() => setTimeStep(step)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                timeStep === step
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {step}
            </button>
          ))}
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 ml-1">
            {timeStep === 'NOW' ? 'LIVE RADAR' : 'OBSERVED'}
          </span>
        </div>

        {/* Floating Bottom Right: Rainfall Radar Scale & Severity Legend (Requirement 11 & 13) */}
        <div className="absolute bottom-4 right-4 z-10 p-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl text-[10px] font-mono space-y-1.5 hidden sm:block">
          <div className="flex items-center justify-between text-slate-400 font-sans font-bold text-[9px] uppercase">
            <span>Rainfall Legend (mm)</span>
            <span className="text-amber-400">DEMO RAINFALL DATA</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">0</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-900 text-blue-200">5</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white">10</span>
            <span className="px-1.5 py-0.5 rounded bg-teal-500 text-slate-950">25</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">50</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">100+</span>
          </div>
        </div>
      </div>

      {/* 3. MAP DATA STATUS BAR & ATTRIBUTION (Requirement 25 & 26) */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Weather Telemetry: Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Hazard Engine: Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Alerts Synced: {lastCheckedTime}</span>
          </div>
        </div>

        <div>
          <span>Map Provider: OpenStreetMap (Standard Geographic Tiles) • WGS84 EPSG:4326</span>
        </div>
      </div>

      {/* 4. ACTIVE ALERT DETAILS POPUP MODAL (Requirement 15) */}
      {inspectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => setInspectedAlert(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase bg-rose-950 border border-rose-800 text-rose-300">
                {inspectedAlert.severity} HAZARD
              </span>
              <span className="text-xs text-slate-400 font-mono">{inspectedAlert.status}</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{inspectedAlert.title}</h3>
            <p className="text-xs text-cyan-300 mb-3">{inspectedAlert.area}, {inspectedAlert.city} ({inspectedAlert.state})</p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">{inspectedAlert.weatherParameter}:</span>
                <strong className="text-white text-sm">{inspectedAlert.value}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Threshold:</span>
                <strong className="text-amber-400">{inspectedAlert.threshold}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-900">
                <span className="text-slate-400">Detected: {inspectedAlert.timestamp}</span>
                <span className="text-slate-400">Valid Until: {inspectedAlert.validUntil}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 font-sans leading-relaxed">{inspectedAlert.description}</p>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200 text-xs mb-4">
              <strong>Recommendation: </strong>{inspectedAlert.recommendation}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setInspectedAlert(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold"
              >
                Close
              </button>
              {onOpenEmailModalForAlert && (
                <button
                  onClick={() => {
                    const alt = inspectedAlert;
                    setInspectedAlert(null);
                    onOpenEmailModalForAlert(alt);
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Send to Registered Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
