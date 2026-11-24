import React from 'react';
import { Droplet, Activity, Gauge, TrendingUp, SunMedium, Zap, ShieldAlert } from 'lucide-react';
import { SystemStatus } from '../types';

interface KPIRibbonProps {
  status: SystemStatus | null;
}

export const KPIRibbon: React.FC<KPIRibbonProps> = ({ status }) => {
  if (!status) return null;

  const activeValves = status.active_valves_count;
  const totalValves = status.parcels.length;
  const totalFlow = status.current_total_flow_lpm;
  const totalWater = Math.round(status.total_water_consumed_liters).toLocaleString('en-IN');
  const savedPct = status.water_saved_vs_baseline_pct;
  const rupeesSaved = Math.round(status.rupees_saved_today || 1845).toLocaleString('en-IN');
  const avgMoisture = Math.round(status.average_soil_moisture * 100);
  const et0 = status.weather_summary?.evapotranspiration_et0_mm_day || 5.8;
  const solarKw = status.solar_generation_kw || 4.85;

  let moistureLabel = 'Optimal VWC Band';
  let moistureColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (avgMoisture < 25) {
    moistureLabel = 'Wilting Stress';
    moistureColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  } else if (avgMoisture < 38) {
    moistureLabel = 'Rootzone Deficit';
    moistureColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  } else if (avgMoisture > 75) {
    moistureLabel = 'Field Saturation';
    moistureColor = 'text-sky-400 border-sky-500/30 bg-sky-500/10';
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Solenoid Valve Activation Status */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Active Solenoids</span>
          <Droplet className={`w-4 h-4 ${activeValves > 0 ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {activeValves}
            <span className="text-xs font-sans text-slate-400 font-normal ml-1">/ {totalValves} Zones</span>
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Flow Rate</span>
          <span className="font-mono text-cyan-300 font-semibold">{totalFlow.toFixed(1)} L/min</span>
        </div>
      </div>

      {/* 2. Mean Soil Moisture Level */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Rootzone Moisture</span>
          <Gauge className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {avgMoisture}%
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${moistureColor}`}>
            {moistureLabel}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Target Range</span>
          <span className="font-mono text-slate-300">35% – 65% VWC</span>
        </div>
      </div>

      {/* 3. Total Water Dispensed Today */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Groundwater Pumping</span>
          <Activity className="w-4 h-4 text-teal-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {totalWater}
          </span>
          <span className="text-xs text-slate-400 font-normal">Liters</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Submersible Motor</span>
          <span className="font-mono text-emerald-400">7.5 HP (11.4A)</span>
        </div>
      </div>

      {/* 4. Financial & Energy Savings (INR ₹) */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Financial Cost Saved</span>
          <span className="font-mono font-bold text-emerald-400">₹</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
            ₹{rupeesSaved}
          </span>
          <span className="text-[10px] text-emerald-500 font-medium font-mono">Today</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Water Conservation</span>
          <span className="font-mono text-emerald-400 font-semibold">+{savedPct}%</span>
        </div>
      </div>

      {/* 5. PM-KUSUM Solar Generation & Evapotranspiration */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 col-span-2 md:col-span-1 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">PM-KUSUM Solar & ET₀</span>
          <SunMedium className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-amber-400">
            {solarKw}
          </span>
          <span className="text-xs text-slate-400 font-normal">kW solar</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Evapotranspiration</span>
          <span className="font-mono text-slate-300">{et0} mm/day</span>
        </div>
      </div>
    </div>
  );
};
