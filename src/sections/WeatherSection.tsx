import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CityLocation, CONGO_CITIES } from '../services/weatherService';
import {
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  ShieldAlert,
  Compass,
  MapPin,
  Search,
  RotateCw,
  Sparkles,
  Zap,
} from 'lucide-react';

export const WeatherSection: React.FC = () => {
  const {
    weatherData,
    availableCities,
    selectedCityName,
    changeCity,
    searchCities,
    refreshWeather,
    isWeatherLoading,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const getWeatherIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-sky-400`} />;
      case 'cloud':
        return <Cloud className={`${className} text-slate-300`} />;
      case 'wind':
        return <Wind className={`${className} text-cyan-300`} />;
      case 'thunderstorm':
        return <Zap className={`${className} text-amber-400`} />;
      default:
        return <CloudSun className={`${className} text-amber-300`} />;
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      setIsSearching(true);
      const results = await searchCities(q);
      setSearchResults(results);
      setIsSearching(false);
      setSearchOpen(true);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  const handleSelectSearchedCity = async (city: CityLocation) => {
    await changeCity(city);
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-6 animate-fade-in">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white font-brand">NOVA MÉTÉO</h2>
          </div>
          <p className="text-xs text-sky-300/90 font-medium">
            Congo-Brazzaville & Climat Mondial en direct
          </p>
        </div>

        <button
          onClick={() => refreshWeather()}
          disabled={isWeatherLoading}
          className="p-2 rounded-xl bg-slate-900/80 border border-sky-500/30 text-sky-300 hover:text-white active:scale-95 transition-all shadow-sm"
          title="Actualiser la météo en direct"
        >
          <RotateCw className={`w-4 h-4 ${isWeatherLoading ? 'animate-spin text-[#00F0FF]' : ''}`} />
        </button>
      </div>

      {/* Worldwide City Search Bar */}
      <div className="relative z-30">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-sky-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Rechercher n'importe quelle ville du monde..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 text-white rounded-2xl border border-sky-500/30 focus:border-[#00F0FF] focus:outline-none text-xs placeholder-slate-400 shadow-inner"
          />
          {isSearching && (
            <div className="absolute right-3">
              <Sparkles className="w-4 h-4 text-[#00F0FF] animate-spin" />
            </div>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-12 bg-[#071330] border border-sky-500/40 rounded-2xl p-2 shadow-2xl z-40 max-h-56 overflow-y-auto no-scrollbar space-y-1">
            <span className="text-[10px] font-mono uppercase text-sky-400 px-2 py-0.5 block">
              Villes trouvées dans le monde
            </span>
            {searchResults.map((r, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSearchedCity(r)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-sky-500/20 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-xs font-semibold text-white">{r.name}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {r.admin1 ? `${r.admin1}, ` : ''}{r.country}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Congo-Brazzaville Cities Quick Selector */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider font-brand">
            Villes du Congo-Brazzaville
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Par défaut : Pointe-Noire</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {availableCities.map((c) => {
            const isSelected = selectedCityName === c.name;
            return (
              <button
                key={c.name}
                onClick={() => changeCity(c)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#1677FF] text-white shadow-[0_0_15px_#1677FF] border border-sky-300/40'
                    : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <MapPin className="w-3 h-3 text-sky-300" />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Meteorological Card */}
      <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#0c2657]/80 via-[#071738]/90 to-[#020b1f] border border-sky-400/30 shadow-[0_10px_35px_rgba(22,119,255,0.2)]">
        <div className="absolute top-0 right-0 w-44 h-44 bg-sky-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 text-xs text-sky-300 font-mono tracking-wider uppercase mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{weatherData.city}</span>
          </div>

          <div className="my-2 flex items-center justify-center">
            {getWeatherIcon(weatherData.iconName, 'w-16 h-16')}
          </div>

          {/* Real Temperature in Celsius */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-black text-white font-brand tracking-tighter">
              {weatherData.temp}°
            </span>
            <span className="text-base font-semibold text-sky-300">C</span>
          </div>

          <h3 className="text-base font-bold text-slate-100 mt-1 font-brand">
            {weatherData.condition}
          </h3>

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-300 font-mono">
            <span>Max : {weatherData.high}°C</span>
            <span>·</span>
            <span>Min : {weatherData.low}°C</span>
            <span>·</span>
            <span>Ressenti : {weatherData.feelsLike}°C</span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono mt-2">
            Mise à jour Open-Meteo : {weatherData.lastUpdated || 'En temps réel'}
          </span>
        </div>
      </div>

      {/* Hourly Timeline */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-brand">
          Prévisions Heure par Heure (Aujourd'hui)
        </h4>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {weatherData.hourly.map((h, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-between p-2.5 min-w-[68px] rounded-2xl bg-slate-950/70 border border-sky-500/15"
            >
              <span className="text-[11px] text-slate-400 font-mono">{h.time}</span>
              <div className="my-1.5">{getWeatherIcon(h.icon, 'w-6 h-6')}</div>
              <span className="text-xs font-bold text-white">{h.temp}°C</span>
            </div>
          ))}
        </div>
      </div>

      {/* Atmospheric Metrics Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 px-0.5 font-brand">
          Indicateurs Atmosphériques
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Air Quality */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400">Qualité de l'Air</span>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-emerald-400 block">{weatherData.airQuality}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Respiration saine</span>
          </div>

          {/* Wind */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400">Vent & Brise</span>
              <Wind className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-sm font-bold text-white block">{weatherData.wind} km/h</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Alizé de l'Atlantique</span>
          </div>

          {/* Humidity */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400">Humidité</span>
              <Droplets className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-sm font-bold text-white block">{weatherData.humidity}%</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Humidité tropicale</span>
          </div>

          {/* UV Index */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400">Indice UV</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-sm font-bold text-amber-400 block">{weatherData.uv} / 10</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Soleil équatorial</span>
          </div>
        </div>
      </div>

      {/* 5-day daily forecast table */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-brand">
          Prévisions de la Semaine
        </h4>

        <div className="space-y-2">
          {weatherData.daily.map((d, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/60"
            >
              <span className="text-xs font-semibold text-slate-200 w-24">{d.day}</span>
              <div className="flex items-center gap-2 flex-1 justify-center">
                {getWeatherIcon(d.icon, 'w-4 h-4')}
                <span className="text-[11px] text-slate-300">{d.condition}</span>
              </div>
              <div className="text-xs font-mono text-right w-20">
                <span className="font-bold text-white">{d.high}°</span>
                <span className="text-slate-500 ml-1.5">{d.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
