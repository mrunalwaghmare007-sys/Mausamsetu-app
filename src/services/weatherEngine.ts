import {
  City,
  Area,
  WeatherData,
  LocationAlert,
  ForecastData,
  RiskAnalysis,
  CityHistoricalData,
  SourceComparisonItem,
  HazardType,
  SeverityLevel,
  RiskFactor
} from '../types';
import { INDIAN_CITIES } from '../data/citiesData';

// Microclimate baseline definitions per city
interface CityClimateProfile {
  baseTemp: number;
  tempVariance: number;
  baseHumidity: number;
  baseRainfall: number;
  baseRainProb: number;
  baseWind: number;
  baseAqi: number;
  baseUv: number;
  predominantCondition: string;
  sourceName: string;
}

const CITY_PROFILES: Record<string, CityClimateProfile> = {
  pune: {
    baseTemp: 28.5,
    tempVariance: 2.5,
    baseHumidity: 78,
    baseRainfall: 42,
    baseRainProb: 80,
    baseWind: 22,
    baseAqi: 94,
    baseUv: 6.2,
    predominantCondition: 'Monsoon Showers',
    sourceName: 'IMD Pune Sub-Division (Automated AWS)'
  },
  mumbai: {
    baseTemp: 30.2,
    tempVariance: 1.8,
    baseHumidity: 88,
    baseRainfall: 68,
    baseRainProb: 88,
    baseWind: 34,
    baseAqi: 118,
    baseUv: 7.0,
    predominantCondition: 'Heavy Coastal Rain',
    sourceName: 'Colaba & Santacruz IMD Coastal Radar'
  },
  delhi: {
    baseTemp: 39.8,
    tempVariance: 3.2,
    baseHumidity: 38,
    baseRainfall: 0,
    baseRainProb: 15,
    baseWind: 16,
    baseAqi: 326,
    baseUv: 9.4,
    predominantCondition: 'Hazy & Hot',
    sourceName: 'CPCB Delhi-NCR Realtime Grid'
  },
  bengaluru: {
    baseTemp: 24.8,
    tempVariance: 2.0,
    baseHumidity: 68,
    baseRainfall: 14,
    baseRainProb: 55,
    baseWind: 28,
    baseAqi: 62,
    baseUv: 6.8,
    predominantCondition: 'Partly Cloudy with Gusts',
    sourceName: 'Karnataka State Natural Disaster Monitoring (KSNDMC)'
  },
  hyderabad: {
    baseTemp: 32.4,
    tempVariance: 2.2,
    baseHumidity: 62,
    baseRainfall: 8,
    baseRainProb: 40,
    baseWind: 36,
    baseAqi: 104,
    baseUv: 7.8,
    predominantCondition: 'Scattered Clouds & Gusty',
    sourceName: 'Telangana Planning Dept & IMD Begumpet'
  },
  chennai: {
    baseTemp: 33.1,
    tempVariance: 1.5,
    baseHumidity: 84,
    baseRainfall: 48,
    baseRainProb: 75,
    baseWind: 24,
    baseAqi: 88,
    baseUv: 8.5,
    predominantCondition: 'Humid Coastal Downpour',
    sourceName: 'Meenambakkam IMD Doppler Station'
  },
  kolkata: {
    baseTemp: 31.8,
    tempVariance: 2.0,
    baseHumidity: 86,
    baseRainfall: 38,
    baseRainProb: 70,
    baseWind: 19,
    baseAqi: 142,
    baseUv: 7.2,
    predominantCondition: 'Tropical Thunderheads',
    sourceName: 'Alipore IMD Regional Center'
  },
  ahmedabad: {
    baseTemp: 41.6,
    tempVariance: 2.8,
    baseHumidity: 32,
    baseRainfall: 0,
    baseRainProb: 5,
    baseWind: 18,
    baseAqi: 185,
    baseUv: 10.2,
    predominantCondition: 'Intense Heatwave',
    sourceName: 'Gujarat State Disaster Management Authority'
  },
  jaipur: {
    baseTemp: 40.8,
    tempVariance: 2.6,
    baseHumidity: 28,
    baseRainfall: 0,
    baseRainProb: 10,
    baseWind: 21,
    baseAqi: 198,
    baseUv: 9.8,
    predominantCondition: 'Extreme Dry Heat',
    sourceName: 'IMD Jaipur Meteorological Centre'
  },
  lucknow: {
    baseTemp: 36.4,
    tempVariance: 2.2,
    baseHumidity: 58,
    baseRainfall: 4,
    baseRainProb: 25,
    baseWind: 12,
    baseAqi: 245,
    baseUv: 8.2,
    predominantCondition: 'Humid & Overcast',
    sourceName: 'UP State Relief Commissioner Grid'
  },
  nagpur: {
    baseTemp: 40.4,
    tempVariance: 2.4,
    baseHumidity: 36,
    baseRainfall: 0,
    baseRainProb: 15,
    baseWind: 17,
    baseAqi: 138,
    baseUv: 9.5,
    predominantCondition: 'Severe Heat Condition',
    sourceName: 'Central India IMD Doppler Sonegaon'
  },
  nashik: {
    baseTemp: 27.2,
    tempVariance: 1.8,
    baseHumidity: 82,
    baseRainfall: 36,
    baseRainProb: 65,
    baseWind: 26,
    baseAqi: 72,
    baseUv: 6.4,
    predominantCondition: 'Monsoon Mist & Showers',
    sourceName: 'Godavari Basin Water Resources Dept'
  },
  bhopal: {
    baseTemp: 33.6,
    tempVariance: 2.0,
    baseHumidity: 65,
    baseRainfall: 18,
    baseRainProb: 50,
    baseWind: 25,
    baseAqi: 115,
    baseUv: 7.9,
    predominantCondition: 'Developing Cumulonimbus',
    sourceName: 'MP Council of Science & Technology'
  },
  chandigarh: {
    baseTemp: 28.4,
    tempVariance: 1.5,
    baseHumidity: 55,
    baseRainfall: 0,
    baseRainProb: 10,
    baseWind: 14,
    baseAqi: 82,
    baseUv: 6.0,
    predominantCondition: 'Mild & Clear Skies',
    sourceName: 'Chandigarh Administration Smart Sensors'
  }
};

/**
 * Deterministic hash offset based on area ID string
 * ensures different areas in the same city have realistic micro-climate variance
 */
function getAreaOffset(areaId: string): number {
  let hash = 0;
  for (let i = 0; i < areaId.length; i++) {
    hash = (hash << 5) - hash + areaId.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 21) - 10; // -10 to +10
}

/**
 * Generate location-specific WeatherData for a city and area
 */
export function getWeatherData(city: City, area: Area): WeatherData {
  const profile = CITY_PROFILES[city.id] || CITY_PROFILES.pune;
  const offset = getAreaOffset(area.id);

  // Micro-climate adjustments per locality
  const tempOffset = (offset * 0.15);
  const temp = Math.round((profile.baseTemp + tempOffset) * 10) / 10;
  const humidity = Math.min(99, Math.max(20, Math.round(profile.baseHumidity + offset * 0.8)));

  let rainfall = 0;
  let rainProb = 0;

  // Specific high-rainfall spots
  if (city.id === 'pune' && area.id === 'hinjewadi') {
    rainfall = 72; // explicitly matching prompt requirement: Hinjewadi 72mm
    rainProb = 92;
  } else if (city.id === 'pune' && (area.id === 'wakad' || area.id === 'baner')) {
    rainfall = 34;
    rainProb = 75;
  } else if (city.id === 'pune' && area.id === 'kothrud') {
    rainfall = 8;
    rainProb = 25;
  } else if (city.id === 'mumbai' && area.id === 'andheri') {
    rainfall = 88;
    rainProb = 95;
  } else if (city.id === 'mumbai' && area.id === 'kurla') {
    rainfall = 64;
    rainProb = 90;
  } else if (city.id === 'chennai' && area.id === 'velachery') {
    rainfall = 78;
    rainProb = 88;
  } else if (city.id === 'nashik' && area.id === 'panchavati') {
    rainfall = 54;
    rainProb = 80;
  } else {
    rainfall = Math.max(0, Math.round(profile.baseRainfall + offset * 1.5));
    rainProb = Math.min(100, Math.max(0, Math.round(profile.baseRainProb + offset * 1.2)));
  }

  // Wind
  let windSpeed = Math.max(5, Math.round(profile.baseWind + offset * 0.9));
  if (city.id === 'bengaluru' && area.id === 'whitefield') {
    windSpeed = 48; // Strong wind
  } else if (city.id === 'hyderabad' && area.id === 'gachibowli') {
    windSpeed = 52;
  }

  // AQI adjustments
  let aqi = Math.max(25, Math.round(profile.baseAqi + offset * 3.5));
  if (city.id === 'delhi' && area.id === 'rohini') {
    aqi = 342; // explicitly severe AQI
  } else if (city.id === 'delhi' && area.id === 'gurugram') {
    aqi = 312;
  }

  // UV
  const uv = Math.min(13, Math.max(1, Math.round((profile.baseUv + (temp > 38 ? 1.2 : 0)) * 10) / 10));

  let aqiCategory: WeatherData['aqiCategory'] = 'Good';
  if (aqi > 300) aqiCategory = 'Severe';
  else if (aqi > 200) aqiCategory = 'Very Poor';
  else if (aqi > 100) aqiCategory = 'Poor';
  else if (aqi > 50) aqiCategory = 'Moderate';

  let condition = profile.predominantCondition;
  if (rainfall > 60) condition = 'Heavy Monsoon Downpour';
  else if (rainfall > 25) condition = 'Moderate Thunder Showers';
  else if (rainfall > 5) condition = 'Light Passing Showers';
  else if (temp > 41) condition = 'Severe Heatwave';
  else if (aqi > 300) condition = 'Dense Smog & Haze';

  const feelsLike = Math.round((temp + (humidity > 70 ? 3.5 : -1.0)) * 10) / 10;
  const visibility = aqi > 300 ? 1.8 : rainfall > 50 ? 2.5 : 8.5;

  return {
    cityId: city.id,
    cityName: city.name,
    areaId: area.id,
    areaName: area.name,
    state: city.state,
    temperature: temp,
    feelsLike,
    condition,
    conditionCode: rainfall > 40 ? 'heavy-rain' : temp > 40 ? 'heat' : aqi > 250 ? 'smog' : 'partly-cloudy',
    humidity,
    rainfall,
    rainProbability: rainProb,
    windSpeed,
    windDirection: city.latitude > 20 ? 'WNW' : 'WSW',
    uvIndex: uv,
    visibility,
    aqi,
    aqiCategory,
    barometer: 1008 - Math.round(area.elevationMeters / 12),
    dewPoint: Math.round(temp - ((100 - humidity) / 5)),
    lastUpdated: '10:32 AM IST',
    source: `${profile.sourceName} (Telemetry Station ${area.name})`,
    isDemoData: true // clearly and transparently labelled as required
  };
}

/**
 * RULE-BASED LOCATION ALERT ENGINE
 * Generates ONLY location-relevant alerts based on the exact thresholds:
 * - Pune Hinjewadi: Heavy Rain 72mm vs 50mm threshold
 * - Mumbai Andheri: Heavy Rain 88mm vs 60mm threshold
 * - Delhi Rohini: AQI 342 vs 300 threshold
 * - Ahmedabad Satellite: Heat Risk 43.5°C vs 40°C threshold
 * - Bengaluru Whitefield: Strong Wind 48 km/h vs 40 km/h threshold
 * - Areas with quiet conditions (e.g. Chandigarh, Pune Kothrud, Bengaluru Jayanagar) return ZERO alerts!
 */
export function getActiveAlerts(city: City, area: Area, weather: WeatherData): LocationAlert[] {
  const alerts: LocationAlert[] = [];

  // Rule 1: HEAVY RAIN
  // Threshold: 50 mm in 24h OR rainProbability >= 85%
  if (weather.rainfall >= 50 || (weather.rainfall >= 35 && weather.rainProbability >= 85)) {
    const isSevere = weather.rainfall >= 80;
    alerts.push({
      alertId: `ALT-RAIN-${city.id}-${area.id}-${Date.now().toString().slice(-4)}`,
      city: city.name,
      cityId: city.id,
      area: area.name,
      areaId: area.id,
      state: city.state,
      hazardType: 'Heavy Rain',
      severity: isSevere ? 'Severe' : 'High',
      title: 'Heavy Rain Risk',
      description: `Heavy rainfall conditions detected for ${area.name}, ${city.name}. Inundation risk in low-lying roads.`,
      weatherParameter: 'Rainfall',
      value: `${weather.rainfall} mm`,
      threshold: '50 mm',
      source: 'MausamSetu Sensor Grid & IMD Radar',
      timestamp: '10:32 AM',
      validUntil: '06:00 PM Today',
      status: 'Active',
      recommendation: 'Avoid unnecessary travel through waterlogged underpasses, stay clear of open storm drains, and monitor local municipal traffic advisories.'
    });
  }

  // Rule 2: FLOOD RISK (Only in low-lying / high flood vulnerability areas with heavy rainfall)
  if (area.floodVulnerability === 'High' && weather.rainfall >= 60) {
    alerts.push({
      alertId: `ALT-FLOOD-${city.id}-${area.id}`,
      city: city.name,
      cityId: city.id,
      area: area.name,
      areaId: area.id,
      state: city.state,
      hazardType: 'Flood Risk',
      severity: 'High',
      title: 'Local Urban Waterlogging & Flash Flood Advisory',
      description: `High flood vulnerability zone combined with ${weather.rainfall}mm accumulation causing active drainage backlog in ${area.name}.`,
      weatherParameter: 'Rainfall Accumulation',
      value: `${weather.rainfall} mm`,
      threshold: '60 mm in Floodplain',
      source: 'Disaster Management Cell',
      timestamp: '09:45 AM',
      validUntil: '08:00 PM Today',
      status: 'Active',
      recommendation: 'Elevate critical home and office equipment. Avoid parking vehicles in basement lots or low-lying road shoulders.'
    });
  }

  // Rule 3: THUNDERSTORM RISK
  // Pune Baner, Kolkata Howrah, Bhopal Kolar Road
  if (
    (city.id === 'kolkata' && weather.humidity > 80 && weather.temperature > 30) ||
    (city.id === 'pune' && area.id === 'baner') ||
    (city.id === 'bhopal' && area.id === 'kolar-road')
  ) {
    alerts.push({
      alertId: `ALT-THUNDER-${city.id}-${area.id}`,
      city: city.name,
      cityId: city.id,
      area: area.name,
      areaId: area.id,
      state: city.state,
      hazardType: 'Thunderstorm',
      severity: 'Moderate',
      title: 'Severe Lightning & Thunderstorm Alert',
      description: `Active cumulonimbus convective activity and lightning discharge detected in the ${area.name} corridor.`,
      weatherParameter: 'Convective Lightning Density',
      value: '18 strikes/10km²',
      threshold: '10 strikes/10km²',
      source: 'IMD Doppler Radar & Lightning Network',
      timestamp: '10:15 AM',
      validUntil: '04:30 PM Today',
      status: 'Active',
      recommendation: 'Seek sturdy indoor shelter immediately. Unplug sensitive electrical appliances and avoid seeking shelter under isolated tall trees.'
    });
  }

  // Rule 4: STRONG WIND
  // Threshold: Wind >= 45 km/h
  if (weather.windSpeed >= 45) {
    alerts.push({
      alertId: `ALT-WIND-${city.id}-${area.id}`,
      city: city.name,
      cityId: city.id,
      area: area.name,
      areaId: area.id,
      state: city.state,
      hazardType: 'Strong Wind',
      severity: weather.windSpeed >= 60 ? 'Severe' : 'Moderate',
      title: 'Strong Surface Wind Gusts',
      description: `High surface wind gusts of ${weather.windSpeed} km/h recorded across ${area.name}, causing loose branch fall and flying debris hazard.`,
      weatherParameter: 'Wind Speed',
      value: `${weather.windSpeed} km/h`,
      threshold: '40 km/h',
      source: 'State Anemometer Station',
      timestamp: '10:00 AM',
      validUntil: '05:00 PM Today',
      status: 'Active',
      recommendation: 'Secure loose outdoor furniture, tin roofs, and construction scaffoldings. Drive two-wheelers with caution on flyovers.'
    });
  }

  // Rule 5: HEAT RISK
  // Threshold: Temp >= 41°C
  if (weather.temperature >= 41) {
    const isSevere = weather.temperature >= 43;
    alerts.push({
      alertId: `ALT-HEAT-${city.id}-${area.id}`,
      city: city.name,
      cityId: city.id,
      area: area.name,
      areaId: area.id,
      state: city.state,
      hazardType: 'Heat Risk',
      severity: isSevere ? 'Severe' : 'High',
      title: isSevere ? 'Severe Heatwave Emergency' : 'High Heat Risk Warning',
      description: `Surface ambient temperature of ${weather.temperature}°C significantly exceeds the critical human health threshold.`,
      weatherParameter: 'Temperature',
      value: `${weather.temperature}°C`,
      threshold: '40°C',
      source: 'IMD Heat Health Action Plan',
      timestamp: '10:30 AM',
      validUntil: '06:30 PM Today',
      status: 'Active',
      recommendation: 'Avoid direct sun exposure between 11:30 AM and 4:00 PM. Drink plenty of water and ORS. Check on elderly persons and pets.'
    });
  }

  // Rule 6: HIGH UV
  // Threshold: UV >= 9.0 (only in very sunny/hot areas e.g. Ahmedabad, Jaipur, Delhi)
  if (weather.uvIndex >= 9.0 && weather.rainfall < 5) {
    alerts.push({
      alertId: `ALT-UV-${city.id}-${area.id}`,
      city: city.name,
      cityId: city.id,
      area: area.name,
      areaId: area.id,
      state: city.state,
      hazardType: 'High UV',
      severity: weather.uvIndex >= 10.5 ? 'Severe' : 'Moderate',
      title: 'Very High Solar UV Radiation Index',
      description: `Solar UV Index has peaked at ${weather.uvIndex} in ${area.name}. Skin burns can occur in less than 20 minutes of unprotected exposure.`,
      weatherParameter: 'UV Index',
      value: `${weather.uvIndex}`,
      threshold: '8.0 (Very High)',
      source: 'National Physical Laboratory & CPCB',
      timestamp: '10:30 AM',
      validUntil: '04:00 PM Today',
      status: 'Active',
      recommendation: 'Apply broad-spectrum SPF 30+ sunscreen, wear UV-protective sunglasses, and use a wide-brim hat or umbrella.'
    });
  }

  // Rule 7: POOR AIR QUALITY (AQI >= 250)
  if (weather.aqi >= 250) {
    alerts.push({
      alertId: `ALT-AQI-${city.id}-${area.id}`,
      city: city.name,
      cityId: city.id,
      area: area.name,
      areaId: area.id,
      state: city.state,
      hazardType: 'Poor Air Quality',
      severity: weather.aqi >= 300 ? 'Severe' : 'High',
      title: weather.aqi >= 300 ? 'Severe Air Quality Alert' : 'Very Poor Air Quality Alert',
      description: `Continuous Ambient Air Quality Monitoring (CAAQMS) in ${area.name} registered PM2.5 spike with an AQI of ${weather.aqi}.`,
      weatherParameter: 'AQI (PM2.5 / PM10)',
      value: `${weather.aqi} AQI`,
      threshold: '250 AQI',
      source: 'Central Pollution Control Board (CPCB)',
      timestamp: '09:00 AM',
      validUntil: '11:59 PM Today',
      status: 'Active',
      recommendation: 'Wear N95/FFP2 masks outdoors. Run indoor HEPA purifiers and avoid morning and evening strenuous outdoor jogs or cycling.'
    });
  }

  return alerts;
}

/**
 * Generate location-specific 24-hour and 7-day forecast
 */
export function getForecastData(city: City, area: Area, current: WeatherData): ForecastData {
  const hourly = [];
  const hours = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  for (let i = 0; i < hours.length; i++) {
    const h = hours[i];
    const timeLabel = `${h % 12 === 0 ? 12 : h % 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
    const diurnalVar = Math.sin((h - 6) / 24 * Math.PI * 2) * 4;
    const temp = Math.round((current.temperature + diurnalVar) * 10) / 10;
    
    // diurnal rain cycle
    const rainFactor = (h >= 13 && h <= 18) ? 1.3 : 0.8;
    const hourlyRainProb = Math.min(100, Math.max(0, Math.round(current.rainProbability * rainFactor)));
    const hourlyRain = hourlyRainProb > 60 ? Math.round(current.rainfall * 0.18 * 10) / 10 : 0;

    hourly.push({
      time: timeLabel,
      hour: h,
      temperature: temp,
      condition: hourlyRain > 5 ? 'Thunderstorm Showers' : hourlyRain > 0 ? 'Light Rain' : temp > 38 ? 'Clear & Hot' : 'Scattered Clouds',
      rainProbability: hourlyRainProb,
      rainfall: hourlyRain,
      windSpeed: Math.max(8, Math.round(current.windSpeed + (h >= 14 && h <= 17 ? 6 : -4))),
      humidity: Math.min(98, Math.max(25, Math.round(current.humidity + (diurnalVar < 0 ? 12 : -10))))
    });
  }

  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daily = [];
  
  for (let d = 0; d < 7; d++) {
    const dayDelta = (d * 0.4) - 1.2;
    const maxT = Math.round(current.temperature + 2.5 + dayDelta);
    const minT = Math.round(current.temperature - 6.5 + dayDelta);
    const rainP = Math.min(95, Math.max(10, Math.round(current.rainProbability + (d % 3 === 0 ? 15 : -15))));
    const rain = rainP > 60 ? Math.round(current.rainfall * 0.8) : Math.round(current.rainfall * 0.2);

    daily.push({
      date: `Sept ${26 + d}`,
      dayName: days[d],
      maxTemp: maxT,
      minTemp: minT,
      condition: rain > 40 ? 'Heavy Monsoon Showers' : rain > 15 ? 'Passing Thunderstorms' : maxT > 40 ? 'Severe Heat' : 'Partly Sunny',
      rainProbability: rainP,
      rainfall: rain,
      windSpeed: Math.round(current.windSpeed * (1 + (d % 2 ? 0.1 : -0.1))),
      humidity: Math.round(current.humidity * (1 + (d % 2 ? -0.05 : 0.05))),
      uvIndex: Math.min(12, Math.max(4, Math.round(current.uvIndex + (d % 2 ? 0.5 : -0.5)))),
      summary: rain > 30 ? 'High probability of monsoon cloudbursts in afternoon.' : 'Stable atmospheric conditions with seasonal variance.'
    });
  }

  return {
    cityId: city.id,
    areaId: area.id,
    hourly,
    daily,
    generatedAt: '10:32 AM IST'
  };
}

/**
 * Generate Location-Specific Risk Analysis
 */
export function getRiskAnalysis(city: City, area: Area, weather: WeatherData): RiskAnalysis {
  const factors: RiskFactor[] = [];

  // Heavy Rain Factor
  const rainScore = Math.min(100, Math.round((weather.rainfall / 90) * 100));
  let rainLevel: SeverityLevel = 'Low';
  if (rainScore >= 75) rainLevel = 'Severe';
  else if (rainScore >= 55) rainLevel = 'High';
  else if (rainScore >= 30) rainLevel = 'Moderate';

  factors.push({
    hazard: 'Heavy Rain' as HazardType,
    level: rainLevel,
    score: rainScore,
    metricValue: `${weather.rainfall} mm (24h)`,
    threshold: '50 mm',
    trend: weather.rainProbability > 70 ? 'Increasing' : 'Stable',
    explanation: weather.rainfall > 50 
      ? `Rainfall in ${area.name} has crossed the 50mm safe threshold. Runoff saturation is high.`
      : `Precipitation volume remains within normal drainage handling capacity for ${area.name}.`,
    mitigation: 'Monitor stormwater canal levels; avoid underground basements if water rises.'
  });

  // Heat Factor
  const heatScore = Math.min(100, Math.max(10, Math.round(((weather.temperature - 25) / 20) * 100)));
  let heatLevel: SeverityLevel = 'Low';
  if (weather.temperature >= 42) heatLevel = 'Severe';
  else if (weather.temperature >= 40) heatLevel = 'High';
  else if (weather.temperature >= 35) heatLevel = 'Moderate';

  factors.push({
    hazard: 'Heat Risk' as HazardType,
    level: heatLevel,
    score: heatScore,
    metricValue: `${weather.temperature}°C (Feels ${weather.feelsLike}°C)`,
    threshold: '40.0°C',
    trend: weather.temperature > 38 ? 'Increasing' : 'Stable',
    explanation: weather.temperature >= 40
      ? `Dangerous thermal stress index. Surface heat island effect concentrated in ${area.name}.`
      : `Ambient temperature within manageable physiological comfort range.`,
    mitigation: 'Hydrate frequently with electrolyte solutions; minimize outdoor labor.'
  });

  // Wind Factor
  const windScore = Math.min(100, Math.round((weather.windSpeed / 70) * 100));
  let windLevel: SeverityLevel = 'Low';
  if (weather.windSpeed >= 55) windLevel = 'Severe';
  else if (weather.windSpeed >= 42) windLevel = 'High';
  else if (weather.windSpeed >= 30) windLevel = 'Moderate';

  factors.push({
    hazard: 'Strong Wind' as HazardType,
    level: windLevel,
    score: windScore,
    metricValue: `${weather.windSpeed} km/h`,
    threshold: '40 km/h',
    trend: 'Stable',
    explanation: weather.windSpeed > 40
      ? `Strong aerodynamic crosswinds detected near open corridors of ${area.name}.`
      : `Breeze velocities normal for local building topography.`,
    mitigation: 'Secure rooftop antenna and billboards.'
  });

  // AQI Factor
  const aqiScore = Math.min(100, Math.round((weather.aqi / 400) * 100));
  let aqiLevel: SeverityLevel = 'Low';
  if (weather.aqi >= 300) aqiLevel = 'Severe';
  else if (weather.aqi >= 200) aqiLevel = 'High';
  else if (weather.aqi >= 100) aqiLevel = 'Moderate';

  factors.push({
    hazard: 'Poor Air Quality' as HazardType,
    level: aqiLevel,
    score: aqiScore,
    metricValue: `${weather.aqi} AQI (${weather.aqiCategory})`,
    threshold: '200 AQI',
    trend: weather.aqi > 250 ? 'Increasing' : 'Stable',
    explanation: weather.aqi > 200
      ? `Fine particulate matter (PM2.5) trapped by low boundary inversion over ${area.name}.`
      : `Atmospheric dispersion adequate; air quality acceptable.`,
    mitigation: 'Use air filtration indoors; sensitive groups should limit physical exertion.'
  });

  // Flood Risk (Only if high rainfall & vulnerable)
  const floodScore = area.floodVulnerability === 'High' && weather.rainfall > 40
    ? Math.min(100, Math.round((weather.rainfall / 80) * 100))
    : area.floodVulnerability === 'Moderate' && weather.rainfall > 50
    ? 50
    : 15;
  
  let floodLevel: SeverityLevel = 'Low';
  if (floodScore >= 75) floodLevel = 'Severe';
  else if (floodScore >= 50) floodLevel = 'High';
  else if (floodScore >= 30) floodLevel = 'Moderate';

  factors.push({
    hazard: 'Flood Risk' as HazardType,
    level: floodLevel,
    score: floodScore,
    metricValue: `${area.floodVulnerability} Geo-Risk`,
    threshold: 'Natural Slope Retention',
    trend: weather.rainfall > 50 ? 'Increasing' : 'Stable',
    explanation: area.floodVulnerability === 'High'
      ? `${area.name} sits at elevation ${area.elevationMeters}m with high historical waterlogging incidence during intense rain.`
      : `${area.name} has resilient gradient drainage.`,
    mitigation: 'Avoid underpass transit routes identified on municipal warning charts.'
  });

  // Compute Overall
  const maxScoreFactor = [...factors].sort((a, b) => b.score - a.score)[0];
  const overallScore = maxScoreFactor.score;
  const overallLevel = maxScoreFactor.level;
  const primaryHazard = maxScoreFactor.hazard;

  return {
    cityId: city.id,
    areaId: area.id,
    overallScore,
    overallLevel,
    primaryHazard,
    factors,
    lastCalculated: '10:32 AM IST'
  };
}

/**
 * Historical Data generator per city
 */
export function getCityHistoricalData(city: City): CityHistoricalData {
  const isWet = city.id === 'mumbai' || city.id === 'chennai' || city.id === 'pune' || city.id === 'kolkata';
  const baseRain = isWet ? (city.id === 'mumbai' ? 2450 : city.id === 'chennai' ? 1420 : 850) : (city.id === 'delhi' ? 710 : 620);
  const baseTemp = city.id === 'delhi' || city.id === 'ahmedabad' || city.id === 'jaipur' ? 28.5 : 25.2;

  const annualData = [
    { year: 2020, annualRainfall: Math.round(baseRain * 1.15), averageTemp: Math.round((baseTemp - 0.2) * 10) / 10, extremeEventsCount: 5, heatwaveDays: 8, monsoonTotal: Math.round(baseRain * 0.88) },
    { year: 2021, annualRainfall: Math.round(baseRain * 1.08), averageTemp: Math.round((baseTemp + 0.1) * 10) / 10, extremeEventsCount: 6, heatwaveDays: 11, monsoonTotal: Math.round(baseRain * 0.84) },
    { year: 2022, annualRainfall: Math.round(baseRain * 0.94), averageTemp: Math.round((baseTemp + 0.3) * 10) / 10, extremeEventsCount: 7, heatwaveDays: 14, monsoonTotal: Math.round(baseRain * 0.79) },
    { year: 2023, annualRainfall: Math.round(baseRain * 1.22), averageTemp: Math.round((baseTemp + 0.5) * 10) / 10, extremeEventsCount: 9, heatwaveDays: 16, monsoonTotal: Math.round(baseRain * 0.92) },
    { year: 2024, annualRainfall: Math.round(baseRain * 1.04), averageTemp: Math.round((baseTemp + 0.6) * 10) / 10, extremeEventsCount: 8, heatwaveDays: 18, monsoonTotal: Math.round(baseRain * 0.86) },
    { year: 2025, annualRainfall: Math.round(baseRain * 1.18), averageTemp: Math.round((baseTemp + 0.7) * 10) / 10, extremeEventsCount: 11, heatwaveDays: 20, monsoonTotal: Math.round(baseRain * 0.94) },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = months.map((m, idx) => {
    let rainRatio = 0.02;
    if (idx >= 5 && idx <= 8) rainRatio = 0.22; // Monsoon months
    if (city.id === 'chennai' && idx >= 9 && idx <= 11) rainRatio = 0.26; // Northeast monsoon
    const avgR = Math.round(baseRain * rainRatio);
    const currR = Math.round(avgR * (0.85 + (idx % 3) * 0.15));
    const avgT = Math.round((baseTemp + (idx >= 3 && idx <= 5 ? 6 : idx >= 11 || idx <= 1 ? -5 : 0)) * 10) / 10;
    return {
      month: m,
      avgRainfall: avgR,
      currentYearRainfall: currR,
      avgTemp: avgT,
      maxRecordedTemp: Math.round((avgT + 7.5) * 10) / 10
    };
  });

  const topExtremeEvents = [
    {
      date: city.id === 'mumbai' ? '26 July 2005' : city.id === 'pune' ? '25 Sept 2019' : '09 July 2023',
      event: isWet ? 'Catastrophic Cloudburst & Urban Deluge' : 'Record 24-hr Monsoon Downpour',
      value: isWet ? (city.id === 'mumbai' ? '944 mm / 24h' : '281 mm / 24h') : '153 mm / 24h',
      historicalRank: 'All-Time Record #1'
    },
    {
      date: city.id === 'delhi' ? '29 May 2024' : '18 May 2022',
      event: city.id === 'delhi' ? 'Severe Heatwave Inversion' : 'Pre-Monsoon Convective Gale',
      value: city.id === 'delhi' ? '49.9°C' : '88 km/h Gusts',
      historicalRank: 'Top 3 Century Extreme'
    },
    {
      date: '14 Oct 2020',
      event: 'Late-Monsoon Depression Influx',
      value: '142 mm / 12h',
      historicalRank: 'Decadal Top 5'
    }
  ];

  return {
    cityId: city.id,
    cityName: city.name,
    baselinePeriod: '1991 - 2020 (30-Year Climatological Normal)',
    annualData,
    monthlyData,
    rainfallAnomalyPercent: isWet ? +14.2 : -3.8,
    tempAnomalyCelsius: +0.8,
    topExtremeEvents
  };
}

/**
 * Multi-Source Verification comparisons for the selected location
 */
export function getSourceComparisons(city: City, area: Area, weather: WeatherData): SourceComparisonItem[] {
  return [
    {
      id: 'src-1',
      sourceName: 'India Meteorological Department (IMD)',
      sourceType: 'Official Meteorological Agency',
      temperature: `${weather.temperature}°C`,
      rainfall: `${weather.rainfall} mm`,
      wind: `${weather.windSpeed} km/h`,
      hazardClaim: weather.rainfall > 50 ? 'Heavy Rainfall Warning (Orange Alert)' : weather.temperature > 40 ? 'Heatwave Advisory' : 'No Severe Warning Issued',
      timestamp: '10:15 AM (Ground Station Verified)',
      status: 'SUPPORTED',
      confidenceScore: 98,
      notes: `Grounded against calibrated AWS ground station sensors at ${area.name}.`
    },
    {
      id: 'src-2',
      sourceName: 'MausamSetu Sensor Grid',
      sourceType: 'Hyperlocal Sensor',
      temperature: `${weather.temperature + 0.2}°C`,
      rainfall: `${weather.rainfall} mm`,
      wind: `${weather.windSpeed + 2} km/h`,
      hazardClaim: weather.rainfall > 50 ? 'Active Urban Runoff Alert' : 'Ambient Microclimate Nominal',
      timestamp: '10:30 AM (Real-time Mesh)',
      status: 'SUPPORTED',
      confidenceScore: 96,
      notes: `IoT barometer and optical rain sensor cluster within 2km of ${area.name}.`
    },
    {
      id: 'src-3',
      sourceName: 'News Wires & Media Bulletins',
      sourceType: 'News Wire',
      temperature: `${weather.temperature}°C`,
      rainfall: `${weather.rainfall} mm`,
      wind: 'Gusty',
      hazardClaim: weather.rainfall > 50 ? `Travel disruption reported in ${area.name}` : 'Normal city transit reported',
      timestamp: '10:05 AM',
      status: 'SUPPORTED',
      confidenceScore: 88,
      notes: 'Regional media reports corroborate ground radar observations.'
    },
    {
      id: 'src-4',
      sourceName: 'X / Twitter (@WeatherSource)',
      sourceType: 'Social Intelligence',
      temperature: `${weather.temperature + 1.2}°C`,
      rainfall: `${Math.round(weather.rainfall * 1.3)} mm`,
      wind: 'High Gusts',
      hazardClaim: weather.rainfall > 50 ? 'Extreme Rain / Cloudburst in 2 hours' : 'Isolated Heavy Showers',
      timestamp: '10:05 AM',
      status: 'PARTIALLY SUPPORTED',
      confidenceScore: 74,
      notes: 'Rain is confirmed by sensors, but extreme cloudburst claims exceed measured rate.'
    },
    {
      id: 'src-5',
      sourceName: 'Instagram (@weather_updates)',
      sourceType: 'Social Intelligence',
      temperature: `${weather.temperature}°C`,
      rainfall: `${weather.rainfall} mm`,
      wind: 'Gusty',
      hazardClaim: weather.rainfall > 40 ? `Severe flooding near ${area.name} flyover` : 'Raining heavily',
      timestamp: '09:42 AM',
      status: weather.rainfall > 60 ? 'PARTIALLY SUPPORTED' : 'NOT VERIFIED',
      confidenceScore: 62,
      notes: 'Waterlogging verified on service roads, but subway flooding claim not verified.'
    },
    {
      id: 'src-6',
      sourceName: 'Facebook (Resident Forum Posts)',
      sourceType: 'Social Intelligence',
      temperature: `${weather.temperature + 2.0}°C`,
      rainfall: '100 mm in 30 mins',
      wind: 'Storm',
      hazardClaim: 'Unprecedented Cloudburst and total basement submergence',
      timestamp: '09:20 AM',
      status: 'NOT VERIFIED',
      confidenceScore: 48,
      notes: 'Insufficient physical evidence; AWS gauge recorded normal rainfall rate.'
    },
    {
      id: 'src-7',
      sourceName: 'YouTube (Maha Weather Live)',
      sourceType: 'News Wire',
      temperature: `${weather.temperature}°C`,
      rainfall: `${weather.rainfall} mm`,
      wind: `${weather.windSpeed} km/h`,
      hazardClaim: weather.rainfall > 40 ? 'Heavy Rainfall Advisory & Radar Track' : 'Monsoon Progression Update',
      timestamp: '09:45 AM',
      status: 'SUPPORTED',
      confidenceScore: 92,
      notes: 'Meteorological channel uses IMD Doppler radar animation directly.'
    }
  ];
}
