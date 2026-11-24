import React from 'react';
import { 
  CloudSun, 
  Droplet, 
  Wind, 
  Sun, 
  Compass, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { WeatherCondition, ForecastDay } from '../types';

interface WeatherWidgetProps {
  current: WeatherCondition | null;
  forecast: ForecastDay[];
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ current, forecast }) => {
  if (!current) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-amber-400" />
            IMD Agromet Agro-Meteorological Station
          </h3>
          <p className="text-xs text-slate-400">
            {current.station} • {current.location}
          </p>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{current.smart_irrigation_recommendation.split(' - ')[0]}</span>
        </div>
      </div>

      {/* IMD Gramin Krishi Mausam Seva (GKMS) Bulletin */}
      {current.kisan_advisory && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px] mb-1">
            <FileText className="w-3.5 h-3.5" />
            IMD Gramin Krishi Mausam Seva (GKMS) Kisan Advisory Bulletin
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {current.kisan_advisory}
          </p>
        </div>
      )}

      {/* Primary Current Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
          <span className="text-[11px] text-slate-400 block mb-0.5">Air Temperature</span>
          <span className="text-xl font-bold font-mono text-white">
            {current.temperature_c}°C{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">({current.temperature_f}°F)</span>
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
          <span className="text-[11px] text-slate-400 block mb-0.5">Evapotranspiration (ET₀)</span>
          <span className="text-xl font-bold font-mono text-amber-400">
            {current.evapotranspiration_et0_mm_day}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">mm/day</span>
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
          <span className="text-[11px] text-slate-400 block mb-0.5">Wind & Direction</span>
          <span className="text-xl font-bold font-mono text-cyan-300">
            {current.wind_speed_kmh}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">km/h {current.wind_direction}</span>
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
          <span className="text-[11px] text-slate-400 block mb-0.5">Solar Radiation</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {current.solar_radiation_wm2}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">W/m²</span>
          </span>
        </div>
      </div>

      {/* 5-Day Agronomic Forecast Cards */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          5-Day Indian Agro-Climatic Outlook & Monsoon Rain Risk
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {forecast.map(day => (
            <div
              key={day.day_offset}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200">{day.label}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{day.date}</span>
                </div>
                <div className="text-sm font-semibold text-white my-1">
                  {day.temp_high_c}° / <span className="text-slate-400 text-xs font-normal">{day.temp_low_c}°C</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2 truncate" title={day.condition}>
                  {day.condition}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-900 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Rain Risk:</span>
                  <span className={`font-mono font-medium ${day.precipitation_probability_pct > 50 ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {day.precipitation_probability_pct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>ET₀:</span>
                  <span className="font-mono font-medium text-amber-300">{day.et0_mm} mm</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium truncate pt-1" title={day.agronomic_advice}>
                  {day.agronomic_advice}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
